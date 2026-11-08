import { Link } from "@tanstack/react-router";
import { useLegal } from "@/lib/legal-copy";
import { CONTROLLER } from "@/lib/privacy";

export function SiteFooter({ children }: { children?: React.ReactNode }) {
  const { L } = useLegal();
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-4 text-xs text-muted-foreground">
        <nav aria-label={L.footer.privacy} className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link to="/impressum" className="hover:text-foreground hover:underline">
            {L.footer.impressum}
          </Link>
          <Link to="/privacy" className="hover:text-foreground hover:underline">
            {L.footer.privacy}
          </Link>
          <a href={`mailto:${CONTROLLER.email}`} className="hover:text-foreground hover:underline">
            {L.footer.contact}: {CONTROLLER.email}
          </a>
        </nav>
        {children}
      </div>
    </footer>
  );
}
