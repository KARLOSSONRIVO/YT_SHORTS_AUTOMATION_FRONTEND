# FACELESS_VIDEO_FRONTEND

Starter frontend scaffold for the YouTube Shorts automation dashboard.

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
- `GET /api/project`
- `GET /api/project/:projectId`
- `GET /api/job?projectId=...`
- `GET /api/clip?projectId=...`
- `PATCH /api/clip/:clipId/review`
- `GET /api/subtitle/clips/:clipId`
- `GET /api/channel?userId=...`
- `GET /api/channel/oauth/url?userId=...`
- `POST /api/publish`

## Notes

- Register or log in first so the frontend can use a real Mongo user id for project and channel queries.
- Clip metadata update and scheduled publishing UI can be added once backend endpoints exist.
