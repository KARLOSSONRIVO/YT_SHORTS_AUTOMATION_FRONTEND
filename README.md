# Studio Pro

YouTube Shorts clipping dashboard for source uploads, YouTube links, clip review, captions, and publishing.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- TanStack Query
- React Hook Form
- Zod

## Setup

1. Copy `.env.example` to `.env.local`
2. Install dependencies with `npm install`
3. Run the app with `npm run dev`

## Backend contract used

- `POST /api/upload`
- `GET /api/projects`
- `GET /api/projects/:projectId`
- `GET /api/job?projectId=...`
- `GET /api/clip?projectId=...`
- `PATCH /api/clip/:clipId/review`
- `GET /api/subtitle/clips/:clipId`
- `GET /api/channel?userId=...`
- `GET /api/channel/oauth/url?userId=...`
- `POST /api/publish`

## Notes

- Register or log in first so the frontend can use a real Mongo user id for project and channel queries.
- Create Project opens source-video clipping. Use a YouTube link or queue a finished clip from the same page.
- Finished-clip queues support scheduling, file replacement, reordering, retry, and upload.
- AI story and Reddit generation are no longer available.
