export function CheckoutField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-xs uppercase tracking-wider text-muted-foreground">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full border border-border bg-secondary/40 px-3 text-sm outline-none focus:ring-1 focus:ring-amber"
      />
    </label>
  );
}
