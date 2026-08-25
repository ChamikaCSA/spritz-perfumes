import { LK_DISTRICTS } from "@/lib/commerce";

export function DistrictSelect({
  name,
  value,
  onChange,
  className,
}: {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  return (
    <select
      name={name}
      required
      className={className}
      value={onChange ? value : undefined}
      defaultValue={onChange ? undefined : (value ?? LK_DISTRICTS[0])}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
    >
      {LK_DISTRICTS.map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      ))}
    </select>
  );
}
