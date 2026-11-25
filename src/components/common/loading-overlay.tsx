"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Loader2 } from "lucide-react";
export type LoadingOverlayStep = {
  label: string;
  state: "done" | "active" | "pending";
};
export function LoadingOverlay({
  open,
  title,
  description,
  steps,
  tone = "primary",
}: {
  open: boolean;
  title: string;
  description?: string;
  steps?: LoadingOverlayStep[];
  tone?: "primary" | "destructive";
}) {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/35" />
        <Dialog.Content
          aria-busy="true"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-container border bg-card p-6 shadow-soft"
        >
          <Loader2
            className={
              "mb-5 h-7 w-7 animate-spin motion-reduce:animate-none " +
              (tone === "destructive" ? "text-destructive" : "text-primary")
            }
            aria-hidden="true"
          />
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
            {description || "Please wait for this operation to finish."}
          </Dialog.Description>
          {steps?.length ? (
            <ol className="mt-5 space-y-3">
              {steps.map((step) => (
                <li
                  key={step.label}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="flex h-5 w-5 items-center justify-center">
                    {step.state === "done" ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : step.state === "active" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary motion-reduce:animate-none" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-border" />
                    )}
                  </span>
                  <span
                    className={
                      step.state === "active"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {step.label}
                  </span>
                  <span className="sr-only">{step.state}</span>
                </li>
              ))}
            </ol>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
