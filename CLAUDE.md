# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a React Native/Expo monorepo built with Tamagui, Expo Router, and Supabase. The primary app is located in `apps/mobile/` with shared packages in `packages/`.

**Key directories:**
- `apps/mobile/` - Main Expo React Native app
- `packages/shared/` - Shared TypeScript types and utilities  
- `packages/api-schema/` - Zod schemas for API validation
- `packages/ui/` - Shared UI components (Tamagui-based)
- `supabase/` - Database migrations and configuration

## Development Commands

**Setup:**
- `npm install` - Install all dependencies

**Root-level commands (run from project root):**
- `npm run mobile` - Start mobile development server
- `npm run ios` - Run iOS simulator  
- `npm run android` - Run Android emulator
- `npm run typecheck` - Type check all workspaces
- `npm run lint` - Lint all workspaces  
- `npm run test` - Run tests in all workspaces
- `npm run format` - Format code with Prettier
- `npm run ci:all` - Run full CI pipeline (typecheck, lint, format check, tests)

**Mobile app commands (from `apps/mobile/`):**
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run prebuild` - Generate native code for development builds

## Testing

- Jest is configured for unit testing with React Testing Library
- Test files use `.spec.ts` or `.spec.tsx` extensions
- Setup file: `apps/mobile/jest-setup.ts`
- Run single test: `npm test <test-file-name>`

## Code Style & Linting

- Uses ESLint for linting (`eslint.config.mjs`)
- Prettier for code formatting
- TypeScript strict mode enabled
- Console statements limited to warn/error only

## Architecture

**Mobile App Structure:**
- `app/` - Expo Router file-based routing
- `src/features/` - Feature-based organization (currently `workout/`)
- Each feature contains: `components/`, `hooks/`, `services/`, `types.ts`

**State Management:**
- React built-in hooks (useState, useReducer) 
- Custom hooks for complex state (e.g., `useWorkoutState`, `useRestTimer`)
- Mock services for development (`workoutService.ts`)

**UI Framework:**
- Tamagui for cross-platform styling and components
- Custom UI package (`@my/ui`) in `packages/ui/`
- Configuration in `apps/mobile/tamagui.config.ts`

## Database

- Supabase for backend services
- Local development with Supabase CLI
- Migrations in `supabase/migrations/`
- Configuration in `supabase/config.toml`
- Default local ports: API (54321), DB (54322), Studio (54323)

## Key Technologies

- **Framework:** Expo SDK 53 with React Native 0.79
- **Navigation:** Expo Router (file-based routing)
- **UI:** Tamagui + React Navigation
- **Language:** TypeScript 5.8
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Testing:** Jest + React Testing Library
- **Monorepo:** npm workspaces with Turbo (migrated from yarn)

## Workout Feature

Currently implementing a comprehensive workout tracking system. See `docs/features/workout/spec.md` for detailed specifications. Key components:

- **Types:** Comprehensive interfaces in `src/features/workout/types.ts`
- **State:** `useWorkoutState` hook manages active sessions
- **UI:** Exercise cards, weight/reps steppers, rest timer
- **Services:** Mock API with simulated network delays

## Development Notes

- Node.js >=18 and npm >=8 required
- Use absolute imports within features
- Follow existing component patterns and file organization
- Memoize components for performance when needed
- Test coverage expected for new utilities and components