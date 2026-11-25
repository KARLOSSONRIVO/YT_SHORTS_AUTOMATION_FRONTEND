"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { appRoutes } from "@/lib/constants/routes";

function ChannelConnectionResult() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const showToast = useToast();
  useEffect(() => {
    if (status === "success") {
      showToast({ tone: "success", title: "YouTube channel connected" });
    } else if (status === "error") {
      showToast({ tone: "error", title: "YouTube connection failed", message: "Try connecting again from Channels." });
    }
  }, [showToast, status]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>YouTube connection</CardTitle>
          <CardDescription>Return to Channels to manage your connected accounts.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" asChild className="sm:flex-1">
            <Link href={appRoutes.channels}>Back to Channels</Link>
          </Button>
          <Button
            type="button"
            className="sm:flex-1"
            onClick={() => window.close()}
            variant="outline"
          >
            Close this tab
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default function ChannelConnectedPage() {
  return (
    <Suspense fallback={<p>Checking channel connection...</p>}>
      <ChannelConnectionResult />
    </Suspense>
  );
}
