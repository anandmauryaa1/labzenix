# Codebase Concerns

## Technical Debt
- **Type Casting**: Extensive use of `any` in some legacy components (e.g., product detail page data fetching) needs refactoring to strict interfaces.
- **Form Management**: Mixed use of controlled and uncontrolled components in early admin pages.

## Security
- **Data Sanitization**: Ensure all NoSQL queries are protected against injection (zod validation is largely in place but needs consistency).
- **Session Security**: Admin JWTs are secure, but CSRF protection could be further hardened.

## Performance
- **Image Optimization**: Many images rely on external URLs; migrating to Next.js Image with Cloudinary optimization is ongoing.
- **Bundle Size**: Monitor the growth of heavy dependencies like Tiptap.

## Infrastructure
- **Logs**: Better observability (Winston or external logging service) is required for production debugging beyond basic `console` output.
- **Environment Management**: Need a more robust validation utility for environment variables at startup.
