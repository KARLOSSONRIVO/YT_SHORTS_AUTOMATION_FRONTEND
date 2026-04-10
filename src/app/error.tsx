"use client";

import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/common/inline-error";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="p-8">
        <div className="mx-auto max-w-2xl">
          <InlineError
            title="App error"
            message={error.message || "An unexpected error interrupted the dashboard."}
            action={
              <Button className="mt-3" onClick={reset}>
                Try again
              </Button>
            }
          />
        </div>
      </body>
    </html>
  );
}
