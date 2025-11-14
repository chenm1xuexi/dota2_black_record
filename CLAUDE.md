# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dota 2 Battle Management System** - A full-stack web application for managing Dota 2 matches, players, and heroes. The system tracks match outcomes, player statistics, hero performance, and provides data visualization for analysis.

### Tech Stack
- **Frontend**: React 19, Vite, TailwindCSS 4.x, Radix UI, Wouter (routing), Framer Motion, React Hook Form, Recharts
- **Backend**: tRPC v11, Drizzle ORM, Express
- **Database**: MySQL with Drizzle ORM
- **Package Manager**: pnpm
- **Testing**: Vitest
- **Styling**: TailwindCSS with Dota 2-themed dark mode
- **Auth**: Custom JWT-based authentication with cookies

## Common Commands

### Development
```bash
# Start development server (runs server/_core/index.ts with hot reload)
pnpm dev

# Build for production (Vite build + esbuild server bundle)
pnpm build

# Start production server (after build)
pnpm start

# Type check without emitting
pnpm check

# Format code with Prettier
pnpm format

# Run all tests
pnpm test

# Run single test file
pnpm test filename.test.ts

# Run specific test
pnpm test -- grep "test name"

# Database operations
pnpm db:push  # Generate and run Drizzle migrations
```

## Architecture

### Directory Structure
```
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # Radix UI-based components (40+ components)
│   │   │   ├── AIChatBox.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Map.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── pages/            # Route pages with Wouter routing
│   │   │   ├── Home.tsx      # Dashboard with statistics
│   │   │   ├── Players.tsx   # Player CRUD management
│   │   │   ├── Heroes.tsx    # Hero management
│   │   │   ├── Matches.tsx   # Match management
│   │   │   ├── PlayerDetail.tsx
│   │   │   ├── HeroDetail.tsx
│   │   │   ├── MatchDetail.tsx
│   │   │   ├── HeroImport.tsx
│   │   │   └── Login.tsx
│   │   ├── contexts/         # React contexts (ThemeContext)
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities and configurations
│   │   ├── App.tsx          # Root with Wouter routing setup
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles with TailwindCSS
│   └── public/
│       ├── avatars/         # Player avatar images
│       └── heroes/          # Hero icon assets
│
├── server/                    # Backend API (tRPC + Express)
│   ├── _core/               # Core server utilities
│   │   ├── index.ts         # Server entry point (Express app + Vite)
│   │   ├── trpc.ts          # tRPC setup and procedures
│   │   ├── cookies.ts       # Session cookie management
│   │   ├── context.ts       # tRPC context creation
│   │   ├── env.ts           # Environment variables
│   │   ├── oauth.ts         # OAuth integration
│   │   ├── vite.ts          # Vite dev server integration
│   │   ├── sdk.ts           # Authentication service
│   │   └── systemRouter.ts  # System health routes
│   ├── db.ts                # Database operations with Drizzle
│   ├── routers.ts           # tRPC router definitions
│   └── storage.ts           # File storage logic
│
├── shared/                    # Shared types and utilities
│   ├── _core/               # Shared utilities
│   ├── types.ts             # Type exports from Drizzle schema
│   └── const.ts             # Shared constants (cookies, etc.)
│
├── drizzle/                  # Database schema and migrations
│   ├── schema.ts            # Drizzle table definitions
│   └── meta/                # Migration files
│
└── dist/                     # Built output
    └── public/              # Frontend build artifacts
```

### Database Schema (drizzle/schema.ts)

**Core Tables:**
- `players` - Dota 2 players with credentials and stats
  - Fields: nickname (unique), username (unique), password (bcrypt), bio, mmrRank, mentalScore, preferredPositions, icon
- `heroes` - Dota 2 heroes from official API
  - Fields: name (unique), nameLoc, primaryAttr, bioLoc, icon, indexImg, topImg, topVideo
- `matches` - Match records
  - Fields: matchDate (datetime), winnerSide ('radiant' | 'dire')
- `matchParticipants` - Many-to-many relationship between matches and players
  - Fields: playerId, heroId, teamSide ('radiant' | 'dire'), position (1-5), isMvp (0/1)

All tables include audit fields: `isDeleted` ('y'/'n'), `createTime`, `updateTime`, `createUserId`, `updateUserId`

### Backend API Architecture

**tRPC Routers** (server/routers.ts):
- `/api/trpc` - All API routes
- `auth` - Authentication and session management
  - login, me, logout
- `players` - Player CRUD + analytics
  - list, getById, create, update, delete, stats, heroStats, rivals
- `heroes` - Hero CRUD + analytics
  - list, getById, create, update, delete, stats
- `matches` - Match CRUD + details
  - list, getById, create, update, delete, details
- `system` - Health checks

**Database Layer** (server/db.ts):
- Centralized database operations using Drizzle ORM
- Soft deletes via `isDeleted = 'y'`
- Audit fields managed automatically
- Statistical queries for dashboards

**Server Setup** (server/_core/index.ts):
- Express app with tRPC middleware
- Auto-port detection (3000-3020)
- Vite integration for development (hot module replacement)
- Static file serving for production
- OAuth callback handling at `/api/oauth/callback`

### Frontend Architecture

**Routing** (Wouter - client/src/App.tsx):
- `/` - Home dashboard with statistics and charts
- `/login` - Authentication page
- `/players` - Player list with CRUD operations
- `/players/:id` - Player detail page
- `/heroes` - Hero management and listing
- `/heroes/:id` - Hero detail page
- `/heroes/import` - Hero import tool from JSON
- `/matches` - Match list with team composition
- `/matches/:id` - Match detail with MVP display

**State Management**:
- tRPC React Query for server state (automatic caching, invalidation)
- React contexts for client state (ThemeContext for dark/light mode)
- Zod for runtime schema validation on both client and server

**UI System**:
- 40+ Radix UI-based components in `client/src/components/ui/`
- TailwindCSS 4.x for styling (Dota 2-themed dark palette)
- React Hook Form for form management and validation
- Recharts for data visualization (win rates, player trends, statistics)

## Development Patterns

### Database Operations Pattern
- All database queries centralized in `server/db.ts`
- Use Drizzle ORM's `$inferSelect` and `$inferInsert` for type safety
- Implement soft deletes (set `isDeleted = 'y'`) instead of hard deletes
- Audit fields managed via Drizzle defaults with `$type<Date>()`

### API Layer Pattern
- tRPC procedures: `publicProcedure` (unauthenticated), `protectedProcedure` (requires auth)
- Input validation with Zod schemas on both client and server
- Context includes user information for audit trail
- Cookie-based JWT sessions (7-day expiration)

### Frontend Development Pattern
- All components use TypeScript with strict mode
- Wouter for declarative routing (not React Router)
- TailwindCSS utility classes with Dota 2 color scheme
- React Hook Form with Zod resolvers for form validation
- Recharts for interactive data visualizations
- Avatars stored in `client/public/avatars/` (PNG format)

### Authentication Flow
1. User submits credentials via `/login` page
2. `auth.login` tRPC mutation validates credentials with bcrypt
3. JWT session token created and set as HTTP-only cookie
4. Cookie automatically sent with subsequent requests
5. `auth.me` query returns current user info
6. `auth.logout` clears the session cookie

### Build System
- **Vite** for frontend development and build (ES modules, HMR)
- **esbuild** for server bundle (platform: node, format: esm)
- **TailwindCSS v4** integrated via `@tailwindcss/vite` plugin
- Build output: `dist/public/` for frontend static files, `dist/index.js` for server

## Key Files to Know

**Server Core:**
- `server/_core/index.ts` - Server entry point with Express + Vite setup
- `server/_core/trpc.ts` - tRPC initialization and procedure definitions
- `server/_core/cookies.ts` - Session cookie configuration and JWT handling
- `server/_core/context.ts` - tRPC context creation with user extraction
- `server/_core/sdk.ts` - Authentication service (password hashing, JWT)

**Server Logic:**
- `server/routers.ts` - tRPC route definitions (auth, players, heroes, matches)
- `server/db.ts` - Database queries, mutations, and Drizzle ORM operations

**Frontend Core:**
- `client/src/App.tsx` - Root component with Wouter routing and tRPC provider
- `client/src/lib/trpc.ts` - tRPC React client configuration
- `client/src/const.ts` - Frontend constants and configuration

**Database:**
- `drizzle/schema.ts` - Drizzle table definitions with Chinese comments
- `drizzle.config.ts` - Drizzle configuration for migrations

**Build Configuration:**
- `vite.config.ts` - Vite config with React, TailwindCSS, path aliases (@, @shared)
- `vitest.config.ts` - Vitest configuration for server-side tests

**Project Configuration:**
- `package.json` - Scripts, dependencies (React 19, tRPC v11, TailwindCSS 4.x)
- `tsconfig.json` - TypeScript configuration
- `.env` - Environment variables (DATABASE_URL, JWT_SECRET, etc.)

## Environment Configuration

**Required Environment Variables:**
- `DATABASE_URL` - MySQL connection string (format: `mysql://user:password@host:port/database`)
- `JWT_SECRET` - Secret key for JWT token signing
- `VITE_APP_ID` - Application identifier
- `OAUTH_SERVER_URL` - OAuth server endpoint (optional)

**Server Configuration** (server/_core/env.ts):
- Environment variables validated with defaults
- Production detection via `NODE_ENV === 'production'`
- Auto-port selection for development (3000-3020 range)

## Database Migration

1. **Update Schema**: Modify `drizzle/schema.ts` with table changes
2. **Generate Migrations**: Run `pnpm db:push` to auto-generate migration files
3. **Apply Migrations**: Same command applies migrations to database
4. **Migration Files**: Stored in `drizzle/meta/` directory

**Migration Command**: `pnpm db:push` (shorthand for `drizzle-kit generate && drizzle-kit migrate`)

## Testing

- **Test Runner**: Vitest configured in `vitest.config.ts`
- **Test Location**: Server-side tests only (`server/**/*.test.ts`, `server/**/*.spec.ts`)
- **Test Environment**: Node.js environment
- **Running Tests**:
  - All tests: `pnpm test`
  - Specific file: `pnpm test filename.test.ts`
  - Specific test: `pnpm test -- grep "test name"`
  - Watch mode: `pnpm test -- --watch` (if supported)

**Note**: Currently no test files exist in the codebase.

## Claude-Specific Configuration

**Claude Permissions** (`.claude/settings.local.json`):
- Allowed: MySQL queries on localhost:23330 (read-only operations)
- Allowed: `npm run build`
- Allowed: `npx tsc --noEmit`
- These permissions enable Claude to verify database state and build the project

## Data Flow Examples

### Creating a Match
1. Frontend form in `Matches.tsx` collects: matchDate, winnerSide, 10 player-hero-position combinations
2. tRPC mutation `matches.create` validates input with Zod
3. Creates record in `matches` table via Drizzle
4. Creates 10 records in `matchParticipants` table (5 radiant, 5 dire)
5. Returns success response with new match ID

### Dashboard Statistics
1. `Home.tsx` queries multiple tRPC endpoints simultaneously
2. Backend queries aggregate data via Drizzle ORM (win rates, player stats, hero performance)
3. Data pre-computed server-side for efficiency
4. Frontend renders with Recharts: line charts, bar charts, pie charts
5. Real-time data updates via tRPC React Query cache invalidation

### Authentication Flow
1. User submits form on `/login` page with React Hook Form
2. tRPC mutation `auth.login` called with credentials
3. Password validated with bcrypt comparison
4. JWT token created with user ID and expiry
5. Cookie set with HTTP-only, secure flags
6. User context updated, redirect to dashboard
7. Subsequent requests include cookie automatically

## Project-Specific Notes

- **Player Avatars**: 20 PNG files in `client/public/avatars/`
- **Hero Icons**: Stored in `client/public/heroes/dota2_hero_icons/`
- **OAuth Integration**: Available for external authentication (optional feature)
- **Theme System**: Dark mode with Dota 2 color palette (red/gold for Dire, green/blue for Radiant)
- **Vite Aliases**: `@` → `client/src`, `@shared` → `shared`
- **Patched Dependencies**: Wouter 3.7.1 with patch in `patches/` directory
