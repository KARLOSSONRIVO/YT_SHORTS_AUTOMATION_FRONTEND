"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { getChannels } from "../api/get-channels";

export function useChannelsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.channels.all,
    queryFn: getChannels,
    enabled
  });
}
