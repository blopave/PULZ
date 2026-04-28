import "@supabase/functions-js/edge-runtime.d.ts";
import { WELCOME_HTML } from "./_template.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");
const FROM_EMAIL = "PULZ <noreply@pulz.run>";
const SUBJECT = "Ya sos parte de PULZ";

Deno.serve(async (req: Request): Promise<Response> => {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    const auth = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!WEBHOOK_SECRET || auth !== `Bearer ${WEBHOOK_SECRET}`) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!RESEND_API_KEY) {
        return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    let payload: any;
    try {
        payload = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: "invalid json" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const record = payload.record;
    const oldRecord = payload.old_record;

    const justConfirmed =
        record?.email_confirmed_at && !oldRecord?.email_confirmed_at;

    if (!justConfirmed) {
        return new Response(
            JSON.stringify({ skipped: true, reason: "not first confirmation" }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    }

    const email = record.email;
    if (!email) {
        return new Response(JSON.stringify({ error: "no email in record" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: FROM_EMAIL,
            to: email,
            subject: SUBJECT,
            html: WELCOME_HTML,
        }),
    });

    if (!resendRes.ok) {
        const errText = await resendRes.text();
        return new Response(
            JSON.stringify({ error: "resend failed", status: resendRes.status, details: errText }),
            { status: 502, headers: { "Content-Type": "application/json" } },
        );
    }

    const data = await resendRes.json();
    return new Response(
        JSON.stringify({ ok: true, id: data.id, to: email }),
        { status: 200, headers: { "Content-Type": "application/json" } },
    );
});
