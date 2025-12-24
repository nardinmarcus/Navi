# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Navi** (formerly NavSphere) is a modern navigation management platform built with Next.js 15. It uses a GitHub repository as the data storage backend via GitHub API, with authentication through NextAuth.js using GitHub OAuth.

### Tech Stack
- **Next.js 15.5.7** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript 5.1.6** - Type safety
- **Tailwind CSS 4.1.12** - Styling
- **NextAuth.js 5.0.0-beta.25** - Authentication
- **Radix UI** - Accessible UI components
- **@tanstack/react-query 5.62.2** - Data fetching and state management
- **@hello-pangea/dnd 17.0.0** - Drag and drop functionality

## Common Commands

```bash
# Development
pnpm dev          # Start development server (port 3000)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm clean        # Remove .next build directory

# Docker
pnpm docker:build  # Build Docker image
pnpm docker:dev    # Start development containers
pnpm docker:prod   # Start production containers
pnpm docker:stop   # Stop containers
pnpm docker:logs   # View container logs
```

## Environment Variables

Required environment variables (see `.env.example`):

```env
# GitHub OAuth App
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# GitHub Data Repository
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-data-repo-name
GITHUB_BRANCH=main

# NextAuth
NEXTAUTH_URL=http://localhost:3000/api/auth
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Note**: The GitHub OAuth app requires `repo` scope to access the data repository.

## Architecture

### Data Storage Pattern
This application uses **GitHub as a database**. All navigation data, site configuration, and resources are stored as JSON files in a GitHub repository:

- `navigation.json` - Navigation structure with categories and items
- `site.json` - Site configuration (title, description, appearance)
- `resources.json` - Additional resource sections

Data is read/written via GitHub API using OAuth access tokens stored in the user session.

### Directory Structure

```
app/
├── api/                    # API routes (App Router)
│   ├── auth/              # NextAuth.js configuration
│   ├── navigation/        # Navigation CRUD operations
│   ├── site/              # Site configuration
│   └── resource/          # Resource management
├── admin/                 # Admin dashboard pages
│   └── navigation/        # Navigation management UI
├── components/            # App-specific components
├── types/                 # TypeScript type definitions
├── middleware.ts          # Auth middleware
└── layout.tsx             # Root layout with providers

components/                # Shared components
├── ui/                   # Radix UI primitives
├── admin/                # Admin-specific components
└── navigation-*.tsx      # Navigation display components

lib/                      # Core utilities
├── github.ts            # GitHub API integration (getFileContent, commitFile)
├── api.ts               # Client-side API functions
├── auth.ts              # NextAuth helpers
└── utils.ts             # General utilities
```

### Key Concepts

**Navigation Data Structure** (`app/types/navigation.ts`):
- `NavigationItem` - Top-level category with icon and items
- `NavigationSubItem` - Individual link with bilingual title/description
- `NavigationSubCategory` - Nested categories within items

**Authentication Flow**:
1. User signs in with GitHub OAuth
2. Access token stored in session (`session.user.accessToken`)
3. API routes use token to authorize GitHub API requests
4. `lib/github.ts` handles all GitHub interactions with retry logic

**File Commit Pattern** (`lib/github.ts`):
- Reads current file SHA to avoid conflicts
- Implements exponential backoff retry (3 attempts)
- Returns empty default data if file doesn't exist (404)

## Important Implementation Details

### GitHub API Integration
- Always use `lib/github.ts` functions for GitHub operations
- `getFileContent(path)` - Fetches JSON with 404 fallback
- `commitFile(path, content, message, token)` - Writes with retry logic
- User agent header is required: `'User-Agent': 'NavSphere'`

### Admin Route Protection
Protected routes use `middleware.ts` which redirects unauthenticated users to `/auth/signin`. The admin dashboard is under `/admin/`.

### Path Alias Configuration
The project uses `@/*` alias mapping to root (configured in `tsconfig.json`):
```typescript
import { something } from '@/lib/github'  // Resolves to ./lib/github
```

### Deployment Configurations
- **Vercel**: Requires environment variables via dashboard
- **Cloudflare Pages**: Uses `@cloudflare/next-on-pages` adapter
- **Docker**: `next.config.js` has `output: 'standalone'` enabled
- Build output: `.vercel/output/static` for Cloudflare

### Image Domains
External images are allowed from any HTTPS domain (`remotePatterns` in `next.config.js`).

## Code Patterns

### Creating API Routes
```typescript
// app/api/endpoint/route.ts
import { auth } from '@/lib/auth'
import { commitFile } from '@/lib/github'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.accessToken) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Handle request, commit to GitHub
  await commitFile(path, content, message, session.user.accessToken)
}
```

### Client-Side API Calls
```typescript
// Use lib/api.ts functions or fetch directly
import { updateNavigation } from '@/lib/api'
await updateNavigation(id, data)
```

### Type Imports
Navigation types are in `app/types/navigation.ts` but also exported from root level for convenience.

## Testing Notes

- No test framework is currently configured
- API routes should be tested with proper GitHub credentials
- The `health` endpoint at `/api/health` is available for deployment checks
