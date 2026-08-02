import { type ReactNode } from "react";

interface GroupProps {
  title: string;
  children: ReactNode;
}

export function FilterGroup({ title, children }: GroupProps) {
  return (
    <details open className="group border-b border-border py-6">
      <summary className="flex cursor-pointer list-none items-center justify-between">
        <span className="rule-label">{title}</span>
        <span className="relative h-3 w-3 shrink-0">
          <span className="absolute left-0 top-1/2 h-px w-3 bg-foreground" />
          <span className="absolute left-1/2 top-0 h-3 w-px bg-foreground transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:scale-y-0" />
        </span>
      </summary>
      <div className="mt-5 space-y-3">{children}</div>
    </details>
  );
}

interface CheckProps {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}

export function FilterCheck({ label, count, checked, onChange }: CheckProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className="relative flex h-4 w-4 shrink-0 items-center justify-center border border-border transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] peer-checked:border-olive-deep peer-checked:bg-olive-deep"
      >
        <span
          className={`h-1.5 w-1.5 bg-ivory transition-transform duration-300 ${
            checked ? "scale-100" : "scale-0"
          }`}
        />
      </span>
      <span className={checked ? "text-foreground" : undefined}>{label}</span>
      {count !== undefined && (
        <span className="ml-auto text-[0.65rem] tabular-nums text-muted-foreground/70">
          {count}
        </span>
      )}
    </label>
  );
}

export function SwatchCheck({ label, swatch, checked, onChange }: CheckProps & { swatch: string }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={checked}
      className="flex items-center gap-3 text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
    >
      <span
        className={`h-4 w-4 rounded-full border transition-all duration-300 ${
          checked
            ? "border-gold ring-1 ring-gold ring-offset-2 ring-offset-background"
            : "border-border"
        }`}
        style={{ background: swatch }}
      />
      <span className={checked ? "text-foreground" : undefined}>{label}</span>
    </button>
  );
}

export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="group inline-flex items-center gap-2.5 border border-border px-3.5 py-2 text-[0.65rem] uppercase tracking-[0.16em] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-gold hover:bg-cream"
    >
      {label}
      <span className="relative h-2.5 w-2.5 transition-transform duration-300 group-hover:rotate-90">
        <span className="absolute left-0 top-1/2 h-px w-2.5 bg-current" />
        <span className="absolute left-1/2 top-0 h-2.5 w-px bg-current" />
      </span>
    </button>
  );
}
