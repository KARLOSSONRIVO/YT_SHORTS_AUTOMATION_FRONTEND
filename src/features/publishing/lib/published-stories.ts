import type { Story } from "@/features/automation/types";

export function publishedFacelessStories(stories: Story[]) {
  return stories.filter(
    (story) =>
      story.status === "uploaded" &&
      Boolean(story.platformUrl || story.platformVideoId)
  );
}
