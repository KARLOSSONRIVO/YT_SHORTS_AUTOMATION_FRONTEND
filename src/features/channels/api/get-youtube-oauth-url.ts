import { apiRequest } from "@/lib/api/client";

export function getChannelOAuthUrl() {
  return apiRequest<{ authorizationUrl: string }>("/channel/oauth/url");
}
