import { NextResponse } from 'next/server';

const BASE_URL = "https://api.xgateglobal.com";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, document, phone, notValidationDuplicated } = body;

        if (!name || !document) {
            return NextResponse.json({ error: 'Nome e Documento são obrigatórios' }, { status: 400 });
        }

        const payload: any = {
            name,
            document: document.replace(/\D/g, '')
        };
        if (email) payload.email = email;
        if (phone) payload.phone = phone.replace(/\D/g, '');
        if (notValidationDuplicated) payload.notValidationDuplicated = true;

        // Auth
        const authRes = await fetch(`${BASE_URL}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: process.env.XGATE_EMAIL, password: process.env.XGATE_PASSWORD }),
        });
        const { token } = await authRes.json();
        if (!token) return NextResponse.json({ error: 'XGate auth failed' }, { status: 500 });

        // Create Customer
        console.log(`[xgate-create-customer] Payload:`, payload);
        const res = await fetch(`${BASE_URL}/customer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload),
        });

        const resBody = await res.json().catch(() => ({}));

        return NextResponse.json({
            ok: res.ok,
            http_status: res.status,
            payload_sent: payload,
            xgate_response: resBody,
        });

    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}
