# BingeLog - Project Context

## Overview
BingeLog is a React Native/Expo app designed to help users track and understand their binge eating patterns. The app focuses on awareness, pattern recognition, and compassionate self-tracking rather than restriction or shame.

## Tech Stack
- **Framework:** React Native with Expo (managed workflow)
- **Routing:** Expo Router (file-based routing)
- **Language:** TypeScript
- **State Management:** React Context (AppContext, ThemeContext, PremiumContext)
- **Storage:** AsyncStorage for local persistence
- **Icons:** @expo/vector-icons (Feather icons)
- **Notifications:** expo-notifications
- **Animations:** expo-linear-gradient (for premium UI)

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
│   ├── index.ts       # Component exports
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Chip.tsx
│   ├── FloatingActionButton.tsx
│   ├── JourneyCard.tsx
│   ├── MilestoneModal.tsx
│   ├── PaywallLock.tsx      # Premium upgrade CTA component
│   ├── PredictiveAlert.tsx  # AI-powered contextual warnings
│   ├── PremiumBadge.tsx     # Small PRO badge
│   ├── ProgressRing.tsx
│   ├── StatsCard.tsx
│   ├── StreakBadge.tsx
│   ├── StreakCard.tsx
│   ├── UpgradeModal.tsx     # Full upgrade modal
│   ├── UrgeCheckIn.tsx
│   ├── WeekStrip.tsx
│   └── charts/              # Premium chart components
│       ├── index.ts
│       ├── DayPatterns.tsx
│       ├── EmotionBreakdown.tsx
│       ├── TimeHeatmap.tsx
│       └── TrendChart.tsx
├── constants/
│   ├── data.ts       # App data (emotions, locations, triggers, journeys, milestones)
│   ├── premium.ts    # Premium feature definitions
│   └── theme.ts      # Design tokens (colors, spacing, typography)
├── context/
│   ├── AppContext.tsx      # Global app state (logs, urges, stats, check-ins, subscription)
│   ├── PremiumContext.tsx  # Premium feature gating and upgrade prompts
│   └── ThemeContext.tsx    # Theme state (dark/light mode)
├── services/
│   ├── ai.ts              # AI service stubs (for future implementation)
│   └── predictions.ts     # Predictive alert logic
├── types/
│   └── index.ts      # TypeScript interfaces
└── utils/
    └── notifications.ts  # Notification scheduling
```

## Key Features

### 1. Home Screen (`app/(tabs)/index.tsx`)
- Displays current streak and stats
- **Pro button** in header (for non-premium users) - opens upgrade modal
- Quick action buttons: Log Binge, Surf Urge, Check In
- Week strip showing recent activity
- Milestone celebrations
- **Predictive alerts** (premium) - contextual warnings based on patterns

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

**Free tier features:**
- **Stats Row:** Binge-free time, urges surfed (with "vs last week" trend), best streak (with "new record!" indicator)
- **Streak Calendar:** 14-day visual showing binge-free days
- **Personal Bests:** Badge-style display with icons (award, zap)
- **Unlock History prompt** (if user has data older than 30 days)

**Premium tier features (behind PaywallLock):**
- **Your Patterns:** Chip-based display showing:
  - Top triggers (with alert-circle icons)
  - Peak time (with clock icon)
  - Common place (with map-pin icon)
- **What's Working:**
  - Large percentage with progress bar for success rate
  - Best strategy chip with heart icon
  - Strategy pairing: "Trigger → Strategy" visual
- **Try This:** Suggested action based on patterns
- **Detailed Charts:**
  - TrendChart - Weekly/monthly line chart
  - EmotionBreakdown - Pie/bar chart of triggers
  - TimeHeatmap - Day/time grid visualization
  - DayPatterns - Bar chart of weekly patterns

**PaywallLock Component:**
- Big, prominent purple gradient card
- Feature checklist with checkmarks
- "Upgrade to Pro" CTA button
- Impossible to miss - designed to convert

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
- **Premium section:**
  - Shows upgrade CTA for free users
  - Shows "Premium Active" status for premium users
  - Dev toggle to enable/disable premium (for testing)
- Data management:
  - Export data
  - Clear all data (properly resets both AsyncStorage AND in-memory state)

## Premium System

### Subscription State (`src/types/index.ts`)
```typescript
type SubscriptionTier = 'free' | 'premium';
type SubscriptionSource = 'apple' | 'google' | 'dev' | 'promo';

interface Subscription {
  tier: SubscriptionTier;
  expiresAt?: number;
  purchasedAt?: number;
  source?: SubscriptionSource;
}
```

### Premium Features
Defined in `src/constants/premium.ts`:
- `unlimited_history` - Access data beyond 30 days
- `detailed_charts` - Full analytics and visualizations
- `ai_insights` - Predictive alerts and recommendations

### Premium Context (`src/context/PremiumContext.tsx`)
- `isPremium` - boolean check
- `canAccess(feature)` - feature-specific gating
- `showUpgradePrompt(feature)` - triggers upgrade modal
- `upgradeModalVisible` / `hideUpgradePrompt` - modal state

### Free vs Premium Limits
- **History:** Free = 30 days, Premium = unlimited
- **Insights:** Free = basic stats only, Premium = full patterns & charts
- **Predictive Alerts:** Premium only

## Data Models (src/types/index.ts)

### BingeLog
```typescript
interface BingeLog {
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
  intensity?: UrgeIntensity;
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
  intensity: UrgeIntensity;
  triggers: string[];
  note?: string;
}
```

### UserStats
```typescript
interface UserStats {
  currentStreak: number;
  longestStreak: number;
  lastBingeDate: number | null;
  urgesSurfed: number;
  totalUrges: number;
  totalBinges: number;
  milestonesAchieved: string[];
}
```

## Design Decisions

1. **Renamed "Progress" tab to "Insights"** - Better reflects the pattern-recognition focus

2. **Reflection flow after urge surfing** - Captures valuable data about what triggers were present and what coping strategies helped, enabling pattern detection

3. **Visual chip-based UI for Insights** - Replaced text-heavy paragraphs with scannable visual elements (chips, progress bars, icons) to reduce cognitive load

4. **Premium feature gating** - Free users see basic stats, premium users get full insights, charts, and predictive alerts

5. **Big, prominent PaywallLock** - Purple gradient card with feature list that's impossible to miss, designed to convert free users

6. **Pro button in header** - Small upgrade prompt always visible on home screen for non-premium users

7. **Proper data reset** - `resetAllData()` function clears both AsyncStorage AND in-memory React state

8. **Predictive alerts** - AI-powered contextual warnings based on historical patterns (e.g., "Sunday evenings have been challenging")

## Constants (src/constants/data.ts)

- `EMOTIONS`: 12 common emotional triggers
- `LOCATIONS`: 10 common places
- `URGE_TRIGGERS`: 12 triggers for urge check-ins
- `COPING_STRATEGIES`: 10 strategies (deep breathing, distraction, walking, etc.)
- `URGE_INTENSITY_LABELS`: 1-5 scale with descriptions
- `MILESTONES`: Streak, urges surfed, and logging achievements
- `JOURNEYS`: 4 multi-day self-care programs
- `TIME_WINDOWS`: Morning, Afternoon, Evening, Night definitions
- `DAYS_OF_WEEK`: Day name constants

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

## Next Steps (TODO)
1. **Onboarding flow** - Improve first-time user experience
2. **Payment integration** - RevenueCat or expo-in-app-purchases for real payments
3. **Testing** - Thorough testing of all features
4. **App Store submission** - Prepare for Apple review

## Session Notes

### Latest Session (Premium System Implementation)
- Implemented full premium subscription system
- Added subscription state to AppContext
- Created PremiumContext for feature gating
- Built premium UI components (UpgradeModal, PaywallLock, PremiumBadge)
- Added premium section to Settings with dev toggle
- Gated Insights features (patterns, charts, suggestions) behind premium
- Created chart components (TrendChart, EmotionBreakdown, TimeHeatmap, DayPatterns)
- Added predictive alerts for premium users
- Fixed "Clear All Data" to properly reset all state
- Redesigned PaywallLock as big, prominent upgrade CTA
- Added "Pro" button to home screen header
