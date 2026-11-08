import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SalarySimulator } from "@/components/SalarySimulator";
export const Route = createFileRoute("/_authenticated/salary")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Swiss salary & tax budget — Offer Ready" },
      {
        name: "description",
        content:
          "Estimate Swiss employee deductions, 13th salary and bonus with canton-specific tax budgeting.",
      },
      { property: "og:title", content: "Swiss salary & tax budget — Offer Ready" },
      {
        property: "og:description",
        content: "Transparent Swiss payroll and canton tax budgeting for 2026.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <SalarySimulator />
    </AppShell>
  ),
});
