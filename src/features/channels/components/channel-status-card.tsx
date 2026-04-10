import { StatusBadge } from "@/components/common/status-badge";
import { SectionCard } from "@/components/common/section-card";
import type { Channel } from "../types";

export function ChannelStatusCard({ channels }: { channels: Channel[] }) {
  const channel = channels[0];

  return (
    <SectionCard
      title="Channel connection"
      description="Publishing should always reflect current channel health before a user reaches the final publish action."
    >
      {channel ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-foreground">{channel.title}</p>
              <p className="text-sm text-muted-foreground">{channel.externalChannelId}</p>
            </div>
            <StatusBadge tone={channel.status === "connected" ? "success" : "error"}>{channel.status}</StatusBadge>
          </div>
          <p className="text-sm text-muted-foreground">
            {channel.tokenExpiryDate
              ? `Token expires at ${new Date(channel.tokenExpiryDate).toLocaleString()}.`
              : "Token expiry is not currently exposed."}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No YouTube channel connected yet.</p>
      )}
    </SectionCard>
  );
}
