export interface PublishPayload {
  clipId: string;
  channelId: string;
  title: string;
  description?: string;
  privacyStatus: "private" | "public" | "unlisted";
}
