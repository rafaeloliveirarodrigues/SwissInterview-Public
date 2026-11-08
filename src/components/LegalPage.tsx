import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LanguageMenu } from "@/components/LanguageMenu";
import { SiteFooter } from "@/components/SiteFooter";

export function LegalPage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col surface-grid">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-lg font-semibold tracking-tight">
          Offer Ready
        </Link>
        <LanguageMenu />
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16">
        <article className="rounded-2xl border border-border bg-card p-6 sm:p-10">{children}</article>
      </main>
      <SiteFooter />
    </div>
  );
}
