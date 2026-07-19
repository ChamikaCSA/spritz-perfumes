"use client";

import { motion } from "framer-motion";
import type { FragranceNotes } from "@/lib/types";

const layers: {
  key: keyof FragranceNotes;
  label: string;
  hint: string;
}[] = [
  { key: "top", label: "Top", hint: "First impression" },
  { key: "heart", label: "Heart", hint: "The character" },
  { key: "base", label: "Base", hint: "The memory" },
];

export function NotePyramid({ notes }: { notes: FragranceNotes }) {
  const visible = layers.filter((layer) => (notes[layer.key] ?? []).length > 0);
  if (visible.length === 0) return null;

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-amber">Notes</p>
      <h2 className="mt-2 font-display text-2xl sm:text-4xl">Note pyramid</h2>

      <ol className="mt-6 space-y-0 border border-border/40 sm:mt-8">
        {visible.map((layer, index) => (
          <li
            key={layer.key}
            className={
              index < visible.length - 1
                ? "border-b border-border/40"
                : undefined
            }
          >
            <div className="grid gap-3 px-4 py-4 sm:grid-cols-[7.5rem_1fr] sm:items-start sm:gap-8 sm:px-5 sm:py-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-amber">
                  {layer.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {layer.hint}
                </p>
              </div>
              <ul className="flex flex-wrap gap-2">
                {(notes[layer.key] ?? []).map((note, noteIndex) => (
                  <motion.li
                    key={note}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.05 + noteIndex * 0.03,
                    }}
                    className="border border-border/80 bg-secondary/40 px-3 py-1.5 text-sm text-amber-soft"
                  >
                    {note}
                  </motion.li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
