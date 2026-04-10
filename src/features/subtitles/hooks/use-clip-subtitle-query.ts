"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { getClipSubtitle } from "../api/get-clip-subtitle";

export function useClipSubtitleQuery(clipId?: string) {
  return useQuery({
    queryKey: clipId ? queryKeys.clips.subtitle(clipId) : ["clips", "subtitle", "empty"],
    queryFn: () => getClipSubtitle(clipId as string),
    enabled: Boolean(clipId)
  });
}
