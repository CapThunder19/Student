# Technical Architecture & Tech Stack Guide

---

## 🏗️ Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16.2.1)               │
│  React 19 + TypeScript + Tailwind + Framer Motion + Lucide  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           API Layer (Next.js Route Handlers)                │
│  /api/auth/signup  |  /api/auth/login                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Services (Node.js)                      │
│  JWT Auth | Password Hashing (bcryptjs)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Database (MongoDB Atlas)                        │
│  User, College, Complaint, etc.                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Frontend Tech Stack

### Core Framework
```json
{
  "react": "19.2.4",
  "next": "16.2.1 (App Router)",
  "typescript": "5.x"
}
```

### UI & Styling
```json
{
  "tailwindcss": "4.x (Utility-first CSS)",
  "framer-motion": "12.38.0 (Animations)",
  "lucide-react": "0.577.0 (Icons)",
  "@emotion/react": "Latest (CSS-in-JS)",
  "@emotion/styled": "Latest (CSS-in-JS)"
}

// Optional/installed but not used
{
  "antd": "6.3.3 (Enterprise UI Components)",
  "@chakra-ui/react": "3.34.0 (Accessible Components)"
}
```

### Data Visualization
```json
{
  "recharts": "2.x (Charts & Graphs)"
}
```

---

## 🔌 Backend & Database

### Current Stack
```json
{
  "mongodb": "Atlas Cloud",
  "mongoose": "(Ready but not configured yet)",
  "jsonwebtoken": "9.0.3 (JWT Auth)",
  "bcryptjs": "3.0.3 (Password Hashing)"
}
```

### Database (MongoDB)
```javascript
// Current Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

// Collections:
Users
├─ _id (ObjectId)
├─ name (string)
├─ email (string)
├─ password (hashed)
├─ token (JWT)
└─ createdAt (timestamp)
```

---

## 🚀 Future Architecture Extensions

### Phase 1: Safety & Academic
```
Frontend → Sidebar Navigation (Done ✅)
Routes:
├─ /safecommute (New: GPS tracking + check-ins)
├─ /academics (New: Doubts + Flashcards)
└─ /onboarding (New: Week-one setup)

Backend Additions:
├─ OAuth/LDAP Integration (College email login)
├─ Geolocation Service (Mapbox API)
├─ Notification Service (Twilio WhatsApp)
└─ Check-in Logic (Cron jobs scheduled)

Database Extensions:
├─ College {id, name, email_domain, location, syllabus_data}
├─ SafeRoute {id, user_id, from, to, check_in_interval}
├─ CheckInHistory {id, route_id, user_id, location, status}
└─ Doubt {id, user_id, course_id, title, is_anonymous, status}
```

### Phase 2: Wellbeing & Community
```
New Routes:
├─ /wellbeing (Mood tracking + peer listeners)
├─ /events (Event discovery + RSVP)
├─ /housing (PG/flat connect)
└─ /projects-connect (Find partners)

Backend:
├─ Real-time Chat (Socket.io for peer listeners)
├─ Matching Algorithm (compatible peer matching)
├─ Notification Queue (Redis)
└─ File Storage (AWS S3 / Google Drive API)

Database:
├─ MoodEntry {user_id, mood_level, stress_level, stress_reason}
├─ PeerListener {user_id, training_completed, availability}
├─ Event {college_id, title, datetime, location, rsvp_list}
└─ HousingListing {owner_id, type, price, amenities, verified_reviews}
```

### Phase 3: Finance & Analytics
```
New Routes:
├─ /budget (Budget management)
└─ /expenses (Expense tracking)

Backend:
├─ OCR Service (AWS Textract for receipts)
├─ Analytics Engine (Budget vs actual)
└─ Payment Processing (Razorpay webhook)

Database:
├─ Budget {user_id, semester_id, total_budget, categories}
├─ Expense {user_id, amount, category, description, receipt_url}
└─ SavingsGoal {user_id, target_amount, deadline, progress}
```

---

## 🔌 Integration Points Needed

### 1. Authentication & Identity
```
Current: JWT + Email/Password
Future: College Email OAuth/LDAP

Setup:
- College LDAP server endpoint
- OAuth 2.0 client credentials
- Auto-detect: department, semester, year
- Verify: college email domain

Provider Options:
- Google Workspace (if college uses Gmail)
- Microsoft Azure AD (if college uses Office 365)
- Custom LDAP server
```

### 2. Location & Maps
```
Service: Mapbox GL JS

Features Needed:
- Route planning (A to B)
- Polyline encoding
- Distance/duration calculation
- Safe zone mapping
- Offline map support

Setup:
npm install mapbox-gl @mapbox/mapbox-gl-draw
```

### 3. Notifications
```
Service: Twilio

Features:
- WhatsApp alerts (late notifications)
- SMS fallback (if app unavailable)
- Voice call (critical alerts)
- Email notifications

Setup:
npm install twilio
```

### 4. Real-Time Communication
```
Service: Socket.io (or Supabase Realtime)

Features:
- Peer listener chat
- Check-in confirmations
- Live notifications
- Group project updates

Setup:
npm install socket.io socket.io-client
```

### 5. AI & LLM
```
Service: OpenAI API or Claude API

Features:
- Answer doubts based on syllabus
- Generate flashcards
- Summarize notes
- Analyze mood & suggest coping strategies

Setup:
npm install openai
or
npm install @anthropic-ai/sdk
```

### 6. File Management
```
Services: Google Drive API or AWS S3

Features:
- Group project file sharing
- Receipt uploads
- Document storage
- Real-time collaboration

Setup:
npm install google-auth-library googleapis
or
npm install aws-sdk
```

### 7. OCR (Receipt Scanning)
```
Service: AWS Textract or Tesseract.js

Features:
- Extract text from receipts
- Auto-categorize expenses
- Amount parsing

Setup:
npm install aws-sdk
or
npm install tesseract.js
```

### 8. Payment (Optional)
```
Service: Razorpay or Stripe

Features:
- Fee collection (college verification fee)
- Scholarships distribution
- Emergency funds transfer

Setup:
npm install razorpay
or
npm install stripe
```

---

## 📊 Database Schema (Extended)

```sql
-- Core Users (Already have)
CREATE TABLE users {
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Timestamp
}

-- New: Colleges
CREATE TABLE colleges {
  _id: ObjectId,
  name: String,
  email_domain: String (e.g., "college.edu"),
  location: GeoJSON,
  established_year: Number,
  counselor_contacts: Array<Phone>,
  syllabus_data: JSONB
}

-- Extended: Users-Colleges Relationship
ALTER TABLE users ADD {
  college_id: ObjectId (FK),
  department: String,
  semester: Number,
  year: Number,
  roll_number: String,
  emergency_contacts: Array<{name, phone}>,
  safe_routes: Array<ObjectId>,
  is_peer_listener: Boolean,
  peer_listener_training_date: Timestamp,
  verified_badge: Boolean,
  profile_image_url: String
}

-- Safety: Routes
CREATE TABLE safe_routes {
  _id: ObjectId,
  user_id: ObjectId (FK),
  name: String,
  from_location: GeoJSON,
  to_location: GeoJSON,
  check_in_interval_minutes: Number,
  emergency_contact_ids: Array<ObjectId>,
  is_active: Boolean,
  created_at: Timestamp
}

-- Safety: Check-ins
CREATE TABLE check_in_history {
  _id: ObjectId,
  route_id: ObjectId (FK),
  user_id: ObjectId (FK),
  location: GeoJSON,
  timestamp: Timestamp,
  status: Enum(confirmed, late, missing),
  notes: String
}

-- Academic: Doubts
CREATE TABLE doubts {
  _id: ObjectId,
  user_id: ObjectId (FK),
  course_id: ObjectId (FK),
  title: String,
  description: String,
  is_anonymous: Boolean,
  status: Enum(asked, answered, cleared),
  tags: Array<String>,
  responses: Array<{
    respondent_id: ObjectId,
    content: String,
    upvotes: Number,
    created_at: Timestamp
  }>,
  created_at: Timestamp
}

-- Academic: Flashcards
CREATE TABLE flashcards {
  _id: ObjectId,
  user_id: ObjectId (FK),
  course_id: ObjectId (FK),
  front: String (question),
  back: String (answer),
  difficulty: Enum(easy, medium, hard),
  reviews: Array<{timestamp, correct: Boolean}>,
  created_at: Timestamp
}

-- Academic: Group Projects
CREATE TABLE group_projects {
  _id: ObjectId,
  creator_id: ObjectId (FK),
  college_id: ObjectId (FK),
  title: String,
  description: String,
  semester: Number,
  deadline: Date,
  members: Array<{
    user_id: ObjectId,
    role: Enum(leader, docs, code, presentation),
    contribution_score: Number
  }>,
  files_folder_id: String (Google Drive),
  shared_doc_url: String (Notion),
  accountability_nudges_enabled: Boolean,
  status: Enum(planning, in_progress, submitted),
  created_at: Timestamp
}

-- Wellbeing: Mood Entries
CREATE TABLE mood_entries {
  _id: ObjectId,
  user_id: ObjectId (FK),
  mood_level: Number (1-5),
  stress_level: Number (1-5),
  stress_reason: String,
  breathing_exercise_completed: Boolean,
  breathing_duration_seconds: Number,
  counselor_recommended: Boolean,
  peer_listener_matched: Boolean,
  notes: String,
  created_at: Timestamp
}

-- Wellbeing: Peer Listeners
CREATE TABLE peer_listeners {
  _id: ObjectId,
  user_id: ObjectId (FK),
  training_completed: Boolean,
  training_completion_date: Timestamp,
  availability_status: Enum(online, offline, on_break),
  active_chats_count: Number,
  total_sessions: Number,
  rating: Float (0-5),
  verified_by: ObjectId (admin),
  created_at: Timestamp
}

-- Community: Events
CREATE TABLE events {
  _id: ObjectId,
  college_id: ObjectId (FK),
  creator_id: ObjectId (FK),
  title: String,
  description: String,
  date_time: Timestamp,
  location: GeoJSON,
  category: Enum(tech, sports, cultural, academic),
  capacity: Number,
  rsvp_list: Array<ObjectId>,
  poster_image_url: String,
  created_at: Timestamp
}

-- Community: Lost & Found
CREATE TABLE lost_found_posts {
  _id: ObjectId,
  user_id: ObjectId (FK),
  college_id: ObjectId (FK),
  title: String,
  description: String,
  category: Enum(documents, keys, electronics, clothing, other),
  item_photos: Array<String> (URLs),
  type: Enum(lost, found),
  date_lost_or_found: Date,
  location: GeoJSON,
  contact_phone: String,
  contact_email: String,
  status: Enum(active, resolved, archived),
  created_at: Timestamp
}

-- Finance: Budget
CREATE TABLE budgets {
  _id: ObjectId,
  user_id: ObjectId (FK),
  semester_id: String,
  total_budget: Decimal,
  month_year: Date,
  categories: {
    food_dining: {limit: Decimal, alert_threshold: Number},
    study_materials: {limit: Decimal, alert_threshold: Number},
    transport: {limit: Decimal, alert_threshold: Number},
    entertainment: {limit: Decimal, alert_threshold: Number},
    emergency: {limit: Decimal, alert_threshold: Number},
    savings: {limit: Decimal, alert_threshold: Number}
  },
  created_at: Timestamp,
  updated_at: Timestamp
}

-- Finance: Expenses
CREATE TABLE expenses {
  _id: ObjectId,
  user_id: ObjectId (FK),
  amount: Decimal,
  category: String,
  description: String,
  receipt_image_url: String (optional),
  receipt_ocr_text: String (optional),
  tags: Array<String>,
  created_at: Timestamp
}
```

---

## 🔐 Security Checklist

### Before Phase 1 Launch
- [ ] Enable HTTPS everywhere
- [ ] Rate limiting on API endpoints
- [ ] CORS configuration
- [ ] CSRF tokens on forms
- [ ] Input validation & sanitization
- [ ] Password requirements (min 8 chars, complexity)
- [ ] JWT expiration (15 min access, 7d refresh)
- [ ] Secure cookie settings (HttpOnly, Secure, SameSite)
- [ ] Data encryption at rest (MongoDB)
- [ ] Data encryption in transit (TLS)
- [ ] GDPR compliance (data deletion, consent)
- [ ] Age verification (18+) for certain features
- [ ] Content audit (hate speech, spam filtering)

### Before Phase 2 Launch
- [ ] OAuth token security review
- [ ] Location data security (encryption, retention)
- [ ] Real-time chat message encryption
- [ ] File upload scanning (malware)
- [ ] Admin moderation tools
- [ ] User blocking/reporting system
- [ ] Audit logging for sensitive operations

---

## 🚀 Deployment Checklist

### Local Testing
- ✅ npm run dev
- ✅ npm run build
- ✅ npm start

### Staging (Before production)
- [ ] Deploy to staging.app
- [ ] Run full test suite
- [ ] Load testing (1000+ concurrent users)
- [ ] Security scanning
- [ ] Performance profiling

### Production (Netlify)
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] CDN configured
- [ ] Error monitoring (Sentry)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Log aggregation
- [ ] Uptime monitoring
- [ ] Disaster recovery plan

---

## 📈 Scaling Considerations

### Current Stack Limits
- **Users**: 10K before optimization needed
- **Requests**: 1M/month
- **Database**: 5GB

### When to Scale
- **100K+ users**: Add read replicas for MongoDB
- **High real-time load**: Add multiple Socket.io servers
- **Large files**: Implement CDN (CloudFlare)
- **Peak traffic**: Auto-scaling with Netlify/Vercel

### Optimization Strategies
- Image optimization (Next.js Image)
- Code splitting & lazy loading
- Database indexing
- Redis caching for popular queries
- Static site generation (SSG)
- Incremental Static Regeneration (ISR)

---

**Last Updated**: March 23, 2026  
**Maintained By**: Development Team  
**Next Review**: When Phase 2 begins
