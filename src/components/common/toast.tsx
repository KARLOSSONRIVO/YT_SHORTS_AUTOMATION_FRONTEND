"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, TriangleAlert, X } from "lucide-react";

export type ToastContent = { title: string; message?: string; tone: "success" | "error" };
type Toast = ToastContent & { id: number };
const ToastContext = createContext<((toast: ToastContent) => void) | null>(null);
const TOAST_DURATION_MS = 2000;

function Notification({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const { id, title, message, tone } = toast;
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(id), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div className="pointer-events-auto relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-2 overflow-hidden rounded-container border bg-card p-4 text-card-foreground">
      <div className="flex min-w-0 items-start gap-3">
        {tone === "error" ? (
          <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        ) : (
          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        )}
        <div className="min-w-0 break-words text-sm">
          <p className="font-semibold">{title}</p>
          {message && <p className="mt-1 leading-5 text-muted-foreground">{message}</p>}
        </div>
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        className="-mr-2 -mt-2 grid h-9 w-9 place-items-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        onClick={() => onDismiss(id)}
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-muted">
        <div
          className={`toast-countdown h-full origin-left ${tone === "error" ? "bg-destructive" : "bg-emerald-600"}`}
          style={{ animationDuration: `${TOAST_DURATION_MS}ms` }}
        />
      </div>
    </div>
  );
}

export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error("useToast requires ToastProvider.");
  return showToast;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [announcement, setAnnouncement] = useState<Toast>();
  const nextId = useRef(0);
  const dismissToast = useCallback((id: number) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);
  const showToast = useCallback((content: ToastContent) => {
    const toast = { ...content, id: nextId.current++ };
    setAnnouncement(toast);
    setToasts((previous) => [
      ...previous.filter((item) => item.tone !== toast.tone || item.title !== toast.title || item.message !== toast.message).slice(-2),
      toast,
    ]);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {announcement?.tone === "error" && (
          <span key={announcement.id}>{announcement.title}. {announcement.message}</span>
        )}
      </div>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement?.tone === "success" && (
          <span key={announcement.id}>{announcement.title}. {announcement.message}</span>
        )}
      </div>
      <div
        aria-label="Notifications"
        role="region"
        className="pointer-events-none fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[100] flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:w-96"
      >
        {toasts.map((toast) => <Notification key={toast.id} toast={toast} onDismiss={dismissToast} />)}
      </div>
    </ToastContext.Provider>
  );
}
