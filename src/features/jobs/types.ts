export interface Job {
  id: string;
  projectId: string;
  clipId?: string;
  queueName: string;
  type: string;
  status: "queued" | "active" | "completed" | "failed";
  attempts: number;
  progress?: {
    total?: number;
    current?: number;
    percent?: number;
    message?: string;
    currentSceneIndex?: number;
    completedScenes?: number[];
  };
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
}
