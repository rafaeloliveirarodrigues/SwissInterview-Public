import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PRIVACY_POLICY_VERSION } from "./privacy";

/** Returns the consent state and records that the user is active (for inactivity cleanup). */
export const getConsentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const now = new Date().toISOString();
    const { data } = await context.supabase
      .from("profiles")
      .select("privacy_policy_version, privacy_consent_at")
      .eq("id", context.userId)
      .maybeSingle();
    if (data) {
      await context.supabase.from("profiles").update({ last_active_at: now }).eq("id", context.userId);
    } else {
      const email = (context.claims as { email?: string }).email ?? null;
      await context.supabase.from("profiles").insert({ id: context.userId, email, last_active_at: now });
    }
    return {
      version: data?.privacy_policy_version ?? null,
      consentAt: data?.privacy_consent_at ?? null,
      current: PRIVACY_POLICY_VERSION,
    };
  });

export const recordPrivacyConsent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        privacy_consent_at: new Date().toISOString(),
        privacy_policy_version: PRIVACY_POLICY_VERSION,
      })
      .eq("id", context.userId);
    if (error) throw new Error("Could not save your consent. Please try again.");
    return { ok: true, version: PRIVACY_POLICY_VERSION };
  });

export const getMediaConsent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sessionId: string }) => ({ sessionId: String(input.sessionId) }))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("interview_sessions")
      .select("media_consent_at")
      .eq("id", data.sessionId)
      .maybeSingle();
    if (error || !row) throw new Error("Interview not found.");
    return { consentAt: row.media_consent_at };
  });

export const recordMediaConsent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sessionId: string }) => ({ sessionId: String(input.sessionId) }))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("interview_sessions")
      .update({ media_consent_at: new Date().toISOString() })
      .eq("id", data.sessionId)
      .select("media_consent_at")
      .maybeSingle();
    if (error || !row) throw new Error("Could not save your consent. Please try again.");
    return { consentAt: row.media_consent_at };
  });

/** Everything stored about the signed-in user, as one JSON document. */
export const exportMyData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = context.supabase;
    const uid = context.userId;
    const pick = async (table: string, column = "user_id") => {
      const { data, error } = await db.from(table as "preps").select("*").eq(column as "user_id", uid);
      if (error) throw new Error("Could not export your data. Please try again.");
      return data ?? [];
    };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: coffee } = await supabaseAdmin
      .from("coffee_payments")
      .select("created_at, email")
      .eq("matched_user_id", uid);
    return {
      exported_at: new Date().toISOString(),
      privacy_policy_version: PRIVACY_POLICY_VERSION,
      account: { id: uid, email: (context.claims as { email?: string }).email ?? null },
      profile: (await pick("profiles", "id"))[0] ?? null,
      interview_credits: (await pick("interview_credits"))[0] ?? null,
      preps: await pick("preps"),
      interview_sessions: await pick("interview_sessions"),
      interview_turns: await pick("interview_turns"),
      question_practice: await pick("question_practice"),
      reference_reviews: await pick("reference_reviews"),
      rav_applications: await pick("rav_applications"),
      promo_redemptions: await pick("promo_redemptions"),
      coffee_payments: coffee ?? [],
    };
  });
