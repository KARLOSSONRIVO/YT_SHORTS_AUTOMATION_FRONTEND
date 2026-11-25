"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { disconnectChannel } from "../api/disconnect-channel";

export function useDisconnectChannelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successTitle: "YouTube channel disconnected", errorTitle: "Channel could not be disconnected" },
    mutationFn: disconnectChannel,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.channels.all });
    }
  });
}
