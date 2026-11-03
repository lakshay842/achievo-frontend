# Achievo AI

Your Goals. Your Plan. Your Progress.

Frontend-only Expo app for Achievo AI. The Node API, MongoDB, and Gemini key live in `achievo-backend`. This app never calls an AI provider directly and never stores passwords on the device.

## Stack

React Native, Expo SDK 58, TypeScript, Expo Router, NativeWind, Zustand, TanStack Query, Axios, React Hook Form, Zod, Expo Secure Store, Expo Notifications, Reanimated, Lucide.

## Setup

```bash
cd achievo-mobile
cp .env.example .env
# Set EXPO_PUBLIC_API_URL to your machine's LAN address, e.g. http://192.168.3.205:5000/api/v1
npm install
npm start
```

Keep the backend running:

```bash
cd ../achievo-backend
npm run dev
```

Do not put `GEMINI_API_KEY` in the mobile env. Put it only in `achievo-backend/.env`.

## What works

- Splash session check
- Onboarding: interests, daily time, motivation style, reminder time, notification explanation + OS permission
- Register, login, forgot/reset password
- Home dashboard with today tasks, streak, progress, coach note
- Goal create (natural language + form) → AI clarify → roadmap preview → approve
- Goal details, pause/resume/archive
- Task start/complete/skip/reschedule + AI explain
- AI Coach chat
- Progress overview / week / month / streaks
- Profile theme, account, notification preferences, device token registration
- Notification inbox

## Scripts

| Script | Purpose |
| --- | --- |
| `npm start` | Expo dev server |
| `npm run typecheck` | TypeScript |
| `npm run android` / `ios` / `web` | Platform targets |

## Security notes

- Access and refresh tokens use Expo Secure Store on native.
- Passwords are never written to storage.
- AI requests go to `/api/v1/ai/*` and `/api/v1/coach/*` only.
