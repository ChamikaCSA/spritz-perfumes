"use client";

import Image from "next/image";
import { FileSpreadsheet, ImageIcon, Upload, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

type ExistingItem = { id: string; url: string };

export function AdminFileField({
  label,
  name,
  accept,
  multiple,
  required,
  hint,
  className,
  maxBytes = DEFAULT_MAX_BYTES,
  existing,
  existingFieldName = "existing_images",
}: {
  label: string;
  name: string;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  hint?: string;
  className?: string;
  maxBytes?: number;
  /** Already-saved image URLs shown for edit/remove. */
  existing?: string[];
  /** Hidden input name(s) for kept existing URLs. */
  existingFieldName?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [kept, setKept] = useState<ExistingItem[]>(() =>
    (existing ?? []).filter(Boolean).map((url, i) => ({
      id: `existing-${i}-${url}`,
      url,
    })),
  );
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urls = files.map((file) =>
      isImageFile(file) ? URL.createObjectURL(file) : "",
    );
    // Blob URLs are an external resource; keep display state in sync with `files`.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- object URL lifecycle
    setPreviews(urls);
    return () => {
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [files]);

  function syncInput(next: File[]) {
    const dt = new DataTransfer();
    next.forEach((file) => dt.items.add(file));
    if (inputRef.current) inputRef.current.files = dt.files;
    setFiles(next);
  }

  function acceptFiles(incoming: FileList | File[]) {
    const list = Array.from(incoming);
    if (!list.length) return;

    const tooBig = list.find((file) => file.size > maxBytes);
    if (tooBig) {
      setError(`${tooBig.name} is larger than ${formatBytes(maxBytes)}`);
      return;
    }

    setError(null);
    setFiles((prev) => {
      let next: File[];
      if (multiple) {
        next = [...prev, ...list];
      } else {
        // Single: new file replaces existing saved image
        setKept([]);
        next = list.slice(0, 1);
      }
      const dt = new DataTransfer();
      next.forEach((file) => dt.items.add(file));
      if (inputRef.current) inputRef.current.files = dt.files;
      return next;
    });
  }

  function removeKept(id: string) {
    setKept((prev) => prev.filter((item) => item.id !== id));
    setError(null);
  }

  function removeFileAt(index: number) {
    syncInput(files.filter((_, i) => i !== index));
    setError(null);
  }

  function clearAll() {
    setKept([]);
    syncInput([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const totalCount = kept.length + files.length;
  const empty = totalCount === 0;
  const showImageUi =
    kept.length > 0 || files.some(isImageFile) || Boolean(accept?.includes("image"));

  return (
    <div className={cn("block space-y-1.5", className)}>
      <label
        htmlFor={inputId}
        className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
      >
        {label}
        {required ? <span className="text-amber"> *</span> : null}
      </label>

      {kept.map((item) => (
        <input
          key={item.id}
          type="hidden"
          name={existingFieldName}
          value={item.url}
        />
      ))}

      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) acceptFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex h-40 flex-col border border-dashed transition",
          dragOver
            ? "border-amber bg-amber/5"
            : "border-border/60 bg-ink/20 hover:border-border",
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          required={required && empty}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) acceptFiles(e.target.files);
          }}
        />

        {empty ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center"
          >
            <span className="flex size-10 items-center justify-center border border-border/50 bg-secondary/40 text-amber">
              <Upload className="size-4" strokeWidth={1.5} />
            </span>
            <span className="text-sm text-foreground">
              Drop files here, or <span className="text-amber">browse</span>
            </span>
            <span className="text-xs text-muted-foreground/80">
              Max {formatBytes(maxBytes)}
              {multiple ? " each" : ""}
            </span>
          </button>
        ) : (
          <div className="flex h-full flex-col justify-between gap-2 p-3">
            {showImageUi ? (
              <ul className="flex min-h-0 flex-1 items-center gap-2 overflow-x-auto scrollbar-none">
                {kept.map((item) => (
                  <li
                    key={item.id}
                    className="group relative h-[6.5rem] w-[5.2rem] shrink-0 overflow-hidden bg-background"
                  >
                    <Image
                      src={item.url}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="84px"
                    />
                    <button
                      type="button"
                      onClick={() => removeKept(item.id)}
                      className="absolute right-1 top-1 z-1 flex size-6 items-center justify-center bg-background/85 text-foreground opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <X className="size-3.5" strokeWidth={1.75} />
                    </button>
                  </li>
                ))}
                {files.map((file, i) => (
                  <li
                    key={`new-${file.name}-${file.size}-${i}`}
                    className="group relative h-[6.5rem] w-[5.2rem] shrink-0 overflow-hidden bg-background ring-1 ring-inset ring-amber/50"
                  >
                    {previews[i] ? (
                      <Image
                        src={previews[i]}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="size-5" strokeWidth={1.5} />
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFileAt(i)}
                      className="absolute right-1 top-1 z-1 flex size-6 items-center justify-center bg-background/85 text-foreground opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="size-3.5" strokeWidth={1.75} />
                    </button>
                    <span className="pointer-events-none absolute left-1 top-1 z-1 bg-amber px-1 py-0.5 text-[8px] uppercase tracking-wider text-ink">
                      New
                    </span>
                  </li>
                ))}
                {multiple ? (
                  <li className="shrink-0">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="flex h-[6.5rem] w-[5.2rem] flex-col items-center justify-center gap-1 border border-dashed border-border/50 text-muted-foreground transition hover:border-amber/60 hover:text-amber"
                    >
                      <Upload className="size-4" strokeWidth={1.5} />
                      <span className="text-[10px] uppercase tracking-[0.14em]">
                        Add
                      </span>
                    </button>
                  </li>
                ) : null}
              </ul>
            ) : (
              <ul className="flex min-h-0 flex-1 flex-col justify-center gap-2 overflow-y-auto">
                {files.map((file, i) => (
                  <li
                    key={`${file.name}-${file.size}-${i}`}
                    className="flex items-center gap-3 border border-border/40 bg-background/40 px-3 py-2"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center bg-secondary/50 text-amber">
                      <FileSpreadsheet className="size-3.5" strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(file.size)}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFileAt(i)}
                      className="flex size-8 shrink-0 items-center justify-center text-muted-foreground transition hover:text-foreground"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="size-4" strokeWidth={1.75} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {totalCount} file{totalCount === 1 ? "" : "s"}
                {kept.length && files.length
                  ? ` · ${files.length} new`
                  : files.length
                    ? " · ready to upload"
                    : ""}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-[10px] uppercase tracking-[0.16em] text-amber transition hover:text-amber-soft"
                >
                  {multiple ? "Add more" : "Replace"}
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition hover:text-foreground"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs leading-relaxed text-muted-foreground/80">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
