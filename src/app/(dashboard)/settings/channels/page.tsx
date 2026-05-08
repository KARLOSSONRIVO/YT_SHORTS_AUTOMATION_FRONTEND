"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/features/auth/components/auth-provider";
import { ChannelStatusCard } from "@/features/channels/components/channel-status-card";
import { useChannelsQuery } from "@/features/channels/hooks/use-channels-query";

export default function ChannelsPage() {
  const { user } = useAuth();
  const channelsQuery = useChannelsQuery(Boolean(user?.id));
  const channels = channelsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="YouTube channels"
        description="Keep your connected YouTube accounts here so publishing targets stay easy to manage."
      />
      <ChannelStatusCard channels={channels} />
    </div>
  );
}
