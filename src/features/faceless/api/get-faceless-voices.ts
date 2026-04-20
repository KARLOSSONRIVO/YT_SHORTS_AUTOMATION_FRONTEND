import { apiRequest } from "@/lib/api/client";
import type { FacelessVoiceOption } from "../types";

export function getFacelessVoices() {
  return apiRequest<FacelessVoiceOption[]>("/projects/faceless/voices");
}
