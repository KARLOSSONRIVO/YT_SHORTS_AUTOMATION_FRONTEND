import { apiRequest } from "@/lib/api/client";

export function getYoutubeOAuthUrl() {
  return apiRequest<{ authorizationUrl: string }>("/channel/oauth/url");
}
