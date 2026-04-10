import { apiRequest } from "@/lib/api/client";
import type { Channel } from "../types";

export function getChannels(userId: string) {
  return apiRequest<Channel[]>(`/channel?userId=${encodeURIComponent(userId)}`);
}
