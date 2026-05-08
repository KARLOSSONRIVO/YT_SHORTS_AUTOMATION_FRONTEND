"use client";

import { Button } from "@/components/ui/button";
import { useChannelOAuthMutation } from "../hooks/use-youtube-oauth";

export function ConnectChannelButton() {
  const mutation = useChannelOAuthMutation();

  return (
    <Button
      disabled={mutation.isPending}
      onClick={async () => {
        const result = await mutation.mutateAsync();
        window.open(result.authorizationUrl, "_blank", "noopener,noreferrer");
      }}
    >
      {mutation.isPending ? "Preparing OAuth..." : "Connect YouTube Channel"}
    </Button>
  );
}
