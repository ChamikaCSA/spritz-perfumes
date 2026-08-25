"use client";

import { createContext, useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  adminButtonClass,
  adminGhostButtonClass,
  adminRowActionClass,
  adminRowActionPrimaryClass,
} from "@/components/admin/layout/admin-shell";
import { cn } from "@/lib/utils";

type AdminFormDialogContextValue = {
  close: () => void;
};

const AdminFormDialogContext =
  createContext<AdminFormDialogContextValue | null>(null);

export function useAdminFormDialog() {
  return useContext(AdminFormDialogContext);
}

export function AdminFormDialog({
  triggerLabel,
  title,
  description,
  children,
  triggerVariant = "ghost",
  size = "lg",
  className,
}: {
  triggerLabel: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  triggerVariant?: "ghost" | "amber" | "link" | "primary";
  size?: "md" | "lg" | "xl";
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <AdminFormDialogContext.Provider value={{ close: () => setOpen(false) }}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <button
              type="button"
              className={cn(
                triggerVariant === "ghost" && adminGhostButtonClass,
                triggerVariant === "amber" && adminButtonClass,
                triggerVariant === "link" && adminRowActionClass,
                triggerVariant === "primary" && adminRowActionPrimaryClass,
                className,
              )}
            />
          }
        >
          {triggerLabel}
        </DialogTrigger>
        <DialogContent
          className={cn(
            "max-h-[min(92vh,900px)] gap-0 overflow-hidden rounded-none border border-border/60 bg-ink p-0 text-foreground ring-1 ring-border/40",
            size === "md" && "sm:max-w-md",
            size === "lg" && "sm:max-w-2xl",
            size === "xl" && "sm:max-w-3xl",
          )}
        >
          <DialogHeader className="shrink-0 border-b border-border/50 py-3 pl-4 pr-12 sm:py-4 sm:pl-6 sm:pr-14">
            <DialogTitle className="font-display text-xl font-normal tracking-normal text-foreground sm:text-2xl">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-sm text-muted-foreground">
                {description}
              </DialogDescription>
            ) : null}
          </DialogHeader>
          <div className="max-h-[calc(min(92vh,900px)-5rem)] overflow-y-auto px-4 py-4 sm:max-h-[calc(min(92vh,900px)-5.5rem)] sm:px-6 sm:py-5 sm:pb-6">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    </AdminFormDialogContext.Provider>
  );
}
