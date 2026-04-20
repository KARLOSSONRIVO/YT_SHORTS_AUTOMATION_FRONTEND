import { apiRequest } from "@/lib/api/client";
import type { Channel } from "../types";

export function disconnectChannel(userId: string, channelId: string) {
  return apiRequest<Channel>(`/channel/${encodeURIComponent(channelId)}?userId=${encodeURIComponent(userId)}`, {
    method: "DELETE"
  });
}
