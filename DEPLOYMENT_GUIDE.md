# 🚀 Deployment & Operations Guide

---

## Current Deployment Status

### ✅ Phase 1: MVP (Complete)
- **Platform**: Netlify (GitHub-connected)
- **Build Command**: `npm run build`
- **Server**: Node.js runtime
- **Database**: MongoDB Atlas (Cloud)
- **Auth**: JWT + bcryptjs
- **Front-end URL**: production.app (pending)
- **Status**: Build passes, secrets fixed, ready to deploy

### 🟡 Phase 2: Phase 1 Features (In Planning)
- Safety mesh with GPS
- College email OAuth
- Notification service
- Real-time check-ins

---

## Local Development Setup

### Prerequisites
```bash
# Node.js 18+
node --version
npm --version

# Git
git --version
```

### Installation
```bash
# 1. Clone repository
git clone https://github.com/your-username/student-app.git
cd student-app

# 2. Install dependencies
npm install

# 3. Create .env.local
touch .env.local
# Add: MONGODB_URI, JWT_SECRET, NEXT_PUBLIC_API_URL

# 4. Verify installation worked
npm run build

# 5. Run development server
npm run dev

# Server runs at http://localhost:3000
```

### Development Workflow
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run type checking (optional)
npm run type-check

# Check for TypeScript errors in real-time
# (VSCode Pylance will also show errors)

# When ready for production
npm run build
npm start
```

---

## Netlify Deployment

### First-Time Setup

1. **Connect GitHub Repository**
   - Go to app.netlify.com
   - Click "New site from Git"
   - Connect GitHub account
   - Select repository: `student-app`
   - Click "Deploy site"

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables**
   - Go to Site Settings → Environment
   - Add these variables:
     ```
     MONGODB_URI = mongodb+srv://...
     JWT_SECRET = your-secret-key-64-chars
     NEXT_PUBLIC_API_URL = https://your-app.netlify.app
     ```

4. **Deploy**
   - Netlify automatically builds on git push
   - Monitor: Deployments tab
   - Live site: production-app.netlify.app

### Deployment Checklist
```
Before Each Deploy:
- [ ] All tests passing locally
- [ ] No TypeScript errors
- [ ] npm run build succeeds
- [ ] Environment variables updated
- [ ] Secrets NOT in code/docs
- [ ] .env.local exists (git-ignored)
- [ ] git commit with clear message
- [ ] git push to main branch

Netlify will:
- [ ] Trigger automatic build
- [ ] Run npm install
- [ ] Run npm run build
- [ ] Deploy to .netlify.app
- [ ] Show live URL
```

### Environment Variables

#### Development (.env.local)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-db
JWT_SECRET=your-256-bit-secret-key-here-minimum-32-chars
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

#### Production (Netlify Site Settings)
```env
MONGODB_URI=mongodb+srv://prod-user:prod-pass@prod-cluster.mongodb.net/prod-db
JWT_SECRET=production-secret-key-minimum-32-chars
NEXT_PUBLIC_API_URL=https://your-app.netlify.app
NODE_ENV=production
```

**Important**: Never commit `MONGODB_URI` or `JWT_SECRET` to git!

---

## Database Management

### MongoDB Atlas Console

#### Real-Time Monitoring
1. Go to: https://account.mongodb.com
2. Project → Cluster → Metrics
3. View:
   - Connections count
   - Operations/sec
   - Network I/O
   - Memory usage

#### Backup & Recovery
1. **Automated Daily Backups** (enabled by default)
   - Go to Backup section
   - View snapshots
   - Restore to specific point in time

2. **Manual Backup**
   ```bash
   # Export users collection
   mongoexport --uri "mongodb+srv://..." \
     --collection users \
     --out users_backup.json

   # Import backup
   mongoimport --uri "mongodb+srv://..." \
     --collection users \
     --file users_backup.json
   ```

#### Database Maintenance
```bash
# Connect to MongoDB Atlas (via MongoDB Compass or CLI)
mongosh "mongodb+srv://username:password@cluster.mongodb.net/student-db"

# View all collections
db.getCollectionNames()

# Count documents
db.users.countDocuments()

# Check indexes
db.users.getIndexes()

# Create optimization indexes (after Phase 1)
db.users.createIndex({ email: 1 })
db.users.createIndex({ college_id: 1 })
db.doubts.createIndex({ course_id: 1 })
db.expenses.createIndex({ user_id: 1, created_at: -1 })
```

### Monitoring & Alerts

#### Setup Alerts
1. Metrics → Alerts
2. Create alert for:
   - CPU > 80%
   - Memory > 90%
   - Connection pool exhausted

#### Log Aggregation
- Enable database logs
- Monitor for failed auth attempts
- Track slow queries (> 100ms)

---

## Performance Monitoring

### Netlify Analytics

#### Access Dashboard
1. Site Settings → Analytics
2. View:
   - Page views
   - Unique visitors
   - Top pages
   - Popular resources

#### Performance Metrics
```
Metrics to Track:
- Largest Contentful Paint (LCP): < 2.5s ✅
- First Input Delay (FID): < 100ms ✅
- Cumulative Layout Shift (CLS): < 0.1 ✅
- Build time: < 10 minutes
- Deploy frequency: 1-3 times/day
```

### Local Performance Testing

```bash
# Analyze bundle size
npm run build
npm install -g webpack-bundle-analyzer

# Check image optimization
# (Next.js handles automatically)

# Profile React components
# Use React Developer Tools → Profiler
```

---

## Logging & Error Tracking

### Application Logging Strategy

```javascript
// Production logging (add to your components)
console.log('[INFO]', 'User logged in:', userId);
console.error('[ERROR]', 'Failed to load page:', error);
console.warn('[WARN]', 'Slow API response:', duration);
```

### Setup Error Monitoring (Sentry)

```bash
# Install Sentry
npm install @sentry/nextjs

# Create account at sentry.io
# Add to next.config.js
```

### View Logs

#### Netlify Logs
```bash
# Deploy logs
netlify logs:deploy

# Function logs
netlify logs:function <function-name>
```

#### Database Logs
- MongoDB Atlas → Logs
- Filter by:
  - Operation type (find, insert, update)
  - Timestamp
  - Status (success/failure)

---

## Security Operations

### Regular Security Tasks

#### Weekly
- [ ] Review failed login attempts (database logs)
- [ ] Check for new CVEs in npm packages: `npm audit`
- [ ] Scan for secrets: `npm install -g truffleHog && truffleHog filesystem .`

#### Monthly
- [ ] Rotate JWT secret (if needed)
- [ ] Update all dependencies: `npm update`
- [ ] Review user accounts (suspicious activity)
- [ ] Backup critical data manually

#### Quarterly
- [ ] Perform security audit
- [ ] Penetration testing
- [ ] Update security policy
- [ ] Review access logs

### Code Scanning

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if available)
npm audit fix

# Review fixed packages
git diff package-lock.json

# Update specific package
npm install package-name@latest
```

### Dependency Management

```bash
# Check outdated packages
npm outdated

# Update minor versions (safe)
npm update

# Update to latest major version
npm install express@latest
npm install next@latest

# Remove unused dependencies
npm prune
```

---

## Scaling Strategy

### Phase 1 (Users: 1-1K)
- ✅ Single Netlify instance
- ✅ MongoDB Atlas free tier / M10 cluster
- No caching needed

### Phase 2 (Users: 1K-10K)
- Add Netlify edge caching
- MongoDB Atlas M20+ cluster
- Implement Redis caching for:
  - User sessions
  - Popular courses
  - Trending doubts

### Phase 3 (Users: 10K-50K)
- Multiple database read replicas
- Socket.io server clustering
- Static asset caching (CloudFlare)
- Database query optimization

### Phase 4 (Users: 50K+)
- Database sharding (by college_id)
- Microservices architecture
- Dedicated API servers
- Full CDN implementation

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Build Fails with TypeScript Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build

# If still failing:
npm install --save-dev typescript@latest
npm run build
```

#### 2. Deployment Stuck "Building"
```
Solution:
1. Cancel deployment in Netlify UI
2. Check npm install: `npm install`
3. Check build: `npm run build` (locally first)
4. Push again: `git push origin main`
```

#### 3. Database Connection Fails
```
Check:
1. MONGODB_URI in .env.local (local) or Netlify (production)
2. Network access (MongoDB Atlas → Network Access)
3. IP whitelist includes Netlify IPs
4. Connection string is correct
5. Database user has proper permissions
```

#### 4. 404 Errors After Deploy
```
Solution:
1. Check routes exist in /app folder
2. Verify build output: .next/manifest.json
3. Check dynamic routes have proper [bracket] names
4. Clear browser cache
```

#### 5. Environment Variables Not Loading
```
Netlify:
1. Go to Site Settings → Environment
2. Add variables
3. Trigger new deploy (can't just refresh)
4. Check with: echo $MONGODB_URI in build logs

Local:
1. Rename .env.example to .env.local
2. Add values
3. Restart npm run dev
```

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* npm run dev

# Check Netlify build logs
netlify logs:deploy --site=your-site-name

# View server-side logs
# Check Netlify Functions tab
```

---

## Rollback Plan

### If Deployment Goes Wrong

```bash
# 1. Immediate: Revert to previous version
git revert HEAD
git push origin main
# Netlify auto-redeploys from previous commit

# 2. Restore from backup
# Go to Netlify → Deploys → Previous successful deploy
# Click "Restore"

# 3. Database rollback (if needed)
# MongoDB Atlas → Backup → Restore
# Select point-in-time from past 7 days

# 4. Emergency: Switch to backup domain
# Point to Netlify backup environment
```

---

## Release Checklist

### Before Merging to Main

- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] No TypeScript errors
- [ ] Code review approved
- [ ] No secrets in code
- [ ] .env variables documented
- [ ] Changelog updated
- [ ] Database migration script ready (if needed)

### Deployment Checklist

```bash
# 1. Verify locally
npm run build
npm start

# 2. Create release branch
git checkout -b release/v1.1.0
git push origin release/v1.1.0

# 3. Monitor deployment
# Go to app.netlify.com → Deployments tab

# 4. Verify production
# Visit https://your-app.netlify.app
# Test all critical flows

# 5. Merge to main if successful
git checkout main
git merge release/v1.1.0
git push origin main

# 6. Create GitHub release
# Go to Releases → Draft new release
# Tag: v1.1.0
# Title: "Release v1.1.0 - [Feature]"
# Notes: Bullet points of changes
```

---

## Operations Schedule

### Daily
- [ ] Check Netlify deployment status
- [ ] Monitor error logs
- [ ] Verify database connectivity

### Weekly
- [ ] Run `npm audit`
- [ ] Review analytics
- [ ] Check security alerts

### Monthly
- [ ] Update dependencies
- [ ] Manual database backup
- [ ] Review performance metrics
- [ ] Update documentation

### Quarterly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Infrastructure review

---

**Last Updated**: March 23, 2026  
**Contact**: team@college-app.com  
**Emergency Hotline**: Netlify support + MongoDB support  
**Backup Contact**: On-call engineer (rotation)
