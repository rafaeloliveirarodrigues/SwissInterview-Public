// Server-only: removes every row that belongs to a user, then the login itself.
// Used by "Delete my account" and by the inactive-account cleanup job.

const USER_TABLES = [
  "question_practice",
  "interview_turns",
  "interview_sessions",
  "rav_applications",
  "reference_reviews",
  "preps",
  "promo_redemptions",
  "interview_credits",
] as const;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Counts rows anywhere that still reference the user id. Empty object = clean. */
export async function findRemainingReferences(uid: string) {
  const db = await admin();
  const remaining: Record<string, number> = {};
  const checks: [string, string][] = [
    ...USER_TABLES.map((t) => [t, "user_id"] as [string, string]),
    ["profiles", "id"],
    ["user_roles", "user_id"],
    ["coffee_payments", "matched_user_id"],
  ];
  for (const [table, column] of checks) {
    const { count, error } = await db
      .from(table as "preps")
      .select("*", { count: "exact", head: true })
      .eq(column as "user_id", uid);
    if (error) throw new Error(`Could not verify ${table}.`);
    if (count) remaining[table] = count;
  }
  const { data: files } = await db.storage.from("cvs").list(uid, { limit: 1 });
  if (files?.length) remaining["storage:cvs"] = files.length;
  return remaining;
}

export async function deleteUserCompletely(uid: string) {
  const db = await admin();

  const { data: files } = await db.storage.from("cvs").list(uid, { limit: 1000 });
  if (files?.length) {
    await db.storage.from("cvs").remove(files.map((f) => `${uid}/${f.name}`));
  }

  for (const table of USER_TABLES) {
    const { error } = await db.from(table).delete().eq("user_id", uid);
    if (error) throw new Error("Could not remove all of your data. Please try again.");
  }
  const { error: coffeeError } = await db
    .from("coffee_payments")
    .update({ matched_user_id: null })
    .eq("matched_user_id", uid);
  if (coffeeError) throw new Error("Could not unlink coffee payments. Please try again.");
  await db.from("user_roles").delete().eq("user_id", uid);
  await db.from("profiles").delete().eq("id", uid);

  const { error } = await db.auth.admin.deleteUser(uid);
  if (error && !/not.*found/i.test(error.message)) {
    console.error("deleteUserCompletely", error);
    throw new Error("Your data was removed but the account could not be closed. Try again.");
  }

  const remaining = await findRemainingReferences(uid);
  if (Object.keys(remaining).length) {
    console.error("deleteUserCompletely: leftovers", remaining);
    throw new Error("Some data could not be removed. Please try again.");
  }
  return { ok: true as const };
}
