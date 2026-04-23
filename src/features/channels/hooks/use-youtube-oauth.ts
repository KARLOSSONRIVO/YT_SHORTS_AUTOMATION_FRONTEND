"use client";

import { useMutation } from "@tanstack/react-query";
import { getYoutubeOAuthUrl } from "../api/get-youtube-oauth-url";

export function useYoutubeOAuthMutation() {
  return useMutation({
    mutationFn: () => getYoutubeOAuthUrl()
  });
}
