# Production Deployment Checklist & Guide

This document outlines all the steps needed to make LabZenix production-ready and deploy safely.

---

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] **JWT_SECRET**: Changed from default value to a secure 32+ character random string
  - Generate: `openssl rand -base64 32`
  - Store in CI/CD secrets, not in .env
  - Example: `JWT_SECRET=your_very_secure_random_jwt_secret_here`

- [ ] **MONGODB_URI**: Valid MongoDB production connection string
  - Use MongoDB Atlas or managed service
  - Include username and password
  - Enable IP whitelisting
  - Example: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/production`

- [ ] **CLOUDINARY_API_SECRET**: Stored only in server-side secrets
  - NEVER commit to .env files
  - ONLY used server-side in image upload APIs
  - Set via CI/CD environment variables for production

- [ ] **NEXT_PUBLIC_SITE_URL**: Set to production domain
  - Example: `NEXT_PUBLIC_SITE_URL=https://app.labzenix.com`
  - Must be HTTPS in production
  - Used for SEO, email links, and redirects

- [ ] **.env.local** file created from .env.example
  - [ ] Not committed to git
  - [ ] Contains real database credentials for local testing

### 2. Security Hardening

- [x] **CSRF Protection**: Enabled (no SKIP_CSRF=true in .env)
  - Middleware validates CSRF tokens on all state-changing requests (POST, PUT, DELETE, PATCH)
  - Tokens are checked via `x-csrf-token` header vs `csrf-token` cookie

- [x] **JWT Authentication**: Properly configured
  - JWTs signed with secure secret
  - Tokens stored in `HttpOnly` cookies (secure by default in middleware)
  - Token expiration implemented

- [x] **Security Headers**: Configured in next.config.ts
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: SAMEORIGIN
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: Restrict camera, microphone, geolocation

- [ ] **HTTPS/TLS**: Enforced in production
  - All traffic redirected from HTTP to HTTPS
  - SSL certificate configured on reverse proxy/load balancer
  - HSTS headers recommended (can be added to middleware if needed)

- [ ] **API Rate Limiting**: Consider adding to frequently called endpoints
  - Prevents brute force attacks on login, password reset
  - Consider using `next-rate-limit` or similar package

- [ ] **Admin Password**: Changed from default
  - Run seed script with new admin credentials
  - See: `scripts/seed-admin.mjs`

- [ ] **Database Security**: 
  - MongoDB user has minimal required permissions
  - IP whitelisting enabled
  - Regular backups configured

### 3. Performance Optimization

- [x] **Image Optimization**: Configured
  - Images cached for 1 year (immutable)
  - Cloudinary CDN used for delivery
  - Image quality optimized automatically

- [x] **Static Asset Caching**:
  - Public static files cached for 1 year
  - Next.js bundles use content hashing for cache-busting

- [x] **Compression**: Enabled
  - Gzip/Brotli compression on server

- [ ] **CDN**: Optional but recommended
  - Configure Vercel, Cloudflare, or similar for static assets
  - Reduces latency for global users

- [ ] **Database Query Optimization**:
  - Review API routes for N+1 query problems
  - Ensure indexes exist on frequently filtered fields
  - Use pagination for large result sets

- [ ] **Bundle Analysis**: Check production bundle size
  - Run: `npm run build && npm run analyze` (if analyzer configured)
  - Reduce bundle size if > 200KB

### 4. Error Handling & Logging

- [x] **Error Pages**: Configured
  - 404 page (not-found.tsx)
  - 500 error boundary (error.tsx)

- [x] **Logging**: Production logging configured
  - Errors logged with context
  - Can be sent to external service (Sentry, LogRocket, etc.)

- [ ] **Error Tracking Service**: Optional but recommended
  - Set up Sentry, DataDog, or similar
  - Captures production errors automatically
  - Add to `src/instrumentation.ts`

- [ ] **Monitoring**: Set up for production
  - Monitor uptime
  - Monitor database performance
  - Alert on error spikes

### 5. Testing

- [ ] **Build Test**: Verify production build succeeds
  - Run: `npm run build`
  - Should complete without errors (warnings OK)
  - Output: `.next/` directory ready for deployment

- [ ] **Manual Testing**: Test critical flows
  - Admin login
  - Product creation/editing
  - Image upload
  - Public product viewing
  - Blog reading

- [ ] **Security Testing**: Optional but recommended
  - Test CSRF protection (try request without token)
  - Test JWT expiration
  - Test permission checks (try accessing protected route without permission)

### 6. Deployment Configuration

- [ ] **Node Environment**: Set to production
  - `NODE_ENV=production`
  - Disables development-only code paths
  - Optimizes performance

- [ ] **Deployment Platform**: Choose and configure
  - **Vercel** (recommended - easiest Next.js deployment)
  - AWS (EC2, ECS, Lambda)
  - DigitalOcean
  - Railway
  - Other: Netlify, Heroku, Render

- [ ] **Environment Variables**: Set in CI/CD platform
  - All secrets stored in platform's environment variables
  - Never commit .env files
  - Use different values for staging vs production

- [ ] **Database Connection Pool**: Configure for production
  - Mongoose connection pooling (default is good)
  - Consider `MONGODB_POOL_SIZE=10` for high-traffic

- [ ] **Auto-Restart**: Enable
  - Process manager (PM2, systemd) or platform handles this
  - App restarts if process crashes

### 7. Documentation

- [x] **.env.example**: Created and documented
  - Guides developers on required variables
  - Includes examples and descriptions

- [x] **Middleware**: CSRF/Auth protection documented in code
  - Comments explain security mechanisms
  - Next.js version note: middleware convention deprecated, use "proxy" instead

- [ ] **API Documentation**: Optional but recommended
  - Document public API endpoints
  - Include request/response examples
  - Publish to internal wiki or Swagger/OpenAPI

---

## 🚀 Deployment Steps

### For Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy: Vercel auto-deploys on push to main branch
4. Test: Visit production URL and verify functionality

### For Manual Deployment

1. Build the app: `npm run build`
2. Upload `.next` directory and `node_modules` to server
3. Set environment variables on server
4. Start app: `npm start` or use PM2/systemd
5. Configure reverse proxy (nginx/Apache) to forward requests to Node app
6. Set up SSL certificate
7. Configure monitoring and auto-restart

---

## 📋 Post-Deployment

- [ ] **Verify all endpoints respond**
  - Test homepage
  - Test admin login
  - Test API routes (products, blogs, etc.)

- [ ] **Check logs** for errors
  - No critical errors in production logs
  - Expected warnings only

- [ ] **Monitor performance**
  - Page load time < 3 seconds
  - API response time < 500ms
  - Monitor error rate

- [ ] **Set up monitoring alerts**
  - Alert on 5xx errors
  - Alert on high latency
  - Alert on database connection failures

- [ ] **Regular backups** of database
  - MongoDB Atlas auto-backups (recommended)
  - Test recovery process

---

## 🔄 Continuous Deployment

### GitHub Actions (Example)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          CLOUDINARY_CLOUD_NAME: ${{ secrets.CLOUDINARY_CLOUD_NAME }}
          CLOUDINARY_API_KEY: ${{ secrets.CLOUDINARY_API_KEY }}
      
      - name: Deploy to Vercel
        run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## 🛠 Troubleshooting

### Build Fails
- Check env variables are set correctly
- Verify MongoDB connection works
- Check for TypeScript errors: `npm run build`

### App Won't Start
- Check logs: `npm start` (should show errors)
- Verify environment variables
- Check database connection
- Check port (default 3000)

### Slow Performance
- Check database query performance
- Look for N+1 queries in API routes
- Enable caching where possible
- Use CDN for static assets

### Errors in Production Logs
- Check error handler is capturing all errors
- Add error tracking service (Sentry)
- Monitor specific endpoints that fail

---

## 📚 References

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [OWASP Security Best Practices](https://owasp.org/www-project-web-security-testing-guide/)
- [JWT Authentication](https://jwt.io/)
- [CSRF Protection](https://owasp.org/www-community/attacks/csrf)

---

## ✨ Summary of Changes Made

### Security Improvements
- ✅ Removed hardcoded credentials from .env
- ✅ Added .env files to .gitignore
- ✅ Created .env.example with proper documentation
- ✅ Enhanced environment validation with production checks
- ✅ Enabled CSRF protection (removed SKIP_CSRF bypass)
- ✅ Added security headers in next.config.ts

### Performance Improvements
- ✅ Configured image caching
- ✅ Added static asset caching headers
- ✅ Enabled compression
- ✅ Fixed duplicate Mongoose indexes
- ✅ Optimized build configuration

### Production Readiness
- ✅ Verified build succeeds
- ✅ Enhanced error handling
- ✅ Improved logging
- ✅ Created deployment documentation

### Next Steps
1. Update admin credentials using seed script
2. Set up external error tracking (Sentry recommended)
3. Configure deployment platform (Vercel recommended)
4. Run production build locally to verify
5. Deploy and monitor in production
