import { apiRequest } from "@/lib/api/client";
import type { Channel } from "../types";

export function disconnectChannel(channelId: string) {
  return apiRequest<Channel>(`/channel/${encodeURIComponent(channelId)}`, {
    method: "DELETE"
  });
}
