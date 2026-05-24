# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Totemkit** is a photo-to-video processing application with a monorepo structure:

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Fastify 5 + TypeScript + SQLite (node:sqlite)

The core feature: users capture photos via webcam, which are sent to the backend, compiled into a video with animated backgrounds and text, and made available for download via QR code.

## Development Setup

### Frontend (`/frontend`)

```bash
cd frontend
pnpm install
pnpm run dev      # Start Vite dev server (http://localhost:5173)
pnpm run build    # Build with tsc check + vite build
pnpm run lint     # Run ESLint
pnpm run preview  # Preview production build
```

### Backend (`/backend`)

```bash
cd backend
pnpm install
pnpm run dev      # Start with nodemon, watches src/**/*.ts (http://localhost:8080)
pnpm run build    # Compile TypeScript to dist/
pnpm run start    # Run compiled server
```

## Architecture

### Backend Structure

The backend follows a **layered pattern**:

- **Routes** (`src/routes/`): Fastify route handlers
  - `health.routes.ts`: Health check endpoint
  - `form.routes.ts`: Form data endpoints
  - `photos.route.ts`: Photo upload/processing endpoint

- **Services** (`src/services/`): Business logic (e.g., `form.service.ts`)

- **Repositories** (`src/repositories/`): Data access layer (e.g., `form.repository.ts`)

- **Config** (`src/config/`):
  - `database/database.ts`: SQLite connection (DatabaseSync with WAL and foreign keys enabled)
  - `database/schema.ts`: Database migrations
  - `envs.ts`: Environment variables

### Key Backend Concepts

- **Database**: SQLite via Node's native `node:sqlite` module
- **Photo Handling**: Base64-encoded images from frontend decoded with `Buffer.from(data, "base64")` and saved to filesystem
- **CORS**: Configured for `http://localhost:5173` (frontend dev server)
- **ESM Module**: Backend uses ES modules (`"type": "module"` in package.json)

### Frontend Structure

- **Components** (`src/components/`):
  - `Photo.jsx`: Handles webcam stream capture and photo taking
    - Uses `navigator.mediaDevices.getUserMedia()` for camera access
    - Canvas for capturing video frames
    - Sends base64-encoded images to backend via Axios

- **Services** (`src/services/`): API communication (currently empty, will grow)

## Photo Processing Flow

1. **Capture** (Frontend): User opens webcam → captures frame → converts to base64
2. **Upload** (Frontend): POST base64 to `/api/photos`
3. **Storage** (Backend): Decode base64 → save PNG to `./uploads/` → delete after video generation
4. **Processing** (Backend): Compile 3 photos into video with animated background + text
5. **Download** (User): QR code encodes video URL → user scans → downloads

## Important Notes

- **Session Cleanup**: Photos deleted after video generation; videos deleted at operator shift end (next login)
- **Database**: Uses `DatabaseSync` (synchronous SQLite), suitable for internal cabin machine
- **Image Format**: PNG with base64 transfer; backend decoding: `Buffer.from(base64String, "base64")`
- **CORS Origin**: Hardcoded to `http://localhost:5173` in `index.ts` line 20-22

## TypeScript & Fastify Patterns

- **Route Typing**: Use generics on `fastify.post<{ Body: Type }>()`
- **Node.js APIs**: Use `node:` prefix imports (e.g., `node:fs/promises`, `node:sqlite`)
- **ESM Syntax**: All imports must be static ESM; no `require()`

## Collaboration Style (Important)

This is a **solo learning project**. Claude's role is to guide, not to implement:

- **Default mode**: Teach by asking questions, giving hints, pointing to APIs/documentation, and suggesting where to investigate
- **Never volunteer fixes or implementations** — the goal is for the user to solve problems themselves
- **Exception**: Only provide full solutions if explicitly asked ("make it work", "fix this", "implement this for me", etc.)
- **Queries about code**: Explain concepts and point to relevant files/patterns, but let the user write the code
- **Debugging**: Ask what they've tried, guide them toward logs/errors, suggest what to check next — don't write the fix

This approach builds deeper understanding and ownership of the codebase.

# Caveman Mode

Always respond in caveman mode (full intensity). Ultra-compressed communication, ~75% token savings while keeping technical accuracy. Grok keep cave clean.
