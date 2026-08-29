"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { SidebarContent } from "./sidebar-nav";

export function MobileNav({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    onOpenChange(false);
    // Intentionally keyed on pathname only; onOpenChange is a stable setter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden" />
        <Dialog.Content
          id="mobile-nav"
          aria-label="Main navigation"
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border/60 bg-background shadow-soft transition-transform duration-200 motion-reduce:transition-none data-[state=closed]:-translate-x-full lg:hidden"
        >
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <Dialog.Close
            aria-label="Close navigation"
            className="absolute right-3 top-3 rounded-full p-2 text-muted-foreground transition-colors hover:text-accent"
          >
            <X className="h-5 w-5" />
          </Dialog.Close>
          <SidebarContent pathname={pathname} onNavigate={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
