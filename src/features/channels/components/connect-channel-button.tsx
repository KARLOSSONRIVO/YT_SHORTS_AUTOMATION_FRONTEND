"use client";

import { Button } from "@/components/ui/button";
import { useYoutubeOAuthMutation } from "../hooks/use-youtube-oauth";

export function ConnectChannelButton({ userId }: { userId: string }) {
  const mutation = useYoutubeOAuthMutation();

  return (
    <Button
      disabled={mutation.isPending}
      onClick={async () => {
        const result = await mutation.mutateAsync(userId);
        window.open(result.authorizationUrl, "_blank", "noopener,noreferrer");
      }}
    >
      {mutation.isPending ? "Preparing OAuth..." : "Connect YouTube Channel"}
    </Button>
  );
}
