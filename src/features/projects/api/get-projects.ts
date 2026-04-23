import { apiRequest } from "@/lib/api/client";
import type { Project } from "../types";

export function getProjects() {
  return apiRequest<Project[]>("/project");
}
