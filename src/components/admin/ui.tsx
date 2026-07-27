import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

const base =
  "w-full border border-border bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:border-foreground";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${base} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${base} ${props.className ?? ""}`} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${base} ${props.className ?? ""}`} />;
}

export function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function Btn({
  variant = "solid",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "ghost" | "danger" }) {
  const styles =
    variant === "solid"
      ? "bg-olive-deep text-ivory"
      : variant === "danger"
        ? "border border-border text-destructive"
        : "border border-border text-muted-foreground hover:text-foreground";
  return (
    <button
      {...props}
      className={`px-6 py-3 text-[0.6rem] uppercase tracking-[0.2em] transition-opacity disabled:opacity-40 ${styles} ${props.className ?? ""}`}
    />
  );
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10 border border-border p-6">
      <h2 className="mb-6 text-[0.66rem] uppercase tracking-[0.2em]">{title}</h2>
      {children}
    </section>
  );
}
