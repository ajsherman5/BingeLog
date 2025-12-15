# Binge Log — Full App Build Plan (Claude-Ready)

## Project Overview
**App Name:** Binge Log  
**Goal:** Help users reduce binge eating by revealing emotional and situational patterns — not calories, weight, or restriction.  
**Philosophy:** Pattern > punishment. Awareness > discipline. Shame-free, private, low friction.

---

## Tech Stack (Strict)
- React Native + Expo (managed)
- TypeScript
- Expo Router
- Zustand or React Context
- Firebase (Anonymous Auth, Firestore)
- Light/Dark mode support

---

## MVP Features (Build First)
- One-tap binge logging
- Optional quick tags (emotion, time, location)
- Soft streak tracking
- Pattern Insights dashboard
- Shareable insight cards

**Do NOT build:** calorie tracking, weight tracking, food databases, social feeds.

---

## User Flow

### Onboarding
1. Welcome: “This app tracks patterns, not perfection.”
2. Privacy-first message
3. Select emotions + locations
4. Anonymous account auto-created

### Home Screen
- Primary button: **I binged**
- Secondary button: **I feel an urge**
- Current streak + longest streak

### Quick Log Flow
- Auto timestamp
- Select emotions (1–3)
- Select location
- Optional 140-char note
- Submit → Home

### Urge Mode
- 90-second timer
- Gentle message: “Urges peak and fall.”
- Show common trigger insight
- Options: Log binge / Urge passed

---

## Streak Logic
- Track current + longest streak
- Language: “New streak started”
- No punishment states or red UI

---

## Pattern Insights (Unlock after ~7 logs)
- Most common emotion
- Most common time window
- Most common location
- Highest-risk day
- Weekly trend

---

## Shareable Insight Cards
- Anonymous by default
- Examples:
  - “I binge when I’m stressed, not hungry.”
  - “7 days binge-free.”
- Small app watermark only

---

## Data Models

### BingeLog
- id
- timestamp
- emotions[]
- location
- note?

### UserStats
- currentStreak
- longestStreak
- lastBingeDate

---

## Monetization (Later)
Free core. Premium adds advanced insights, heatmaps, exports. Do not implement yet.

---

## Copy Rules
Never use: failure, cheat, bad food  
Always use: pattern, awareness, insight, progress

---

## Build Order
1. App scaffold
2. Home screen
3. Quick log modal
4. Urge mode
5. Insights dashboard
6. Share cards
7. Settings

---

## Claude Instructions
- Build incrementally
- Do not over-engineer
- Ask before adding features
- Prioritize UX clarity

Start by scaffolding the Expo app and Home screen.
