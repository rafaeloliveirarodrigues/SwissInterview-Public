import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const payloadSchema = z.object({
  type: z.string(),
  data: z
    .object({
      id: z.union([z.string(), z.number()]).optional(),
      supporter_email: z.string().email().optional().nullable(),
      payer_email: z.string().email().optional().nullable(),
    })
    .passthrough(),
});

async function hmacHex(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export const Route = createFileRoute("/api/public/bmc-webhook")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["BMC_WEBHOOK_SECRET"];
        if (!secret) return new Response("Not configured", { status: 503 });

        const body = await request.text();
        const signature = (request.headers.get("x-signature-sha256") ?? "").toLowerCase();
        if (!signature || !safeEqual(signature, await hmacHex(secret, body))) {
          return new Response("Invalid signature", { status: 401 });
        }

        let parsed;
        try {
          parsed = payloadSchema.parse(JSON.parse(body));
        } catch {
          return new Response("Bad payload", { status: 400 });
        }
        if (!/^(donation\.created|recurring_donation\.started|membership\.started|extra_purchase\.created)$/.test(parsed.type)) {
          return new Response("ignored");
        }

        const email = (parsed.data.supporter_email ?? parsed.data.payer_email ?? "").toLowerCase();
        const eventId = `${parsed.type}:${parsed.data.id ?? crypto.randomUUID()}`;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { afterCoffee } = await import("@/lib/swiss-cv");

        // Match only against the verified sign-in email (auth.users), never the
        // user-editable profile email, so nobody can claim another supporter's payment.
        let profile: { id: string } | null = null;
        if (email) {
          const { data: uid } = await supabaseAdmin.rpc("find_confirmed_user_by_email", { _email: email });
          if (uid) profile = { id: uid as string };
        }

        const { error: dup } = await supabaseAdmin
          .from("coffee_payments")
          .insert({ event_id: eventId, email: email || null, matched_user_id: profile?.id ?? null });
        if (dup) return new Response("ok"); // already processed

        if (profile) {
          const { data: row } = await supabaseAdmin
            .from("interview_credits")
            .select("remaining")
            .eq("user_id", profile.id)
            .maybeSingle();
          await supabaseAdmin
            .from("interview_credits")
            .upsert({ user_id: profile.id, remaining: afterCoffee(row?.remaining ?? 0), updated_at: new Date().toISOString() });
        }
        return new Response("ok");
      },
    },
  },
});
