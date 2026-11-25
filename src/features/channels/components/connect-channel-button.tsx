"use client";

import { Button } from "@/components/ui/button";
import { useChannelOAuthMutation } from "../hooks/use-youtube-oauth";

export function ConnectChannelButton() {
  const mutation = useChannelOAuthMutation();

  return (
    <div className="space-y-2">
      <Button
        type="button"
        disabled={mutation.isPending}
        onClick={async () => {
          try {
            const result = await mutation.mutateAsync();
            window.open(
              result.authorizationUrl,
              "_blank",
              "noopener,noreferrer",
            );
          } catch {
            /* The shared toast reports the request failure. */
          }
        }}
      >
        {mutation.isPending ? "Connecting..." : "Connect channel"}
      </Button>
    </div>
  );
}
