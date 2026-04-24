# Testing Strategy

## Current State
- **Manual Verification**: Primary method for UI and business logic validation.
- **Build-Time Checks**: TypeScript compilation and ESLint linting act as the first line of defense during the build process.
- **Seeding Verification**: Scripts in `src/scripts` allow for testing database connections and data integrity in isolation.

## Recommended Additions
- **Unit Testing**: Implementation of Jest or Vitest for critical business logic (auth, price calculation).
- **Integration Testing**: API route verification using tools like Supertest or Next.js's native testing utilities.
- **E2E Testing**: Playwright or Cypress for critical user paths (Product Inquiry, Admin Login).

## Maintenance
- **CI/CD**: Build validation is mandatory before any production deployment.
