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
        body: JSON.stringify({ email: process.env.XGATE_EMAIL, password: process.env.XGATE_PASSWORD }),
    });
    const data = await res.json();
    if (!data.token) throw new Error('XGate auth failed');
    return data.token;
}

export async function POST() {
    const results: any[] = [];

    try {
        // ── Fetch all users that have a xgate_customer_id ──────────────────
        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name, phone, document, xgate_customer_id')
            .not('xgate_customer_id', 'is', null);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (!users || users.length === 0) {
            return NextResponse.json({ message: 'Nenhum usuário com xgate_customer_id encontrado.', results: [] });
        }

        // ── Authenticate once ───────────────────────────────────────────────
        const token = await xgateLogin();

        // ── Sync each user ──────────────────────────────────────────────────
        for (const user of users) {
            const cpf = (user.document || '').replace(/\D/g, '');
            const customerId = user.xgate_customer_id;

            if (!cpf || !customerId) {
                results.push({ email: user.email, status: 'skipped', reason: !cpf ? 'sem CPF' : 'sem xgate_customer_id' });
                continue;
            }

            const payload: Record<string, string> = { document: cpf };
            if (user.full_name) payload.name = user.full_name;
            if (user.email) payload.email = user.email;
            if (user.phone) payload.phone = user.phone;

            try {
                const res = await fetch(`${BASE_URL}/customer/${customerId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload),
                });
                const body = await res.json().catch(() => ({}));

                if (res.ok) {
                    results.push({ email: user.email, customerId, status: 'synced', xgate: body.message });
                } else if (res.status === 400 && body.message?.includes('documento')) {
                    // CPF already locked — means it was already set correctly or cannot be changed
                    results.push({ email: user.email, customerId, status: 'locked', note: 'CPF já definido e bloqueado na XGate' });
                } else {
                    results.push({ email: user.email, customerId, status: 'error', code: res.status, xgate: body.message || JSON.stringify(body) });
                }
            } catch (e: any) {
                results.push({ email: user.email, customerId, status: 'error', error: e.message });
            }

            // Small delay to avoid rate-limiting
            await new Promise(r => setTimeout(r, 300));
        }

        const synced = results.filter(r => r.status === 'synced').length;
        const locked = results.filter(r => r.status === 'locked').length;
        const errors = results.filter(r => r.status === 'error').length;
        const skipped = results.filter(r => r.status === 'skipped').length;

        return NextResponse.json({
            total: users.length,
            synced,
            locked,
            errors,
            skipped,
            results,
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message, results }, { status: 500 });
    }
}
