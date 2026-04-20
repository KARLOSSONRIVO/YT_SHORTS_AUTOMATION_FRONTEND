"use client";

import { useQuery } from "@tanstack/react-query";
import { getFacelessVoices } from "../api/get-faceless-voices";

export function useFacelessVoicesQuery(enabled = true) {
  return useQuery({
    queryKey: ["faceless", "voices"],
    queryFn: getFacelessVoices,
    enabled
  });
}
