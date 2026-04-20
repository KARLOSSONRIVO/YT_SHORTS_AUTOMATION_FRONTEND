"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { disconnectChannel } from "../api/disconnect-channel";

export function useDisconnectChannelMutation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => disconnectChannel(userId, channelId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.channels.byUser(userId) });
    }
  });
}
