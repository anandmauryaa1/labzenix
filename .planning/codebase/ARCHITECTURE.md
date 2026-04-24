# Architecture

## System Overview
LabZenix is a modern industrial catalog and knowledge management platform built on Next.js 16 with a serverless-first architecture. It follows the **App Router** paradigm with a clear separation between public-facing pages and a secured administrative console.

## Architectural Patterns
- **Server-Side Rendering (SSR)**: Used for dynamic content like product details and blog posts to ensure SEO visibility.
- **Client-Side Hydration**: Used for interactive dashboard components and form management.
- **Repository-ish Pattern**: Models in `src/models` define schemas, while `src/lib` contains shared business logic and utilities.
- **Middleware/Proxy Architecture**: Strict authentication and request routing handled via `src/proxy.ts`.

## Routing Strategy
- **(public)**: Grouped routes for the customer-facing storefront.
- **admin**: Secured administrative dashboard routes.
- **api**: RESTful endpoints for data operations, organized by resource.

## State & Data Flow
- **Global UI State**: Managed via Zustand (`src/store`).
- **Persistence**: MongoDB with Mongoose ODM.
- **Cache Control**: Next.js Data Cache with manual revalidation tags for instant admin-to-public updates.
