# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SpaceDF is a Next.js web application for IoT tracking and digital twin visualization built by Digital Fortress. It provides real-time device tracking, 3D mapping, dashboard widgets, and space management capabilities.

## Common Development Commands

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier

## Architecture

### Framework Stack

- **Next.js 14** with App Router and TypeScript
- **Authentication**: NextAuth.js v5 with JWT sessions
- **Internationalization**: next-intl (English/Vietnamese)
- **State Management**: Zustand stores
- **Data Fetching**: SWR for client-side data
- **UI Components**: Radix UI + Tailwind CSS + shadcn/ui
- **Mapping**: Mapbox GL + deck.gl for 3D visualization
- **Real-time**: MQTT client integration

### Project Structure

#### Core Directories

- `src/app/[locale]/[organization]/` - Main app routes with dynamic org/space routing
- `src/components/` - Reusable UI components (common/, icons/, layouts/, ui/)
- `src/containers/` - Page-specific container components (dashboard/, devices/, identity/, space/)
- `src/lib/` - Core utilities (auth.ts, spacedf.ts, mqtt.ts)
- `src/stores/` - Zustand state management
- `src/hooks/` - Custom React hooks
- `src/utils/` - Helper functions and utilities

#### Key Architecture Patterns

**Multi-tenant Organization Structure**:

- URL pattern: `/{locale}/{organization}/{space-slug}/...`
- Subdomain routing handled in middleware.ts
- Organization context derived from URL/subdomain

**Authentication Flow**:

- NextAuth.js with custom SpaceDF SDK integration
- JWT sessions with 60-minute expiration
- Token refresh handled automatically
- Auth middleware in `src/lib/auth-middleware/`

**Data Layer**:

- SpaceDF SDK client (`@space-df/sdk`) as primary API interface
- Singleton pattern for SpaceDF client management
- SWR for caching and real-time updates
- Custom hooks pattern: `useGetSpaces`, `useDevices`, etc.

**Internationalization**:

- next-intl with locale-based routing
- Message files in `/messages/{locale}/`
- Middleware handles locale detection and subdomain routing

**UI Architecture**:

- Design system built on Radix UI primitives
- Tailwind CSS with custom design tokens
- shadcn/ui component patterns
- Theme system with dark/light mode support

**Real-time Features**:

- MQTT client for device telemetry
- WebSocket connections for live updates
- 3D device visualization with deck.gl
- Interactive dashboards with recharts

### Development Patterns

**Component Organization**:

- Page containers in `src/containers/`
- Reusable UI in `src/components/ui/`
- Icons in `src/components/icons/`
- Layout components in `src/components/layouts/`

**State Management**:

- Zustand stores for global state
- Store files: `dashboard-store.ts`, `device-store.ts`, `space-store.ts`
- React Hook Form for form state with Zod validation

**API Integration**:

- SpaceDF SDK client wrapper in `src/lib/spacedf.ts`
- Custom hooks for data fetching in each domain
- Error handling utilities in `src/utils/error.ts`

**Styling**:

- Tailwind CSS with custom configuration
- CSS variables for theming in `src/styles/color-variables.css`
- Component variants using `class-variance-authority`

## Key Configuration Files

- `next.config.mjs` - Next.js config with next-intl integration
- `tailwind.config.ts` - Custom design system configuration
- `eslint.config.mjs` - ESLint with TypeScript and Next.js rules
- `tsconfig.json` - TypeScript configuration with path aliases (`@/*`)

## Environment Requirements

Required environment variables:

- `NEXTAUTH_SECRET` - NextAuth.js secret
- `SPACE_API_KEY` - SpaceDF SDK API key
- Additional config in `src/shared/env.ts`

## Important Implementation Notes

- No testing framework currently configured
- Uses Yarn 1.22.22 as package manager
- Husky + lint-staged for git hooks
- React Strict Mode disabled in next.config.mjs
- Path aliases configured: `@/*` maps to `./src/*`
- 3D models stored in `/public/3d-model/`
