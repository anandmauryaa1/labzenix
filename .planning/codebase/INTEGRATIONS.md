# Integrations

## Internal Integrations
- **Mongoose / MongoDB**: Primary data store for products, blogs, users, inquiries, and settings.
- **Next.js API Routes**: Backend logic handled via serverless functions in `src/app/api`.
- **JWT Auth**: Centralized authentication utility in `src/lib/auth.ts` managing session tokens.

## External Services
- **Cloudinary**: Used for technical catalog uploads (PDFs) and product/blog image hosting.
- **Google Analytics**: Integrated for dashboard insights (reference to Conversation 96ceba5d).

## Storage Patterns
- **Local File System**: Used for dynamic sitemaps and robots.txt generation.
- **Environment Variables**: Managed via `.env.local` for sensitive keys (MONGODB_URI, JWT_SECRET, CLOUDINARY_*).
