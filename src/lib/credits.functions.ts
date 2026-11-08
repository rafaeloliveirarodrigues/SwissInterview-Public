import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const LIMIT_REACHED = "LIMIT_REACHED";

export const getCredits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("get_interview_credits");
    if (error) throw new Error("Could not load your interview balance.");
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { remaining: (data as number) ?? 0, isAdmin: !!isAdmin };
  });

export const redeemPromo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => {
    const code = typeof input?.code === "string" ? input.code.trim() : "";
    if (!/^[A-Za-z0-9_-]{3,40}$/.test(code)) throw new Error("This code is not valid.");
    return { code };
  })
  .handler(async ({ data, context }) => {
    const { data: remaining, error } = await context.supabase.rpc("redeem_promo", { _code: data.code });
    if (error) {
      const known = ["This code is not valid.", "You already used this code.", "This code has been used up."];
      throw new Error(known.find((k) => error.message.includes(k)) ?? "This code is not valid.");
    }
    return { remaining: remaining as number };
  });

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

export const adminListCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data: codes, error } = await context.supabase
      .from("promo_codes")
      .select("*, promo_redemptions(count)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (codes ?? []).map((c: any) => ({
      id: c.id as string,
      code: c.code as string,
      grants: c.grants as number,
      max_uses: c.max_uses as number | null,
      expires_at: c.expires_at as string | null,
      active: c.active as boolean,
      note: c.note as string | null,
      uses: (c.promo_redemptions?.[0]?.count as number) ?? 0,
    }));
  });

export const adminCreateCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { code: string; grants: number; maxUses: number | null; expiresAt: string | null; note: string }) => {
      const code = String(input?.code ?? "").trim().toUpperCase();
      if (!/^[A-Z0-9_-]{3,40}$/.test(code)) throw new Error("Use 3–40 letters, numbers, - or _.");
      const grants = Math.round(Number(input.grants));
      if (!(grants >= 1 && grants <= 50)) throw new Error("Interviews must be between 1 and 50.");
      const maxUses = input.maxUses == null ? null : Math.round(Number(input.maxUses));
      if (maxUses != null && !(maxUses >= 1)) throw new Error("Max uses must be at least 1.");
      return { code, grants, maxUses, expiresAt: input.expiresAt || null, note: String(input.note ?? "").slice(0, 200) };
    },
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("promo_codes").insert({
      code: data.code,
      grants: data.grants,
      max_uses: data.maxUses,
      expires_at: data.expiresAt,
      note: data.note || null,
    });
    if (error) throw new Error(error.code === "23505" ? "That code already exists." : error.message);
    return { ok: true };
  });

export const adminToggleCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; active: boolean }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("promo_codes").update({ active: !!data.active }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
