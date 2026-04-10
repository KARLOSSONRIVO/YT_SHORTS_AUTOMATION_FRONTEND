import type { Project } from "@/features/projects/types";
import type { Job } from "@/features/jobs/types";

export interface UploadResponse {
  project: Project;
  sourceVideo: {
    id: string;
    storageKey: string;
    mimeType: string;
    originalFileName: string;
    sizeBytes: number;
  };
  job: Pick<Job, "id" | "queueName" | "status"> & {
    externalJobId?: string;
  };
}
