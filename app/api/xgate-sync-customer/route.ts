import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = "https://api.xgateglobal.com";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function xgateLogin(): Promise<string> {
    const res = await fetch(`${BASE_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: process.env.XGATE_EMAIL,
            password: process.env.XGATE_PASSWORD,
        }),
    });
    if (!res.ok) throw new Error(`XGate auth failed: ${res.statusText}`);
    const data = await res.json();
    if (!data.token) throw new Error('XGate auth returned no token');
    return data.token;
}

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();
        if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

        // ── Fetch user ──────────────────────────────────────────────────────
        const { data: user, error: userErr } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email, phone, document, xgate_customer_id')
            .eq('id', userId)
            .single();

        if (userErr || !user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        const customerId = user.xgate_customer_id;
        if (!customerId) {
            return NextResponse.json({
                ok: false,
                skipped: true,
                reason: 'Usuário ainda não tem xgate_customer_id. Será criado no primeiro depósito.',
            });
        }

        const cpf = (user.document || '').replace(/\D/g, '');
        if (!cpf) {
            return NextResponse.json({ error: 'CPF não cadastrado no perfil' }, { status: 400 });
        }

        // ── Authenticate ────────────────────────────────────────────────────
        const token = await xgateLogin();

        // ── Build update payload — only send fields that exist ──────────────
        const updatePayload: Record<string, string> = {
            document: cpf,
        };
        if (user.full_name) updatePayload.name = user.full_name;
        if (user.email) updatePayload.email = user.email;
        if (user.phone) updatePayload.phone = user.phone;

        console.log(`[xgate-sync-customer] PUT /customer/${customerId}`, JSON.stringify(updatePayload));

        // ── Call XGate PUT /customer/{id} ───────────────────────────────────
        const res = await fetch(`${BASE_URL}/customer/${customerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatePayload),
        });

        const resBody = await res.json().catch(() => ({}));
        console.log(`[xgate-sync-customer] Response ${res.status}:`, JSON.stringify(resBody));

        if (!res.ok) {
            // 400 "Não é possível alterar o documento de um cliente que já possou um documento válido"
            // means the CPF is already locked — that's actually OK, means it's set correctly
            if (res.status === 400 && resBody.message?.includes('documento')) {
                return NextResponse.json({
                    ok: true,
                    message: 'CPF já está bloqueado na XGate (documento válido cadastrado — não pode ser alterado).',
                    xgate_response: resBody,
                });
            }
            return NextResponse.json({
                ok: false,
                error: resBody.message || `XGate error ${res.status}`,
                xgate_response: resBody,
            }, { status: 200 }); // 200 so client doesn't retry blindly
        }

        return NextResponse.json({
            ok: true,
            message: 'Dados sincronizados com XGate com sucesso.',
            xgate_response: resBody,
        });

    } catch (err: any) {
        console.error('[xgate-sync-customer] Error:', err.message);
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}
