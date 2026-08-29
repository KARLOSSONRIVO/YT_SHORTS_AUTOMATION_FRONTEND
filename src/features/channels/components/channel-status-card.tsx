"use client";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { SectionCard } from "@/components/common/section-card";
import type { Channel } from "../types";
import { useDisconnectChannelMutation } from "../hooks/use-disconnect-channel-mutation";
import { ConnectChannelButton } from "./connect-channel-button";

export function ChannelStatusCard({ channels }: { channels: Channel[] }) {
  const disconnectMutation = useDisconnectChannelMutation();

  return (
    <SectionCard
      title="YouTube channels"
      description="Saved YouTube channels you can publish to without reconnecting every time."
      action={<ConnectChannelButton />}
    >
      {channels.length ? (
        <div className="space-y-3">
          {channels.map((channel) => (
            <div key={channel.id} className="rounded-control border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-foreground">{channel.title}</p>
                  <p className="text-sm text-muted-foreground">{channel.externalChannelId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge tone={channel.status === "connected" ? "success" : "error"}>{channel.status}</StatusBadge>
                  {channel.status === "connected" ? (
                    <Button
                      disabled={disconnectMutation.isPending}
                      onClick={() => disconnectMutation.mutate(channel.id)}
                      type="button"
                      variant="outline"
                    >
                      {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
                    </Button>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {channel.tokenExpiryDate
                  ? `Token expires at ${new Date(channel.tokenExpiryDate).toLocaleString()}.`
                  : channel.status === "disconnected"
                    ? "This channel has been disconnected. Reconnect it anytime from OAuth."
                    : "Token expiry is not currently exposed."}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No YouTube channel connected yet.</p>
      )}
    </SectionCard>
  );
}
