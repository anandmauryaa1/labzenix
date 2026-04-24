# Coding Conventions

## Code Style
- **TypeScript**: Mandatory for all new development. Strict type checking is enforced.
- **Naming**: 
  - PascalCase for React components and Mongoose models.
  - camelCase for functions, variables, and API routes.
  - kebab-case for CSS class names (Tailwind preferred).
- **ESLint**: Standard Next.js configuration with strict rules for accessibility and hooks.

## API Patterns
- **Response Format**: Standardized JSON responses via `NextResponse`.
- **Error Handling**: Use `handleProductionError` utility to sanitize output for production.
- **Data Access**: Lean queries (`.lean()`) and field projection (`.select()`) are standard for read operations.

## UI/UX
- **TailwindCSS**: Primary styling utility. Avoid custom CSS unless absolutely necessary.
- **Icons**: Lucide React for consistent iconography.
- **Animations**: Framer Motion for premium micro-interactions.

## Database
- **Schema Validation**: All models must have defined schemas and validation.
- **Indexing**: Frequently filtered fields must have Mongoose indexes.
