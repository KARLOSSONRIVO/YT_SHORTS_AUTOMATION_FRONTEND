export interface Channel {
  id: string;
  userId: string;
  provider: "youtube";
  externalChannelId: string;
  title: string;
  tokenExpiryDate?: string;
  status: "connected" | "disconnected";
}
