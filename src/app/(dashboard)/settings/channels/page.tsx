"use client";
import { PageHeader } from "@/components/layout/page-header";
import { LoadFailure } from "@/components/common/load-failure";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/components/auth-provider";
import { ChannelStatusCard } from "@/features/channels/components/channel-status-card";
import { ConnectChannelButton } from "@/features/channels/components/connect-channel-button";
import { useChannelsQuery } from "@/features/channels/hooks/use-channels-query";
export default function ChannelsPage() {
  const { user } = useAuth();
  const query = useChannelsQuery(Boolean(user?.id));
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Channels"
        description="Manage the YouTube channels you publish your clips to."
        actions={<ConnectChannelButton />}
      />
      {query.isError ? (
        <LoadFailure
          message="Your channels could not be loaded."
          onRetry={() => query.refetch()}
        />
      ) : query.isPending ? (
        <Skeleton className="h-24" aria-busy="true" />
      ) : (
        <ChannelStatusCard channels={query.data ?? []} />
      )}
      <p className="text-xs leading-5 text-muted-foreground">
        Connecting a channel does not publish any videos. You choose what to
        upload from clip review or Publishing.
      </p>
    </div>
  );
}
