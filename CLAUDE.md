# BingeLog - Project Context

## Overview
BingeLog is a React Native/Expo app designed to help users track and understand their binge eating patterns. The app focuses on awareness, pattern recognition, and compassionate self-tracking rather than restriction or shame.

## Tech Stack
- **Framework:** React Native with Expo (managed workflow)
- **Routing:** Expo Router (file-based routing)
- **Language:** TypeScript
- **State Management:** React Context (AppContext, ThemeContext)
- **Storage:** AsyncStorage for local persistence
- **Icons:** @expo/vector-icons (Feather icons)
- **Notifications:** expo-notifications

## Project Structure
```
app/                    # Expo Router pages
├── (tabs)/            # Tab navigation
│   ├── _layout.tsx    # Tab bar configuration
│   ├── index.tsx      # Home screen
│   ├── progress.tsx   # Insights tab (renamed from Progress)
│   └── settings.tsx   # Settings screen
├── _layout.tsx        # Root layout with providers
├── checkin.tsx        # Daily urge check-in
├── journey/[id].tsx   # Individual journey view
├── journeys.tsx       # Self-care journeys list
├── log.tsx            # Binge logging form
├── onboarding.tsx     # First-time user onboarding
└── urge.tsx           # Urge surfing timer with reflection

src/
├── components/        # Reusable UI components
├── constants/
│   ├── data.ts       # App data (emotions, locations, triggers, journeys, milestones)
│   └── theme.ts      # Design tokens (colors, spacing, typography)
├── context/
│   ├── AppContext.tsx    # Global app state (logs, urges, stats, check-ins)
│   └── ThemeContext.tsx  # Theme state (dark/light mode)
├── services/
│   └── ai.ts         # AI service stubs (for future implementation)
├── types/
│   └── index.ts      # TypeScript interfaces
└── utils/
    └── notifications.ts  # Notification scheduling
```

## Key Features

### 1. Home Screen (`app/(tabs)/index.tsx`)
- Displays current streak and stats
- Quick action buttons: Log Binge, Surf Urge, Check In
- Week strip showing recent activity
- Milestone celebrations

### 2. Binge Logging (`app/log.tsx`)
- Multi-select emotions and location
- Optional notes
- Timestamps automatically recorded

### 3. Urge Surfing (`app/urge.tsx`)
- 90-second countdown timer with breathing animation
- Pattern insight display (informational, not interactive)
- **Reflection flow after timer completes:**
  - Urge intensity (1-5 scale)
  - Triggers present (multi-select)
  - Coping strategies used (multi-select)
  - Optional reflection note
- All reflection data saved with urge entry

### 4. Insights Tab (`app/(tabs)/progress.tsx`)
**Visual, scannable design with minimal text:**

- **Stats Row:** Binge-free time, urges surfed (with "vs last week" trend), best streak (with "new record!" indicator)
- **Streak Calendar:** 14-day visual showing binge-free days
- **Personal Bests:** Badge-style display with icons (award, zap)
- **Your Patterns:** Chip-based display showing:
  - Top triggers (with alert-circle icons)
  - Peak time (with clock icon)
  - Common place (with map-pin icon)
- **What's Working:**
  - Large percentage with progress bar for success rate
  - Best strategy chip with heart icon
  - Strategy pairing: "Trigger → Strategy" visual
- **Try This:** Suggested action based on patterns
- **Encouragement:** Motivational message at bottom

**Filler data is shown when no real data exists** to preview the UI.

### 5. Daily Check-ins (`app/checkin.tsx`)
- Urge intensity tracking (1-5 scale)
- Trigger selection
- Builds data for pattern recognition

### 6. Self-Care Journeys (`app/journeys.tsx`, `app/journey/[id].tsx`)
- Multi-day guided exercises
- Categories: awareness, mindfulness, self-compassion, coping
- Daily prompts, exercises, and reflections

### 7. Settings (`app/(tabs)/settings.tsx`)
- Theme toggle (dark/light)
- Notification preferences
- Data export/reset options

## Data Models (src/types/index.ts)

### LogEntry
```typescript
interface LogEntry {
  id: string;
  timestamp: number;
  emotions: string[];
  location?: string;
  notes?: string;
}
```

### UrgeEntry
```typescript
interface UrgeEntry {
  id: string;
  timestamp: number;
  surfed: boolean;
  duration?: number;
  // Reflection data (when surfed = true)
  intensity?: 1 | 2 | 3 | 4 | 5;
  triggersPresent?: string[];
  copingStrategies?: string[];
  reflectionNote?: string;
}
```

### UrgeCheckIn
```typescript
interface UrgeCheckIn {
  id: string;
  timestamp: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  triggers: string[];
}
```

### UserStats
```typescript
interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalLogs: number;
  urgesSurfed: number;
  lastBingeDate: number | null;
}
```

## Design Decisions

1. **Renamed "Progress" tab to "Insights"** - Better reflects the pattern-recognition focus

2. **Reflection flow after urge surfing** - Captures valuable data about what triggers were present and what coping strategies helped, enabling pattern detection

3. **Visual chip-based UI for Insights** - Replaced text-heavy paragraphs with scannable visual elements (chips, progress bars, icons) to reduce cognitive load

4. **Filler data for UI preview** - Shows sample data when user has no entries so they can see what the full UI looks like

5. **Trend indicators:**
   - "vs last week" on urges surfed (comparing week-over-week)
   - "new record!" on best streak (when current streak >= longest streak)
   - Removed confusing trend from binge-free stat

6. **Strategy pairing visualization** - Shows "Trigger → Strategy" relationship to help users understand what works for them

## Constants (src/constants/data.ts)

- `EMOTIONS`: 12 common emotional triggers
- `LOCATIONS`: 10 common places
- `URGE_TRIGGERS`: 12 triggers for urge check-ins
- `COPING_STRATEGIES`: 10 strategies (deep breathing, distraction, walking, etc.)
- `URGE_INTENSITY_LABELS`: 1-5 scale with descriptions
- `MILESTONES`: Streak, urges surfed, and logging achievements
- `JOURNEYS`: 4 multi-day self-care programs
- `TIME_WINDOWS`: Morning, Afternoon, Evening, Night definitions

## Theme (src/constants/theme.ts)

- Light and dark color schemes
- Consistent spacing scale (xs through xxxl)
- Typography scale with font sizes and weights
- Border radius constants

## Running the App
```bash
npm install
npx expo start
```

## Future Considerations
- AI-powered insights (stubs in src/services/ai.ts)
- Cloud sync for data backup
- More detailed analytics/charts
- Social features or therapist sharing
