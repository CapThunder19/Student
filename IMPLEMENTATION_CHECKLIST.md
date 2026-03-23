# Implementation Checklist & Quick Reference

## 🎯 Quick Feature Summary

### Must-Have Features (🔴 CRITICAL)
- [ ] Safe commute mesh (routes + check-ins + escalation)
- [ ] Late alert system (10min late → WhatsApp to 3 contacts)
- [ ] College email login + semester detection
- [ ] Group project autopilot (roles, deadlines, shared files)
- [ ] Week-one onboarding flow
- [ ] Mental health support (peer listeners + counselor redirect)

### High Priority (🟡 HIGH)
- [ ] Doubt management pool (public + anonymous)
- [ ] Complaint system enhancements
- [ ] Live GPS tracking (optional toggle)
- [ ] Stress detection + breathing exercises

### Medium Priority (🟠 MEDIUM)
- [ ] AI doubt assistant (with college syllabus)
- [ ] Flashcards & short notes
- [ ] Events discovery + RSVP
- [ ] Lost & found board
- [ ] Budget management & expense tracking
- [ ] Project connect (find partners)
- [ ] Housing connect (PG/flat listings)

### Nice to Have (🟢 LOW)
- [ ] Savings goals & challenges
- [ ] Receipt OCR for expenses
- [ ] Roommate compatibility matching

---

## 📱 Pages to Create

### New Main Pages:
- [ ] `/academics` - Doubt pool, flashcards, short notes, AI assistant
- [ ] `/group-projects` - Project management dashboard
- [ ] `/safecommute` - Route planning, check-ins, emergency escalation
- [ ] `/wellbeing` - Mood tracking, peer listeners, counselor booking
- [ ] `/budget` - Expense tracker, budget planner, financial goals
- [ ] `/events` - Event discovery, RSVP, lost+found
- [ ] `/housing` - PG/flat listings, roommate finder

### Onboarding Pages:
- [ ] `/onboarding/week-one` - Multi-step setup flow
- [ ] `/onboarding/safety` - Emergency contact setup
- [ ] `/onboarding/academic` - College email linking
- [ ] `/onboarding/community` - Club/group discovery

### Existing to Enhance:
- [ ] `/profile` → Add verified badge, college department, year
- [ ] `/sos` → Add GPS, voice/photo upload, safe routes
- [ ] `/community` → Add events, projects, housing

---

## 🗄️ Database Models to Add

```
Column format: Model - fields

User Extensions:
├─ college_id (FK)
├─ department (string)
├─ semester (number)
├─ emergency_contacts (array of phone numbers)
├─ safe_routes (array of route IDs)
├─ is_peer_listener (boolean)
└─ wellbeing_data (object)

College
├─ id (primary)
├─ name (string)
├─ email_domain (string)
├─ location (geo)
├─ syllabus_data (JSONB)
└─ counselor_contacts (array)

SafeRoute
├─ id (primary)
├─ user_id (FK)
├─ from_location (geo)
├─ to_location (geo)
├─ check_in_interval (minutes)
├─ emergency_contacts (array)
└─ created_at

CheckInHistory
├─ id (primary)
├─ route_id (FK)
├─ user_id (FK)
├─ location (geo)
├─ timestamp
└─ status (confirmed/late/missing)

Doubt
├─ id (primary)
├─ user_id (FK)
├─ course_id (FK)
├─ title (string)
├─ description (text)
├─ is_anonymous (boolean)
├─ status (asked/answered/cleared)
├─ responses (array of response objects)
└─ created_at

GroupProject
├─ id (primary)
├─ creator_id (FK)
├─ title (string)
├─ description (text)
├─ semester (number)
├─ deadline (date)
├─ members (array with roles)
├─ files_folder (Drive integration)
├─ shared_doc (notion integration)
└─ accountability_nudges_enabled

MoodEntry
├─ id (primary)
├─ user_id (FK)
├─ mood_level (1-5)
├─ stress_level (1-5)
├─ stress_reason (string)
├─ breathing_completed (boolean)
└─ created_at

PeerListener
├─ id (primary)
├─ user_id (FK)
├─ training_completed (boolean)
├─ availability_status (online/offline)
├─ current_chats (number)
└─ rating (float)

Budget
├─ id (primary)
├─ user_id (FK)
├─ semester_id (FK)
├─ total_budget (decimal)
├─ categories (object with limits)
└─ month_year (date)

Expense
├─ id (primary)
├─ user_id (FK)
├─ amount (decimal)
├─ category (enum)
├─ description (string)
├─ receipt_url (optional)
└─ created_at

Event
├─ id (primary)
├─ college_id (FK)
├─ title (string)
├─ description (text)
├─ date_time (timestamp)
├─ location (geo)
├─ organizer_id (FK)
├─ rsvp_list (array of user IDs)
└─ created_at

LostFoundPost
├─ id (primary)
├─ user_id (FK)
├─ title (string)
├─ description (text)
├─ category (enum)
├─ photo_urls (array)
├─ type (lost/found)
├─ date_lost (date)
├─ location (geo)
├─ contact (phone)
└─ status (active/resolved)

ProjectConnect
├─ id (primary)
├─ user_id (FK)
├─ skills (array of strings)
├─ looking_for (string description)
├─ portfolio_url (optional)
├─ availability (semester number)
└─ verified_college_id (boolean)

HousingListing
├─ id (primary)
├─ owner_id (FK)
├─ title (string)
├─ type (pg/flat/room)
├─ location (geo)
├─ price (decimal)
├─ amenities (array)
├─ photos (array of URLs)
├─ verified_reviews (array)
└─ created_at
```

---

## 🔌 API Endpoints Needed

### Authentication
- `POST /api/auth/college-login` - Login with college email

### Academics
- `GET /api/academics/syllabus/:courseId`
- `POST /api/academics/doubts` - Create doubt
- `GET /api/academics/doubts` - Get doubt pool
- `POST /api/academics/doubts/:doubtId/answer` - Answer doubt
- `GET /api/academics/ai-assist` - AI doubt response

### Safety
- `POST /api/safety/route` - Create safe route
- `POST /api/safety/check-in` - Send check-in
- `POST /api/safety/late-alert` - Trigger late alert
- `GET /api/safety/routes` - Get user routes
- `DELETE /api/safety/route/:routeId`

### Projects
- `POST /api/projects` - Create group project
- `PATCH /api/projects/:projectId` - Update project
- `POST /api/projects/:projectId/members` - Add member
- `GET /api/projects/:projectId` - Get project details

### Wellbeing
- `POST /api/wellbeing/mood` - Log mood entry
- `POST /api/wellbeing/peer-listener/match` - Match with listener
- `GET /api/wellbeing/breathing-guides` - Get exercises
- `POST /api/wellbeing/counselor/book` - Book counselor

### Community
- `GET /api/events` - List events
- `POST /api/events/:eventId/rsvp` - RSVP to event
- `POST /api/lost-found` - Create lost/found post
- `GET /api/lost-found` - List lost/found items
- `GET /api/housing` - List housing
- `GET /api/projects-connect` - Find project partners

### Finance
- `POST /api/budget` - Set budget
- `POST /api/expense` - Log expense
- `GET /api/budget/summary` - Get budget overview
- `GET /api/expenses` - Get expense history

---

## 📊 Tech Stack Additions

### Frontend (Already have)
- React 19.2.4
- Next.js 16.2.1
- Framer Motion
- Tailwind CSS
- Lucide React

### Need to Add:
- **Maps**: Mapbox GL JS
- **Real-time**: Socket.io or Supabase Realtime
- **Charts**: Recharts (already installed)
- **Forms**: React Hook Form
- **Date Picker**: React Calendar / Day.js
- **Payment**: Razorpay SDK (if needed)

### Backend Extensions:
- **Geolocation**: Geohashing for check-ins
- **Notifications**: Twilio (WhatsApp), Firebase Cloud Messaging
- **File Storage**: AWS S3 / Google Cloud Storage
- **OCR**: AWS Textract or Tesseract.js
- **AI**: OpenAI API or Claude API
- **OAuth**: College LDAP integration
- **Caching**: Redis for check-in windows

---

## 📋 Testing Checklist

- [ ] Unit tests for safety algorithms
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical flows (login, SOS, check-in)
- [ ] Load testing for concurrent check-ins
- [ ] Security testing (SQL injection, XSS, auth bypass)
- [ ] Privacy testing (data deletion, encryption)
- [ ] GPS accuracy testing
- [ ] Late alert notification testing

---

## 🎬 Ready to Start?

**Next Step**: Pick Phase 1 features and let's begin implementation! 🚀

Which feature would you like to build first?
1. Safe commute mesh
2. College email login
3. Doubt management system
4. Week-one onboarding
