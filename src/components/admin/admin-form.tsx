import { cn } from "@/lib/utils";
import {
  adminFieldClass,
  adminTextareaClass,
} from "@/components/admin/admin-shell";

export function AdminForm({
  children,
  className,
  action,
  bare = false,
}: {
  children: React.ReactNode;
  className?: string;
  action?: (formData: FormData) => void | Promise<void>;
  bare?: boolean;
}) {
  return (
    <form
      action={action}
      className={cn(
        "space-y-4 sm:space-y-6",
        !bare && "border border-border/60 bg-secondary/20 p-4 sm:p-6",
        className,
      )}
    >
      {children}
    </form>
  );
}

export function AdminFormSection({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {title || description ? (
        <div>
          {title ? (
            <p className="text-xs uppercase tracking-[0.18em] text-amber">
              {title}
            </p>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function AdminField({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="block text-xs leading-relaxed text-muted-foreground/80">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function AdminFieldGrid({
  children,
  cols = 2,
}: {
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4",
        cols === 1 && "grid-cols-1",
        cols === 2 && "sm:grid-cols-2",
        cols === 3 && "sm:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}

export function AdminMoreFields({
  label = "More details",
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group border border-border/40 bg-ink/20">
      <summary className="cursor-pointer list-none px-4 py-3 text-xs uppercase tracking-[0.16em] text-muted-foreground transition hover:text-amber [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span className="text-amber transition group-open:rotate-90">›</span>
          {label}
        </span>
      </summary>
      <div className="space-y-4 border-t border-border/40 px-4 py-4">
        {children}
      </div>
    </details>
  );
}

export function AdminCheckbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 accent-amber"
      />
      {label}
    </label>
  );
}

export function AdminFileField({
  label,
  name,
  accept,
  multiple,
  required,
  hint,
  className,
}: {
  label: string;
  name: string;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  hint?: string;
  className?: string;
}) {
  return (
    <AdminField label={label} hint={hint} className={className}>
      <input
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        required={required}
        className="block w-full text-sm file:mr-3 file:border-0 file:bg-secondary file:px-3 file:py-2 file:uppercase file:tracking-[0.16em] file:text-foreground"
      />
    </AdminField>
  );
}

export { adminFieldClass, adminTextareaClass };
