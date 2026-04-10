export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    list: (userId: string) => ["projects", "list", userId] as const,
    detail: (projectId: string) => ["projects", "detail", projectId] as const
  },
  jobs: {
    byProject: (projectId: string) => ["jobs", "project", projectId] as const
  },
  clips: {
    byProject: (projectId: string) => ["clips", "project", projectId] as const,
    subtitle: (clipId: string) => ["clips", "subtitle", clipId] as const
  },
  channels: {
    byUser: (userId: string) => ["channels", userId] as const
  }
};
