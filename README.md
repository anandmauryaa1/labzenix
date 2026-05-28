# LabZenix - Laboratory Equipment & Solutions Platform

A production-ready Next.js application for managing laboratory equipment products, specifications, blogs, and admin operations with secure authentication and comprehensive content management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17+
- MongoDB (cloud or local)
- npm 9+

### Local Setup (2 minutes)

```bash
# 1. Clone repository
git clone <repository-url>
cd labzenix

# 2. Install dependencies
npm install

# 3. Create .env.local (copy from .env.example)
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and Cloudinary credentials

# 4. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**Admin panel**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📚 Documentation

### For Development
📖 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup, running locally, and troubleshooting

### For Production
🚀 **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - Security checklist, deployment steps, and monitoring

---

## ✨ Features

### 🔐 Security
- JWT-based admin authentication
- CSRF protection on all state-changing requests  
- Role-based access control (admin, SEO, marketing)
- Secure password hashing
- Security headers configured

### 📦 Content Management
- Product catalog with categories and specifications
- Blog system with rich text editor
- FAQ management
- Image uploads (Cloudinary integration)
- SEO optimization and metadata

### 📊 Admin Dashboard
- Analytics and statistics
- User and permission management
- Product/blog/content management
- Settings configuration
- Inquiry tracking

### 🌐 Public Site
- Responsive product catalog
- Blog reader
- Contact form
- SEO-friendly URLs and metadata
- Performance optimized

---

## 🏗 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (public)/        # Public pages (home, products, blogs)
│   ├── admin/           # Admin dashboard
│   └── api/             # Backend API routes
├── components/          # React components
├── lib/                 # Utilities (auth, db, logging, env validation)
├── models/              # MongoDB schemas (Mongoose)
└── middleware.ts        # Authentication & CSRF protection
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TailwindCSS, Next.js 16 |
| **Backend** | Node.js, Next.js API Routes |
| **Database** | MongoDB + Mongoose ORM |
| **Auth** | JWT + HttpOnly Cookies |
| **Images** | Cloudinary CDN |
| **Language** | TypeScript |

---

## 📋 Common Commands

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm start             # Run production build
npm run lint          # Check for code issues

# Database seeding
node scripts/seed-admin.mjs   # Create default admin user
```

---

## 🔒 Security Features

✅ **CSRF Protection** - Automatic token validation on POST/PUT/DELETE  
✅ **JWT Authentication** - Secure token-based admin access  
✅ **Role-Based Access** - Granular permission system  
✅ **Environment Validation** - Checks for required config at startup  
✅ **Security Headers** - XSS, clickjacking, and MIME type protection  
✅ **Password Hashing** - bcrypt for secure password storage

---

## 📊 API Endpoints

### Public
- `GET /api/products` - All products
- `GET /api/products/[id]` - Single product
- `GET /api/blogs` - All blogs
- `POST /api/inquiries` - Contact form

### Protected (Admin)
All admin endpoints require JWT authentication (automatically handled by middleware)

- `POST /api/admin/login` - Login
- `GET/POST/PUT/DELETE /api/admin/products` - Manage products
- `GET/POST/PUT/DELETE /api/admin/blogs` - Manage blogs
- And more for settings, users, analytics, etc.

See [SETUP_GUIDE.md](./SETUP_GUIDE.md#api-documentation) for full API list.

---

## 🚀 Deployment

**Recommended**: [Vercel](https://vercel.com) (zero-config Next.js hosting)

**Also supported**: AWS, DigitalOcean, Railway, Render, etc.

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for:
- Security checklist
- Step-by-step deployment
- Environment setup
- Monitoring configuration

---

## 🐛 Troubleshooting

### `npm run dev` fails with "next not found"
→ Run `npm install`

### MongoDB connection fails
→ Check connection string in `.env.local` and IP whitelist in MongoDB Atlas

### Admin login doesn't work
→ Run `node scripts/seed-admin.mjs` to create default admin

See [SETUP_GUIDE.md#troubleshooting](./SETUP_GUIDE.md#troubleshooting) for more solutions.

---

## 📈 Production Readiness

✅ Build passes without errors  
✅ Environment validation enforced  
✅ Security headers configured  
✅ CSRF protection enabled  
✅ Error handling implemented  
✅ Logging configured  
✅ Database optimized (no duplicate indexes)  

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for pre-deployment checklist.

---

## 📞 Support Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

## 📝 License

All rights reserved

---

**Version**: 0.1.0  
**Last Updated**: May 28, 2026  
**Status**: Production Ready ✅

