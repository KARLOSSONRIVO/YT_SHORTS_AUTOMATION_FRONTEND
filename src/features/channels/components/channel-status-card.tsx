"use client";
import { Radio, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import type { Channel } from "../types";
import { useDisconnectChannelMutation } from "../hooks/use-disconnect-channel-mutation";
export function ChannelStatusCard({ channels }: { channels: Channel[] }) {
  const disconnect = useDisconnectChannelMutation();
  return (
    <div className="space-y-4">
      {!channels.length ? (
        <EmptyState
          title="Connect your YouTube channel"
          description="Connect a channel to publish approved clips. Your videos stay private until you choose to share them."
        />
      ) : (
        <div className="divide-y overflow-hidden rounded-container border bg-card">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-container bg-secondary text-muted-foreground">
                  <Radio className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {channel.title}
                  </p>
                  <a
                    className="mt-1 inline-flex max-w-full items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    href={
                      "https://www.youtube.com/channel/" +
                      encodeURIComponent(channel.externalChannelId)
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="truncate">View channel</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge
                  tone={channel.status === "connected" ? "success" : "neutral"}
                >
                  {channel.status}
                </StatusBadge>
                {channel.status === "connected" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disconnect.isPending}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Disconnect this YouTube channel? You will need to reconnect before publishing to it again.",
                        )
                      )
                        disconnect.mutate(channel.id);
                    }}
                  >
                    {disconnect.isPending ? "Disconnecting..." : "Disconnect"}
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
