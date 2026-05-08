"use client";

import { useMutation } from "@tanstack/react-query";
import { getChannelOAuthUrl } from "../api/get-youtube-oauth-url";

export function useChannelOAuthMutation() {
  return useMutation({
    mutationFn: () => getChannelOAuthUrl()
  });
}
