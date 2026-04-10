"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/features/auth/components/auth-provider";
import { ChannelStatusCard } from "@/features/channels/components/channel-status-card";
import { ConnectChannelButton } from "@/features/channels/components/connect-channel-button";
import { useChannelsQuery } from "@/features/channels/hooks/use-channels-query";

export default function ChannelsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const channelsQuery = useChannelsQuery(userId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="YouTube channels"
        description="Surface connection health clearly here so publish forms can stay streamlined and avoid surprising the user at the last step."
        actions={<ConnectChannelButton userId={userId} />}
      />
      <ChannelStatusCard channels={channelsQuery.data ?? []} />
    </div>
  );
}
