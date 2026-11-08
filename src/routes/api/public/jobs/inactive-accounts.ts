import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { addMonths, INACTIVITY_DELETE_MONTHS, inactivityAction, latestDate } from "@/lib/privacy";

// Monthly: warn accounts inactive for 21 months, delete those inactive for 24 months (after a warning).
export const Route = createFileRoute("/api/public/jobs/inactive-accounts")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { deleteUserCompletely } = await import("@/lib/account-deletion.server");
        const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
        const now = new Date();
        const result = { checked: 0, warned: 0, deleted: 0, errors: 0 };

        for (let page = 1; page < 1000; page++) {
          const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 500 });
          if (error) return Response.json({ error: "Could not list users" }, { status: 500 });
          const users = data.users;
          if (!users.length) break;
          const { data: profiles } = await supabaseAdmin
            .from("profiles")
            .select("id, last_active_at, inactivity_warned_at")
            .in("id", users.map((u) => u.id));
          const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

          for (const user of users) {
            result.checked++;
            const profile = byId.get(user.id);
            const lastActive = latestDate(user.last_sign_in_at, user.created_at, profile?.last_active_at);
            const warnedAt = profile?.inactivity_warned_at ? new Date(profile.inactivity_warned_at) : null;
            const action = inactivityAction({ lastActive, warnedAt, now });
            try {
              if (action === "warn" && user.email) {
                const deleteDate = addMonths(lastActive, INACTIVITY_DELETE_MONTHS);
                const minDate = new Date(now.getTime() + 31 * 86_400_000);
                const shown = deleteDate > minDate ? deleteDate : minDate;
                await sendTemplateEmail("inactivity-warning", user.email, {
                  templateData: {
                    deleteDate: shown.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
                  },
                  idempotencyKey: `inactivity-warning-${user.id}-${lastActive.toISOString().slice(0, 10)}`,
                });
                await supabaseAdmin
                  .from("profiles")
                  .upsert({ id: user.id, email: user.email, last_active_at: lastActive.toISOString(), inactivity_warned_at: now.toISOString() });
                result.warned++;
              } else if (action === "delete") {
                await deleteUserCompletely(user.id);
                result.deleted++;
              }
            } catch (e) {
              console.error("inactive-accounts", user.id, e);
              result.errors++;
            }
          }
          if (users.length < 500) break;
        }
        return Response.json(result);
      },
    },
  },
});
