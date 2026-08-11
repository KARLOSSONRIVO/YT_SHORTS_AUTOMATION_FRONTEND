export type ContentType = 'FACELESS_NICHE' | 'REDDIT_STORY' | 'CLIP_UPLOAD';
export type VisualType = 'IMAGE' | 'ANIMATED' | 'AUTO';
export type AutomationMode = 'fully_automatic' | 'approval_before_upload' | 'draft_only';
export type StoryFormat = 'shocking_fact' | 'hidden_history' | 'mystery_reveal' | 'rise_and_fall' | 'record_breaking_moment' | 'hero_story' | 'rivalry' | 'controversy' | 'tragedy' | 'unsolved_mystery' | 'myth_versus_fact' | 'what_really_happened' | 'unexpected_ending' | 'one_decision_changed_everything' | 'psychological_explanation';

export interface Niche {
  id: string; name: string; slug: string; description: string; active: boolean;
  tones: string[]; defaultTone: string; targetAudience: string[]; visualStyle: string; visualPreferences: string[];
  contentRestrictions: string[]; preferredTopicCategories: string[]; topicCategories: string[];
  preferredStoryFormats: StoryFormat[]; allowedStoryFormats: StoryFormat[]; hashtagStrategy: string[];
  researchRequirements: string[]; language: string; defaultLanguage: string; region: string; targetRegion: string;
}
export interface RedditConfig {
  sourceMode: 'ONE_SUBREDDIT' | 'MULTIPLE_SUBREDDITS' | 'AUTO'; subreddits: string[];
  sortMethod: 'NEW' | 'HOT' | 'TOP_TODAY' | 'TOP_WEEK' | 'RISING' | 'BEST_ELIGIBLE';
  minimumScore: number; minimumComments: number; minimumBodyLength: number; allowNSFW: boolean;
  includeComments: boolean; excludeLocked: boolean; contentFilters: string[];
  attributionMode: 'link' | 'subreddit' | 'none'; allowCrossAccountReuse: boolean;
}
export interface ProjectAutomation {
  id: string; title: string; contentType: ContentType; visualType?: VisualType; nicheId?: string; accountId: string;
  language: string; timezone: string; uploadTime: string; durationSeconds: number;
  automationMode: AutomationMode; automationEnabled: boolean; automationStatus: 'active' | 'paused' | 'running' | 'error';
  nextRunAt?: string; lastRunAt?: string; lastSuccessfulGenerationAt?: string; lastUploadAt?: string; createdAt: string; updatedAt: string;
}
export interface AccountValidation { id: string; accountName: string; channelName: string; externalChannelId: string; status: 'connected' | 'disconnected'; authenticationActive: boolean; needsRefresh: boolean; }
export interface Story {
  id: string; title: string; topic: string; storyFormat: StoryFormat; status: string; voiceId: string; scheduledUploadTime?: string;
  platformUrl?: string; platformVideoId?: string; lastError?: string; estimatedDurationSeconds?: number; createdAt: string;
  metadata?: { assignedAccount?: string; sceneBreakdown?: unknown[]; visualPrompts?: string[]; subtitles?: string; platformMetadata?: { title?: string; description?: string }; finalVideoUrl?: string };
  qc?: { passed: boolean; critical: string[]; warnings: string[] }; uploadAttempts?: number; generationAttempts?: number;
}
export interface QueuedClip {
  id: string; title: string; description?: string; sourceFile: string; sourceFileHash: string; scheduledAt?: string;
  status: 'pending' | 'scheduled' | 'uploading' | 'uploaded' | 'failed' | 'draft'; platformVideoId?: string;
  uploadedAt?: string; error?: string; queuePosition: number; durationSeconds: number; width?: number; height?: number; hasAudio: boolean;
}
export interface RedditSource { id: string; redditPostId: string; subreddit: string; permalink: string; originalTitle: string; status: string; rejectionReason?: string; fetchedAt: string; youtubeVideoId?: string; }
export interface RejectedTopic { id: string; topic: string; title: string; reasons: string[]; similarityScore?: number; createdAt: string; }
export interface Activity { id: string; type: string; message: string; severity: 'info' | 'warning' | 'error'; createdAt: string; }
export interface ProjectDashboardData {
  project: ProjectAutomation; account: AccountValidation; stories: Story[]; rejectedTopics: RejectedTopic[];
  redditSources?: RedditSource[]; clips?: QueuedClip[]; publishedClips?: QueuedClip[]; activity: Activity[];
  currentJobStatus: string; recentErrors: Array<{storyId?:string;clipId?:string;message:string;status:string}>;
  lastSuccessfulGeneration?: string; lastUpload?: string;
}
export interface ProjectInput {
  name: string; contentType: ContentType; nicheId?: string; accountId: string; language: string;
  uploadTime: string; timezone: string; visualType: VisualType; automationMode: AutomationMode;
  automationEnabled: boolean; redditConfig?: RedditConfig;
}
