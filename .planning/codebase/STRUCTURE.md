# Directory Structure

```text
src/
├── app/                  # Next.js App Router root
│   ├── (public)/         # Customer-facing routes
│   ├── admin/            # Administrative dashboard
│   ├── api/              # Backend REST API endpoints
│   ├── blogs/            # Knowledge center routes
│   ├── products/         # Catalog routes
│   └── layout.tsx        # Root layout with shared UI
├── components/           # Reusable UI components
│   ├── admin/            # Dashboard-specific UI
│   ├── layout/           # Shared components (Navbar, Footer)
│   ├── ui/               # Atomic Design primitives
│   └── ...               # Feature-specific components (blog, home, products)
├── lib/                  # Shared utilities and core logic
│   ├── auth.ts           # JWT and permission logic
│   ├── dbConnect.ts      # Mongoose connection pooling
│   └── cacheRevalidation.ts # Cache invalidation utility
├── models/               # Mongoose schemas and model definitions
├── scripts/              # Database seeding and maintenance scripts
├── store/                # Zustand global state stores
└── proxy.ts              # Next.js 16 request routing and security
```

## Key Files
- `package.json`: Dependency and script management.
- `next.config.ts`: Framework-level configuration.
- `src/proxy.ts`: Application-wide security and routing logic.
- `.planning/`: Project management and codebase mapping metadata.
