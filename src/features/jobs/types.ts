export interface Job {
  id: string;
  projectId: string;
  clipId?: string;
  queueName: string;
  type: string;
  status: "queued" | "active" | "completed" | "failed";
  attempts: number;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
}
