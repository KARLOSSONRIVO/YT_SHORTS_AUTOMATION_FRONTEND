import { apiRequest } from "@/lib/api/client";
import type { Channel } from "../types";

export function getChannels() {
  return apiRequest<Channel[]>("/channel");
}
