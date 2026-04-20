import { apiRequest } from "@/lib/api/client";

export function getYoutubeOAuthUrl(userId: string) {
  return apiRequest<{ authorizationUrl: string }>(`/channel/oauth/url?userId=${encodeURIComponent(userId)}`);
}
