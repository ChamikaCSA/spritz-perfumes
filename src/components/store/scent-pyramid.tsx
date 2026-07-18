"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { ScentNotes } from "@/lib/types";
import { cn } from "@/lib/utils";

const layers: {
  key: keyof ScentNotes;
  label: string;
  hint: string;
}[] = [
  { key: "top", label: "Top", hint: "First impression" },
  { key: "heart", label: "Heart", hint: "The character" },
  { key: "base", label: "Base", hint: "The memory" },
];

export function ScentPyramid({ notes }: { notes: ScentNotes }) {
  const [active, setActive] = useState<keyof ScentNotes>("heart");

  return (
    <div className="space-y-3 sm:space-y-4">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
        Scent pyramid
      </p>
      <div className="grid grid-cols-3 gap-1.5 sm:flex sm:gap-2">
        {layers.map((layer) => (
          <button
            key={layer.key}
            type="button"
            onClick={() => setActive(layer.key)}
            onMouseEnter={() => setActive(layer.key)}
            className={cn(
              "min-h-11 flex-1 border px-2 py-2.5 text-left transition sm:px-3 sm:py-3",
              active === layer.key
                ? "border-amber bg-amber/10 text-amber"
                : "border-border text-muted-foreground hover:border-amber/40",
            )}
          >
            <span className="block text-[10px] uppercase tracking-[0.2em] sm:text-xs">
              {layer.label}
            </span>
            <span className="mt-1 hidden text-[11px] opacity-70 sm:block">
              {layer.hint}
            </span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="flex flex-wrap gap-2"
        >
          {(notes[active] ?? []).map((note) => (
            <span
              key={note}
              className="border border-border/80 bg-secondary/50 px-3 py-1.5 text-sm text-amber-soft"
            >
              {note}
            </span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
