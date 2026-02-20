import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const BASE_URL = "https://api.xgateglobal.com";

async function xgateLogin() {
    const email = process.env.XGATE_EMAIL;
    const password = process.env.XGATE_PASSWORD;
    if (!email || !password) throw new Error("XGATE_EMAIL or XGATE_PASSWORD not configured");

    const res = await fetch(`${BASE_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`XGate auth failed: ${err.message || res.statusText}`);
    }
    const data = await res.json();
    return data.token as string;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, userId, pixKey, pixKeyType } = body;

        // ── Validate inputs ──────────────────────────────────────────────────
        if (!amount || amount < 20) {
            return NextResponse.json({ error: 'Valor mínimo de saque: R$ 20,00' }, { status: 400 });
        }
        if (!pixKey) {
            return NextResponse.json({ error: 'Chave PIX obrigatória' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) { return cookieStore.get(name)?.value; },
                    set() { },
                    remove() { },
                }
            }
        );

        // ── Fetch & validate user ────────────────────────────────────────────
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
        }

        if (!userData.document || userData.document.trim() === '') {
            return NextResponse.json({
                error: 'CPF obrigatório: Adicione seu CPF no Perfil antes de sacar.'
            }, { status: 400 });
        }

        const FEE = 2.90;
        const totalDeduction = amount + FEE;

        if ((userData.balance || 0) < totalDeduction) {
            return NextResponse.json({
                error: `Saldo insuficiente. Para sacar R$ ${amount.toFixed(2)} você precisa de R$ ${totalDeduction.toFixed(2)} (incluindo taxa de R$ ${FEE.toFixed(2)}).`
            }, { status: 400 });
        }

        // ── XGate: authenticate ──────────────────────────────────────────────
        const token = await xgateLogin();

        // ── XGate: get BRL withdraw currency ─────────────────────────────────
        const curRes = await fetch(`${BASE_URL}/withdraw/company/currencies`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!curRes.ok) throw new Error('Falha ao buscar moedas de saque na XGate');
        const currencies = await curRes.json();
        const brl = Array.isArray(currencies)
            ? currencies.find((c: any) => c.name === 'BRL' || c.symbol === 'R$' || c.type === 'PIX')
            : null;
        if (!brl) throw new Error(`BRL não encontrado nas moedas de saque. Disponíveis: ${JSON.stringify(currencies)}`);

        // ── XGate: submit withdrawal ──────────────────────────────────────────
        const withdrawPayload = {
            amount,
            currency: brl,
            customer: {
                name: userData.full_name || 'Cliente Predity',
                email: userData.email || 'email@predity.com',
                document: userData.document,
                phone: userData.phone || undefined,
            },
            // PIX destination key
            pixKey,
            pixKeyType: pixKeyType || 'CPF', // CPF | CNPJ | EMAIL | PHONE | RANDOM
        };

        console.log('[xgate-withdraw] Submitting:', JSON.stringify(withdrawPayload));

        const withdrawRes = await fetch(`${BASE_URL}/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(withdrawPayload),
        });

        const withdrawData = await withdrawRes.json().catch(() => ({}));
        console.log('[xgate-withdraw] Response:', JSON.stringify(withdrawData));

        if (!withdrawRes.ok) {
            return NextResponse.json({
                error: withdrawData.message || `XGate rejection (${withdrawRes.status}): ${JSON.stringify(withdrawData)}`
            }, { status: 500 });
        }

        // ── Deduct balance + log transaction ─────────────────────────────────
        const { error: balanceError } = await supabase.rpc('decrement_balance', {
            userid: userId,
            amount: totalDeduction
        });

        if (balanceError) {
            // Fallback direct update
            await supabase
                .from('users')
                .update({ balance: (userData.balance || 0) - totalDeduction })
                .eq('id', userId);
        }

        const externalId = withdrawData?.data?.id || withdrawData?.id || withdrawData?._id || 'unknown';

        await supabase.from('transactions').insert({
            user_id: userId,
            type: 'WITHDRAW',
            amount,
            status: 'PENDING',
            description: `Saque PIX (XGate) — taxa R$ ${FEE.toFixed(2)}`,
            metadata: { xgate_id: externalId, pix_key: pixKey, fee: FEE }
        });

        return NextResponse.json({
            success: true,
            message: `Saque de R$ ${amount.toFixed(2)} solicitado com sucesso! Processamento em até 24h.`,
            externalId,
            fee: FEE,
            netAmount: amount,
            totalDeducted: totalDeduction,
        });

    } catch (error: any) {
        console.error('[xgate-withdraw] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
