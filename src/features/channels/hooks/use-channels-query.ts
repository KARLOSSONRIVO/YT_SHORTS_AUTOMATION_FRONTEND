"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { getChannels } from "../api/get-channels";

export function useChannelsQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.channels.byUser(userId),
    queryFn: () => getChannels(userId),
    enabled: Boolean(userId)
  });
}
