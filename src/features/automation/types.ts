export type ContentType = 'CLIP_UPLOAD';
export type AutomationMode = 'fully_automatic' | 'approval_before_upload' | 'draft_only';
export interface ProjectAutomation {
  id: string; title: string; contentType: ContentType; accountId: string;
  language: string; timezone: string; uploadTime: string;
  automationMode: AutomationMode; automationEnabled: boolean; automationStatus: 'active' | 'paused' | 'running' | 'error';
  nextRunAt?: string; lastRunAt?: string; lastUploadAt?: string; createdAt: string; updatedAt: string;
}
export interface AccountValidation { id: string; accountName: string; channelName: string; externalChannelId: string; status: 'connected' | 'disconnected'; authenticationActive: boolean; needsRefresh: boolean; }
export interface QueuedClip {
  id: string; title: string; description?: string; sourceFile: string; sourceFileHash: string; scheduledAt?: string;
  status: 'pending' | 'scheduled' | 'uploading' | 'uploaded' | 'failed' | 'draft'; platformVideoId?: string;
  uploadedAt?: string; error?: string; queuePosition: number; durationSeconds: number; width?: number; height?: number; hasAudio: boolean;
}
export interface Activity { id: string; type: string; message: string; severity: 'info' | 'warning' | 'error'; createdAt: string; }
export interface ProjectDashboardData {
  project: ProjectAutomation; account: AccountValidation; clips: QueuedClip[]; publishedClips: QueuedClip[]; activity: Activity[];
  currentJobStatus: string; recentErrors: Array<{clipId?:string;message:string;status:string}>; lastUpload?: string;
}
export interface ProjectInput {
  name: string; contentType: ContentType; accountId: string; language: string;
  uploadTime: string; timezone: string; automationMode: AutomationMode; automationEnabled: boolean;
}
