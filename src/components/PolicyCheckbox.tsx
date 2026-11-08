import { Link } from "@tanstack/react-router";
import { Checkbox } from "@/components/ui/checkbox";
import { useLegal } from "@/lib/legal-copy";

export function PolicyCheckbox({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { L } = useLegal();
  return (
    <div className="flex items-start gap-2 text-sm">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        aria-required="true"
        className="mt-0.5"
      />
      <label htmlFor={id} className="leading-snug text-muted-foreground">
        {L.consent.before}
        <Link to="/privacy" target="_blank" className="font-medium text-foreground underline">
          {L.consent.link}
        </Link>
        {L.consent.after}
      </label>
    </div>
  );
}
