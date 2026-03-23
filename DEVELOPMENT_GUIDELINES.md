# 📋 Development Guidelines & Best Practices

---

## Code Style & Standards

### TypeScript & Component Guidelines

#### File Naming
```
Components:  src/components/ComponentName.tsx
Pages:       src/app/route/page.tsx
API Routes:  src/app/api/route.ts
Utilities:   src/lib/utilities.ts
Types:       src/types/index.ts
```

#### Component Structure
```typescript
'use client'; // Add if using Framer Motion or client-side state

import { motion } from 'framer-motion';
import { LucideIcon, Users, Target } from 'lucide-react';
import React, { useState } from 'react';

interface ComponentProps {
  title: string;
  color?: 'blue' | 'purple' | 'green';
  onClick?: () => void;
}

export default function ComponentName({ title, color = 'blue', onClick }: ComponentProps) {
  const [isOpen, setIsOpen] = useState(false);

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-4 rounded-lg ${colorClasses[color]}`}
    >
      {title}
    </motion.div>
  );
}
```

### Styling Standards

#### Tailwind Usage
```typescript
// ✅ Good: Consistent spacing, semantic colors
<div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
  Content
</div>

// ❌ Avoid: Hardcoded colors, inconsistent spacing
<div style="padding: 16px; background: #5555FF; border-radius: 8px;">
  Content
</div>

// ✅ Good: Using Tailwind colors + dark mode
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
  Content
</div>
```

#### Color Palette
```
Primary:     blue-500 / blue-600 (Main actions)
Secondary:   purple-500 / purple-600 (Navigation, highlights)
Success:     green-500 (Positive feedback)
Warning:     amber-500 (Caution, pending)
Error:       red-500 (Errors, negative)
Neutral:     slate-500 (Borders, secondary text)
```

#### Responsive Design
```typescript
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 1 col on mobile, 2 on tablet, 4 on desktop */}
</div>

// Responsive text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Title</h1>
```

### Animation Standards

#### Framer Motion Patterns
```typescript
// ✅ Standard page entrance animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Page content
</motion.div>

// ✅ Staggered children animations
<motion.div>
  {items.map((item, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.1, duration: 0.3 }}
    >
      {item.name}
    </motion.div>
  ))}
</motion.div>

// ✅ Hover interactions
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
>
  Click me
</motion.button>

// ✅ Loading skeleton
<motion.div
  animate={{ opacity: [0.5, 1, 0.5] }}
  transition={{ repeat: Infinity, duration: 2 }}
  className="h-8 bg-slate-300 rounded"
/>
```

### Component Documentation

```typescript
/**
 * StatusCard Component
 *
 * Displays a title, value, and trend indicator.
 * Used in dashboard for quick stat display.
 *
 * @example
 * <StatusCard 
 *   title="Total Users" 
 *   value="1,234" 
 *   trend="+12%" 
 *   color="blue"
 * />
 */
export default function StatusCard({
  title,
  value,
  trend,
  color,
}: StatusCardProps) {
  // Component implementation
}
```

---

## Git Workflow

### Branching Strategy

```bash
# Main branches
main          # Production-ready code
develop       # Integration branch for features

# Feature branches
feature/auth-oauth          # Feature development
fix/database-migration      # Bug fixes
docs/api-documentation     # Documentation updates

# Branch naming rules
# ✅ feature/short-description
# ❌ feature_long_description
# ❌ Feature-Long-Description
```

### Commit Message Standards

```bash
# Format: <type>(<scope>): <subject>
# Types: feat, fix, docs, style, refactor, test, chore
# Length: <50 chars for subject, <72 for body

# ✅ Good commits
git commit -m "feat(auth): implement college email oauth login"
git commit -m "fix(dashboard): resolve chart rendering on mobile"
git commit -m "docs: add phase 2 implementation checklist"

# ❌ Avoid
git commit -m "update stuff"
git commit -m "WIP: implementing new features"
git commit -m "asdfgh"

# With detailed message
git commit -m "feat(safety): add check-in notification system

- Add real-time check-in confirmations via Twilio
- Implement escalation logic for missed check-ins
- Add emergency contact notification

Closes #123"
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature
   ```

2. **Make Changes & Commit**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   git push origin feature/your-feature
   ```

3. **Create Pull Request**
   - Title: Clear description of changes
   - Description: Why, what, how
   - Screenshots: If UI changes
   - Checklist: Tests, docs, no secrets

4. **Code Review**
   - Request 1-2 reviewers
   - Address feedback
   - Re-request review

5. **Merge**
   ```bash
   # Squash commits for clean history
   git merge --squash origin/feature/your-feature
   ```

---

## Testing Strategy

### Unit Tests (In Development)
```typescript
// Example: Authentication utility test
// File: src/lib/__tests__/auth.test.ts

import { validateEmail, hashPassword } from '../auth';

describe('Authentication Utilities', () => {
  describe('validateEmail', () => {
    it('should accept valid college emails', () => {
      const result = validateEmail('student@college.edu');
      expect(result).toBe(true);
    });

    it('should reject non-college emails', () => {
      const result = validateEmail('user@gmail.com');
      expect(result).toBe(false);
    });
  });

  describe('hashPassword', () => {
    it('should hash password with bcryptjs', async () => {
      const hashed = await hashPassword('password123');
      expect(hashed).not.toBe('password123');
      expect(hashed.length).toBeGreaterThan(20);
    });
  });
});
```

### Integration Tests (Phase 2)
```bash
# Test full auth flow
npm test -- auth.integration.test.ts

# Test database operations
npm test -- database.integration.test.ts

# Test API endpoints
npm test -- api.integration.test.ts
```

### Manual Testing Checklist

#### Auth Pages
- [ ] Signup with valid email
- [ ] Signup with duplicate email (error)
- [ ] Password strength indicator
- [ ] Show/hide password toggle
- [ ] Login with correct credentials
- [ ] Login with wrong password (error)
- [ ] Remember me checkbox
- [ ] Forgot password link

#### Dashboard
- [ ] All cards render
- [ ] Charts display correctly
- [ ] Animations smooth
- [ ] Responsive on mobile
- [ ] Dark mode toggle works
- [ ] Navigation between pages

#### New Features (Template)
- [ ] Primary flow works
- [ ] Error handling displays
- [ ] Mobile-responsive
- [ ] Animations smooth
- [ ] No console errors
- [ ] Performance acceptable

---

## Performance Optimization

### Image Optimization
```typescript
// ❌ Don't: Regular img tag
<img src="/user.jpg" alt="User" />

// ✅ Do: Next.js Image component
import Image from 'next/image';

<Image
  src="/user.jpg"
  alt="User"
  width={200}
  height={200}
  priority // For above-the-fold images
  quality={80} // Compression level
/>
```

### Code Splitting
```typescript
// ✅ Lazy load heavy components
import dynamic from 'next/dynamic';

const ChartComponent = dynamic(() => import('@/components/Charts'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // Don't render on server
});

export default function Page() {
  return <ChartComponent />;
}
```

### Bundle Analysis
```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Check what's included:
# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

# Run analysis
ANALYZE=true npm run build
```

### Database Optimization
```javascript
// Load only needed fields
db.users.find({ college_id: '123' }, { 
  name: 1, 
  email: 1 
  // Exclude large fields like profile_image
});

// Add indexes for frequent queries
db.users.createIndex({ college_id: 1 });
db.expenses.createIndex({ user_id: 1, date: -1 });
```

---

## Security Best Practices

### API Security
```typescript
// ✅ Validate input
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const data = loginSchema.parse(req.body); // Throws if invalid

// ✅ Authenticate requests
const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch {
    throw new Error('Invalid token');
  }
};

// ✅ Rate limit endpoints
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
});

// ❌ Never hardcode secrets
const API_KEY = 'sk_live_1234567890'; // Don't do this!

// ✅ Use environment variables
const API_KEY = process.env.STRIPE_API_KEY!;
```

### Data Security
```typescript
// ✅ Hash passwords
import bcryptjs from 'bcryptjs';

const hashedPassword = await bcryptjs.hash(password, 10);

// ✅ Validate email domain (for college emails)
const isCollegeEmail = (email: string, collegeDomain: string) => {
  return email.endsWith(`@${collegeDomain}`);
};

// ✅ Encrypt sensitive data in database (for Phase 2)
// E.g., emergency contact phone numbers

// ❌ Store plain text passwords
db.users.insertOne({ email: 'user@college.edu', password: 'mypassword' });
```

### Secrets Management
```bash
# ✅ Good: Use .env.local (git-ignored)
# File: .env.local (NOT committed)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# ✅ Good: Use .env.example for reference
# File: .env.example (IN git for team reference)
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/database-name

# ❌ Bad: Hardcode in code
const uri = 'mongodb+srv://user:pass@cluster.mongodb.net/db';

# ❌ Bad: Commit .env.local
# (It's already in .gitignore, so don't undo that!)

# Check git history for accidentally committed secrets
git log --all --full-history -- ".env"
git log --all --full-history -p -- ".env" | grep -i "mongodb\|jwt\|password"
```

---

## Documentation Standards

### Code Comments
```typescript
// ❌ Obvious comments (don't help)
const count = 0; // Set count to 0

// ✅ Explain why, not what
// Use 'milliseconds' not 'seconds' for rate limiting (MongoDB doc requirement)
const retryDelayMs = 5000;

// ✅ Complex logic explanations
// Escalation: if no response in 5 min, notify emergency contact
if (Date.now() - lastCheckIn > 5 * 60 * 1000) {
  notifyEmergencyContact();
}

// ✅ TODO for future improvements
// TODO: Add Socket.io real-time updates (Phase 2)
```

### README Updates
```markdown
## Steps to Add a New Feature

1. Create route: `src/app/feature/page.tsx`
2. Add component: `src/components/Feature.tsx`
3. Import in page: `import Feature from '@/components/Feature'`
4. Test: `npm run dev` → http://localhost:3000/feature
5. Add to navigation: `src/components/SidebarNavigation.tsx`
6. Commit: `git commit -m "feat(feature): add feature name"`
```

---

## Release Process

### Version Numbering (Semantic Versioning)

```
v1.0.0 = Major.Minor.Patch

Major (1.x.x): Breaking changes or major features
Minor (x.1.x): New features (backward compatible)
Patch (x.x.1): Bug fixes

v1.0.0 → v1.1.0 (Phase 1 MVP complete)
v1.1.0 → v2.0.0 (Phase 2 major features)
v2.0.0 → v2.0.1 (Bug fix)
```

### Release Checklist

```bash
# 1. Create release branch
git checkout -b release/v1.1.0
git push origin release/v1.1.0

# 2. Update version numbers
# → package.json: "version": "1.1.0"
# → CHANGELOG.md: Add v1.1.0 section

# 3. Commit
git commit -m "chore(release): v1.1.0"

# 4. Test thoroughly
npm run build
npm start

# 5. Merge to main
git checkout main
git merge --no-ff release/v1.1.0
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main --tags

# 6. Create GitHub Release
# → Releases → "Draft a new release"
# → Tag: v1.1.0
# → Release notes from CHANGELOG.md

# 7. Merge back to develop
git checkout develop
git merge --no-ff main
git push origin develop
```

---

## Team Communication

### Daily Standup Template
```
What I did:
- Implemented OAuth flow
- Deployed to staging

What I'm doing:
- Adding unit tests
- Code review for PR #45

Blockers:
- Waiting for MongoDB Atlas credentials
```

### Issue Tracking

All features should have issues:

```markdown
## Feature: College Email OAuth Login

### Description
Allow students to login using their college email account with OAuth.

### Acceptance Criteria
- [ ] OAuth flow implemented
- [ ] Email domain validation working
- [ ] User semester auto-detected from LDAP
- [ ] Tests passing
- [ ] 95% uptime on staging

### Effort Estimate
- 3 days
- @developer-name assigned

### Related
- Closes #123
- Related to Phase 1 Safety Features
- Depends on #122 (Netlify env. setup)
```

---

**Last Updated**: March 23, 2026  
**Created By**: Development Team  
**Used By**: All contributors  
**Review Cycle**: Monthly
