"use client";

import Link from "next/link";
import { Bell, Search, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/auth-provider";
import { appRoutes } from "@/lib/constants/routes";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center justify-between gap-4 rounded-[28px] border border-border/70 bg-card/85 px-5 py-4 shadow-soft">
      <div className="flex min-w-0 items-center gap-3 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <span className="truncate">Search projects, clips, channels</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-full border border-border bg-background p-2.5 text-muted-foreground transition hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>
        <div className="hidden rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground md:block">
          {user?.displayName ?? user?.email ?? "Workspace"}
        </div>
        <Button asChild>
          <Link href={appRoutes.uploadsNew}>
            <UploadCloud className="h-4 w-4" />
            Upload Video
          </Link>
        </Button>
        <Button onClick={logout} type="button" variant="outline">
          Logout
        </Button>
      </div>
    </div>
  );
}
