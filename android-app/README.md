# Student Android App

This folder contains a Kotlin + Jetpack Compose Android starter app for the Student website.

## Included features

- SOS screen
- Community feed screen
- Budget screen
- Profile screen
- Login flow
- Backend API layer for existing web routes

## Backend routes used

- `/api/auth/mobile/login`
- `/api/auth/mobile/signup`
- `/api/community/messages`
- `/api/budget`
- `/api/complaints`

## Notes

- The app now uses mobile login and signup endpoints and stores the JWT in DataStore.
- `StudentApiClient` uses `API_BASE_URL` from `gradle.properties`. It is set to your Mac's LAN IP for real-phone testing.
- If you want emulator testing later, change `API_BASE_URL` back to `http://10.0.2.2:3000/`.
- The app allows cleartext HTTP because the current backend is not HTTPS yet.
- Login/signup responses return a token, and all authenticated budget/profile calls send it as `Authorization: Bearer ...`.
