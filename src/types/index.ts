export interface BingeLog {
  id: string;
  timestamp: number;
  emotions: string[];
  location: string;
  note?: string;
}

export interface UrgeCheckIn {
  id: string;
  timestamp: number;
  intensity: UrgeIntensity;
  triggers: string[];
  note?: string;
}

export type UrgeIntensity = 1 | 2 | 3 | 4 | 5; // 1 = no urges, 5 = overwhelming

export interface UrgeEntry {
  id: string;
  timestamp: number;
  surfed: boolean; // true if they resisted, false if they gave in
  duration?: number; // seconds spent on urge timer
  // Reflection data (only when surfed = true)
  intensity?: UrgeIntensity; // how strong was the urge
  triggersPresent?: string[]; // what emotions/triggers were felt
  copingStrategies?: string[]; // what helped them get through it
  reflectionNote?: string; // optional note about the experience
}

export interface Milestone {
  id: string;
  type: MilestoneType;
  days: number;
  title: string;
  description: string;
  achievedAt?: number;
  shared?: boolean;
}

export type MilestoneType = 'streak' | 'urges_surfed' | 'logs' | 'journey';

export interface Journey {
  id: string;
  title: string;
  description: string;
  duration: number; // days
  category: JourneyCategory;
  days: JourneyDay[];
  icon: string;
}

export type JourneyCategory = 'awareness' | 'coping' | 'mindfulness' | 'self-compassion';

export interface JourneyDay {
  day: number;
  title: string;
  prompt: string;
  exercise?: string;
  reflection?: string;
}

export interface JourneyProgress {
  journeyId: string;
  startedAt: number;
  currentDay: number;
  completedDays: number[];
  completed: boolean;
}

export interface UserStats {
  currentStreak: number; // days binge-free
  longestStreak: number;
  lastBingeDate: number | null;
  urgesSurfed: number; // urges resisted via timer
  totalUrges: number;
  totalBinges: number;
  milestonesAchieved: string[];
}

export interface AppState {
  logs: BingeLog[];
  urgeCheckIns: UrgeCheckIn[];
  urges: UrgeEntry[];
  stats: UserStats;
  journeyProgress: JourneyProgress[];
  isOnboarded: boolean;
  selectedEmotions: string[];
  selectedLocations: string[];
  lastCheckIn?: number;
  notificationsEnabled: boolean;
  subscription: Subscription;
}

export type ThemeMode = 'light' | 'dark' | 'system';

// Premium subscription types
export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionSource = 'apple' | 'google' | 'promo' | 'dev';

export interface Subscription {
  tier: SubscriptionTier;
  expiresAt?: number;  // timestamp, undefined = lifetime
  purchasedAt?: number;
  source?: SubscriptionSource;
}

export type PremiumFeature =
  | 'unlimited_history'
  | 'detailed_charts'
  | 'predictive_alerts'
  | 'ai_coach'
  | 'export_reports';

export interface PredictiveAlert {
  type: 'warning' | 'info' | 'success';
  message: string;
  suggestion?: string;
  dismissedAt?: number;
}
