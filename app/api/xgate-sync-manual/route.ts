import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = "https://api.xgateglobal.com";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
    try {
        const { xgateCustomerId, userId, name, email, document, phone } = await req.json();

        if (!xgateCustomerId) return NextResponse.json({ error: 'xgateCustomerId é obrigatório' }, { status: 400 });

        // If userId is provided, pull real data from DB
        let payload: Record<string, string> = {};
        if (userId) {
            const { data: user } = await supabaseAdmin
                .from('users')
                .select('full_name, email, phone, document')
                .eq('id', userId)
                .single();
            if (user) {
                const cpf = (user.document || '').replace(/\D/g, '');
                if (cpf) payload.document = cpf;
                if (user.full_name) payload.name = user.full_name;
                if (user.email) payload.email = user.email;
                if (user.phone) payload.phone = user.phone;
            }
        }

        // Manual overrides from request body take precedence
        if (document) payload.document = document.replace(/\D/g, '');
        if (name) payload.name = name;
        if (email) payload.email = email;
        if (phone) payload.phone = phone;

        if (!payload.document) {
            return NextResponse.json({ error: 'CPF (document) é obrigatório no payload ou no perfil do usuário' }, { status: 400 });
        }

        // Authenticate
        const authRes = await fetch(`${BASE_URL}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: process.env.XGATE_EMAIL, password: process.env.XGATE_PASSWORD }),
        });
        const authData = await authRes.json();
        if (!authData.token) return NextResponse.json({ error: 'XGate auth failed', detail: authData }, { status: 500 });

        // Call PUT /customer/{id}
        const res = await fetch(`${BASE_URL}/customer/${xgateCustomerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authData.token}` },
            body: JSON.stringify(payload),
        });

        const resBody = await res.json().catch(() => ({}));

        return NextResponse.json({
            ok: res.ok,
            http_status: res.status,
            xgate_customer_id: xgateCustomerId,
            payload_sent: payload,
            xgate_response: resBody,
        });

    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}
