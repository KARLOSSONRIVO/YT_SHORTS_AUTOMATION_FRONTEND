"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { appRoutes } from "@/lib/constants/routes";

export default function ChannelConnectedPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const isSuccess = status !== "error";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">YouTube Connection</p>
          <CardTitle>{isSuccess ? "Connected successfully" : "Connection not completed"}</CardTitle>
          <CardDescription>
            {isSuccess
              ? "Your YouTube account is now linked. You can head back to Channels and switch accounts whenever you publish."
              : "We couldn't finish linking the YouTube account. Head back to Channels and try the connection again."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="sm:flex-1">
            <Link href={appRoutes.channels}>Back to Channels</Link>
          </Button>
          <Button className="sm:flex-1" onClick={() => window.close()} type="button" variant="outline">
            Close this tab
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
