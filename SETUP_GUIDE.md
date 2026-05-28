# LabZenix Setup & Development Guide

This guide will help you set up and run LabZenix locally or deploy it to production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Running the Application](#running-the-application)
4. [Project Structure](#project-structure)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js**: 18.17 or later ([download](https://nodejs.org))
- **npm**: 9+ (comes with Node.js)
- **MongoDB**: Local or cloud instance (MongoDB Atlas recommended)
- **Git**: For version control

### Check Versions

```bash
node --version      # Should be 18.17+
npm --version       # Should be 9+
```

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd labzenix
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages:
- Next.js 16.2.6
- React 19.2.4
- Mongoose (MongoDB ORM)
- TailwindCSS (styling)
- Other utilities (authentication, image hosting, etc.)

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory. Copy from `.env.example` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/labzenix

# Security (generate with: openssl rand -base64 32)
JWT_SECRET=your_very_secure_random_jwt_secret_here_at_least_32_chars

# Image hosting (get from Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**⚠️ Important**: 
- Never commit `.env.local` to git
- `.env.local` is already in `.gitignore`

### 4. Set Up MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and project
3. Create a cluster
4. Create database user with username/password
5. Get connection string (looks like: `mongodb+srv://user:pass@...`)
6. Add your IP to whitelist
7. Paste connection string in `.env.local`

#### Option B: Local MongoDB

```bash
# On Windows (if using MongoDB installer)
# MongoDB runs as a Windows Service

# On Mac (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

Connection string for local: `mongodb://localhost:27017/labzenix`

### 5. Seed Initial Admin User (Optional)

```bash
node scripts/seed-admin.mjs
```

This creates a default admin user. You can then change the password via the admin panel.

---

## Running the Application

### Start Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000`

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API**: http://localhost:3000/api

### Stop the Server

Press `Ctrl+C` in the terminal

### Hot Reload

The dev server automatically reloads when you save files (no manual restart needed)

---

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `.next/` directory.

### Run Production Build Locally

```bash
npm run build
npm start
```

This runs the production build on `http://localhost:3000`

---

## Project Structure

```
labzenix/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── (public)/        # Public pages (homepage, products, etc.)
│   │   ├── admin/           # Admin dashboard routes
│   │   └── api/             # Backend API routes
│   ├── components/          # React components
│   │   ├── admin/           # Admin-specific components
│   │   ├── home/            # Homepage components
│   │   └── ui/              # Reusable UI components
│   ├── lib/                 # Utility functions
│   │   ├── auth.ts          # Authentication helpers
│   │   ├── dbConnect.ts     # MongoDB connection
│   │   ├── env.ts           # Environment validation
│   │   └── logger.ts        # Logging utility
│   ├── models/              # Mongoose database schemas
│   │   ├── Product.ts
│   │   ├── Blog.ts
│   │   └── User.ts
│   ├── middleware.ts        # Next.js middleware (auth, CSRF)
│   └── instrumentation.ts   # Telemetry/monitoring setup
├── public/                  # Static files (images, manifests)
├── scripts/                 # Utility scripts
│   └── seed-admin.mjs       # Admin seeding script
├── .env.example             # Environment template
├── .env.local               # Local environment (not committed)
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # TailwindCSS configuration
└── package.json             # Dependencies and scripts
```

---

## Key Features

### ✅ Authentication & Authorization
- JWT-based admin authentication
- Role-based access control (admin, SEO, marketing)
- Permission checks on routes and APIs
- Secure password reset flow

### ✅ Security
- CSRF protection on all state-changing requests
- Security headers configured
- Password hashing with bcrypt
- Secure JWT tokens

### ✅ Content Management
- Product management with categories
- Blog system with rich text editor
- FAQ management
- Image uploads to Cloudinary
- SEO optimization

### ✅ Admin Dashboard
- Analytics and statistics
- User management
- Content management
- Settings configuration
- Inquiry tracking

### ✅ Public Features
- Product catalog
- Blog reader
- Contact form
- Responsive design
- SEO-friendly URLs

---

## API Documentation

### Public Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get product by ID
- `GET /api/blogs` - Get all blogs
- `GET /api/categories` - Get all product categories
- `POST /api/inquiries` - Submit contact form

### Admin Endpoints (Protected)

All admin endpoints require JWT authentication

- `POST /api/admin/login` - Admin login
- `GET /api/admin/products` - Get products (admin view)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product
- Similar patterns for blogs, categories, settings, etc.

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm start                # Run production build

# Linting
npm run lint             # Check code for issues

# Database
node scripts/seed-admin.mjs   # Seed initial admin user

# Cleanup
rm -rf .next            # Remove build cache
rm -rf node_modules     # Remove dependencies (then npm install)
```

---

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | Database connection | `mongodb+srv://user:pass@cluster...` |
| `JWT_SECRET` | Token signing key | Auto-generated, min 32 chars |
| `CLOUDINARY_CLOUD_NAME` | Image host | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Image upload auth | `123456789` |
| `NEXT_PUBLIC_SITE_URL` | Public URL | `https://app.labzenix.com` |
| `NODE_ENV` | Runtime environment | `production` or `development` |

---

## Deployment

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for complete deployment guide including:

- Security checklist
- Environment configuration
- Deployment platforms (Vercel, AWS, DigitalOcean, etc.)
- Monitoring setup
- Post-deployment verification

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Deploy to production
vercel --prod
```

---

## Troubleshooting

### npm run dev gives "next is not recognized"

**Solution**: Install dependencies
```bash
npm install
```

### MongoDB connection fails

**Check**:
1. Is MongoDB running? (check MongoDB Atlas or local service)
2. Is connection string correct in `.env.local`?
3. Is your IP whitelisted? (if using MongoDB Atlas)

**Debug**:
```bash
# Test connection string
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('✓ Connected')).catch(e => console.log('✗ Failed:', e.message))"
```

### Build fails

**Check**:
1. All environment variables set correctly
2. TypeScript errors: `npm run build` shows them
3. Database connection works

### Admin login doesn't work

**Solution**:
1. Seed default admin: `node scripts/seed-admin.mjs`
2. Use admin panel to change password
3. Check browser console for errors

### Images won't upload

**Check**:
1. Cloudinary credentials are correct
2. Cloudinary account has upload permissions
3. Check browser console for upload errors

### CSRF validation errors

**This means**: POST/PUT/DELETE requests need CSRF tokens
- Middleware automatically handles this for form submissions
- If using custom fetch, include `x-csrf-token` header

---

## Performance Tips

1. **Images**: All images should be <500KB (Cloudinary handles compression)
2. **Database**: Add indexes to frequently queried fields
3. **Caching**: Use Next.js ISR (Incremental Static Regeneration) for blogs
4. **Bundle**: Keep component sizes reasonable

---

## Support & Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Docs](https://docs.mongodb.com/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)

---

## License

LabZenix - All rights reserved

---

**Last Updated**: May 28, 2026
**Version**: 0.1.0
