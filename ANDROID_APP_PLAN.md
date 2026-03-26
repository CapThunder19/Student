# Android App Plan for Student Website

Target: Kotlin Android app for the existing Student web backend, focused on:

- SOS
- Community
- Budget and notifications

## Recommended Stack

- Kotlin
- Jetpack Compose
- MVVM architecture
- Retrofit or Ktor Client for REST APIs
- Kotlin Coroutines + StateFlow
- Hilt for dependency injection
- WorkManager for background sync and reminders
- Firebase Cloud Messaging for push notifications

## Core Screens

1. Splash / session check
2. Login / Signup
3. Home dashboard
4. SOS screen
5. Community feed
6. Budget screen
7. Notifications screen
8. Profile / settings

## Feature Mapping

### 1) SOS

Current website status:

- `src/app/sos/page.tsx` redirects to complaints
- Actual emergency flow is not implemented as a mobile SOS backend

Proposed Android behavior:

- One-tap SOS button
- Option to call emergency contact
- Option to create urgent complaint / alert
- Optional current location capture if permission is granted
- Local confirmation dialog before sending emergency action

Backend reuse:

- `POST /api/complaints`
- `GET /api/complaints`

### 2) Community

Current backend:

- `GET /api/community/messages`
- `POST /api/community/messages`
- `PATCH /api/community/messages` for like / unlike
- Socket.IO support exists for realtime sync

Android behavior:

- Community feed with posts
- Like / unlike
- Reply support
- Optional realtime updates using Socket.IO

### 3) Budget

Current backend:

- `GET /api/budget`
- `GET /api/budget/target`
- `POST /api/budget/target`
- `GET /api/budget/transaction`
- `POST /api/budget/transaction`
- `GET /api/budget/shared`
- `POST /api/budget/shared`

Android behavior:

- Monthly budget target
- Transaction list
- Shared expense tracking
- Budget progress visualization
- Add / edit / delete transaction actions if backend supports them later

### 4) Notifications

Current backend:

- Complaint notifications are already tracked
- No generic app-wide notification model exists yet

Android behavior:

- Budget reminder notifications
- Complaint status updates
- SOS / urgent alert confirmation notifications
- Push notifications via FCM

## Suggested Package Structure

```text
app/src/main/java/com/student/app/
  data/
    remote/
    repository/
    dto/
  domain/
    model/
    usecase/
  ui/
    navigation/
    screens/
    theme/
  di/
  services/
  MainActivity.kt
```

## ViewModels

- AuthViewModel
- HomeViewModel
- SosViewModel
- CommunityViewModel
- BudgetViewModel
- NotificationsViewModel

## API Notes

- The web app currently relies on a cookie-based JWT in several routes.
- Native Android auth should ideally use bearer tokens returned at login.
- If the backend is kept unchanged, the Android app should use a token exchange flow or a mobile-friendly auth endpoint.
- Community and complaint APIs already return JSON that can be mapped directly into Kotlin DTOs.

## Data Models Needed

- User
- CommunityPost / Message
- Reply
- Budget
- Transaction
- SharedExpense
- Complaint / SOS alert
- NotificationItem

## Implementation Order

1. Create Android project with Compose
2. Add auth flow
3. Build dashboard and bottom navigation
4. Implement Community module
5. Implement Budget module
6. Implement SOS flow
7. Add notifications and background sync
8. Wire FCM and realtime updates

## Important Gap To Solve

The biggest backend gap for a Kotlin app is mobile auth and notification delivery.

Recommended backend additions:

- Mobile login endpoint returning bearer token
- Device token registration for FCM
- SOS-specific endpoint for urgent alerts
- Generic notification collection for app inbox

## Next Step

If you want, I can now scaffold the Android project structure in Kotlin with Compose and create the first working screens for:

- Login
- Home dashboard
- SOS
- Community
- Budget
