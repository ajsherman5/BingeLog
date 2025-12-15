import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  BingeLog,
  UserStats,
  AppState,
  UrgeCheckIn,
  UrgeEntry,
  JourneyProgress,
  UrgeIntensity,
  Milestone,
  Subscription,
  SubscriptionSource,
} from '../types';
import { EMOTIONS, LOCATIONS, MILESTONES } from '../constants/data';
import { schedulePredictiveNotifications } from '../utils/notifications';

interface AppContextType extends AppState {
  addLog: (log: Omit<BingeLog, 'id'>) => void;
  addUrgeCheckIn: (intensity: UrgeIntensity, triggers: string[], note?: string) => void;
  addUrgeEntry: (entry: Omit<UrgeEntry, 'id' | 'timestamp'>) => void;
  setOnboarded: (value: boolean) => void;
  updateSelectedEmotions: (emotions: string[]) => void;
  updateSelectedLocations: (locations: string[]) => void;
  resetStreak: () => void;
  startJourney: (journeyId: string) => void;
  completeJourneyDay: (journeyId: string, day: number) => void;
  getJourneyProgress: (journeyId: string) => JourneyProgress | undefined;
  checkAndAwardMilestones: () => Milestone[];
  setNotificationsEnabled: (enabled: boolean) => void;
  updateLastCheckIn: () => void;
  hasCheckedInToday: () => boolean;
  triggerHaptic: (type: 'light' | 'medium' | 'success' | 'warning' | 'error') => void;
  newMilestones: Milestone[];
  clearNewMilestones: () => void;
  getMostCommonTrigger: () => string | null;
  // Premium subscription
  isPremium: boolean;
  upgradeToPremium: (source: SubscriptionSource) => void;
  restorePurchase: () => Promise<boolean>;
  // Data management
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = '@bingelog_data';

const initialStats: UserStats = {
  currentStreak: 0,
  longestStreak: 0,
  lastBingeDate: null,
  urgesSurfed: 0,
  totalUrges: 0,
  totalBinges: 0,
  milestonesAchieved: [],
};

const initialSubscription: Subscription = {
  tier: 'free',
};

const initialState: AppState = {
  logs: [],
  urgeCheckIns: [],
  urges: [],
  stats: initialStats,
  journeyProgress: [],
  isOnboarded: false,
  selectedEmotions: EMOTIONS.slice(0, 6),
  selectedLocations: LOCATIONS.slice(0, 5),
  lastCheckIn: undefined,
  notificationsEnabled: false,
  subscription: initialSubscription,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newMilestones, setNewMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveData();
    }
  }, [state, isLoaded]);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppState;
        // Merge with initial state to handle new fields
        setState({
          ...initialState,
          ...parsed,
          stats: { ...initialStats, ...parsed.stats },
          subscription: { ...initialSubscription, ...parsed.subscription },
        });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const triggerHaptic = useCallback(async (type: 'light' | 'medium' | 'success' | 'warning' | 'error') => {
    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (e) {
      // Haptics not available
    }
  }, []);

  const checkAndAwardMilestones = useCallback((): Milestone[] => {
    const newlyAchieved: Milestone[] = [];
    const currentStreak = state.stats.lastBingeDate
      ? Math.floor((Date.now() - state.stats.lastBingeDate) / (1000 * 60 * 60 * 24))
      : 0;

    MILESTONES.forEach((milestone) => {
      if (state.stats.milestonesAchieved.includes(milestone.id)) {
        return;
      }

      let achieved = false;

      switch (milestone.type) {
        case 'streak':
          achieved = currentStreak >= milestone.days;
          break;
        case 'urges_surfed':
          achieved = state.stats.urgesSurfed >= milestone.days;
          break;
        case 'logs':
          achieved = state.logs.length >= milestone.days;
          break;
      }

      if (achieved) {
        newlyAchieved.push({ ...milestone, achievedAt: Date.now() });
      }
    });

    if (newlyAchieved.length > 0) {
      setState((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          milestonesAchieved: [
            ...prev.stats.milestonesAchieved,
            ...newlyAchieved.map((m) => m.id),
          ],
        },
      }));
      setNewMilestones(newlyAchieved);
      triggerHaptic('success');
    }

    return newlyAchieved;
  }, [state.stats, state.logs.length, triggerHaptic]);

  const clearNewMilestones = () => {
    setNewMilestones([]);
  };

  const addLog = (logData: Omit<BingeLog, 'id'>) => {
    const newLog: BingeLog = {
      ...logData,
      id: Date.now().toString(),
    };

    setState((prev) => {
      const newLogs = [newLog, ...prev.logs];

      return {
        ...prev,
        logs: newLogs,
        stats: {
          ...prev.stats,
          currentStreak: 0,
          longestStreak: prev.stats.longestStreak,
          lastBingeDate: newLog.timestamp,
          totalBinges: prev.stats.totalBinges + 1,
        },
      };
    });

    triggerHaptic('light');

    // Check for milestones after logging
    setTimeout(() => checkAndAwardMilestones(), 100);

    // Update predictive notifications with new data
    if (state.notificationsEnabled) {
      schedulePredictiveNotifications([newLog, ...state.logs]);
    }
  };

  const addUrgeCheckIn = (intensity: UrgeIntensity, triggers: string[], note?: string) => {
    const newEntry: UrgeCheckIn = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      intensity,
      triggers,
      note,
    };

    setState((prev) => ({
      ...prev,
      urgeCheckIns: [newEntry, ...prev.urgeCheckIns],
      lastCheckIn: Date.now(),
    }));

    triggerHaptic('light');
  };

  const getMostCommonTrigger = (): string | null => {
    // Combine triggers from binge logs and urge check-ins
    const allTriggers: string[] = [];

    state.logs.forEach((log) => {
      allTriggers.push(...log.emotions);
    });

    state.urgeCheckIns.forEach((checkIn) => {
      allTriggers.push(...checkIn.triggers);
    });

    if (allTriggers.length === 0) return null;

    const counts: Record<string, number> = {};
    allTriggers.forEach((trigger) => {
      counts[trigger] = (counts[trigger] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || null;
  };

  const addUrgeEntry = (entryData: Omit<UrgeEntry, 'id' | 'timestamp'>) => {
    const newEntry: UrgeEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...entryData,
    };

    setState((prev) => ({
      ...prev,
      urges: [newEntry, ...prev.urges],
      stats: {
        ...prev.stats,
        urgesSurfed: entryData.surfed ? prev.stats.urgesSurfed + 1 : prev.stats.urgesSurfed,
        totalUrges: prev.stats.totalUrges + 1,
      },
    }));

    triggerHaptic(entryData.surfed ? 'success' : 'light');

    // Check for milestones after urge entry
    setTimeout(() => checkAndAwardMilestones(), 100);
  };

  const setOnboarded = (value: boolean) => {
    setState((prev) => ({ ...prev, isOnboarded: value }));
  };

  const updateSelectedEmotions = (emotions: string[]) => {
    setState((prev) => ({ ...prev, selectedEmotions: emotions }));
  };

  const updateSelectedLocations = (locations: string[]) => {
    setState((prev) => ({ ...prev, selectedLocations: locations }));
  };

  const resetStreak = () => {
    setState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        currentStreak: 0,
      },
    }));
  };

  const startJourney = (journeyId: string) => {
    const existingProgress = state.journeyProgress.find((jp) => jp.journeyId === journeyId);

    if (!existingProgress) {
      const newProgress: JourneyProgress = {
        journeyId,
        startedAt: Date.now(),
        currentDay: 1,
        completedDays: [],
        completed: false,
      };

      setState((prev) => ({
        ...prev,
        journeyProgress: [...prev.journeyProgress, newProgress],
      }));

      triggerHaptic('medium');
    }
  };

  const completeJourneyDay = (journeyId: string, day: number) => {
    setState((prev) => ({
      ...prev,
      journeyProgress: prev.journeyProgress.map((jp) => {
        if (jp.journeyId !== journeyId) return jp;

        const newCompletedDays = jp.completedDays.includes(day)
          ? jp.completedDays
          : [...jp.completedDays, day];

        return {
          ...jp,
          completedDays: newCompletedDays,
          currentDay: Math.max(jp.currentDay, day + 1),
        };
      }),
    }));

    triggerHaptic('success');
  };

  const getJourneyProgress = (journeyId: string): JourneyProgress | undefined => {
    return state.journeyProgress.find((jp) => jp.journeyId === journeyId);
  };

  const setNotificationsEnabled = (enabled: boolean) => {
    setState((prev) => ({ ...prev, notificationsEnabled: enabled }));

    // Schedule or cancel predictive notifications based on setting
    if (enabled && state.logs.length >= 5) {
      schedulePredictiveNotifications(state.logs);
    }
  };

  const updateLastCheckIn = () => {
    setState((prev) => ({ ...prev, lastCheckIn: Date.now() }));
  };

  const hasCheckedInToday = (): boolean => {
    if (!state.lastCheckIn) return false;

    const today = new Date();
    const checkInDate = new Date(state.lastCheckIn);

    return (
      today.getFullYear() === checkInDate.getFullYear() &&
      today.getMonth() === checkInDate.getMonth() &&
      today.getDate() === checkInDate.getDate()
    );
  };

  // Calculate current streak on each render
  const currentStreak = state.stats.lastBingeDate
    ? Math.floor((Date.now() - state.stats.lastBingeDate) / (1000 * 60 * 60 * 24))
    : 0;

  // Check if subscription is premium and not expired
  const isPremium = state.subscription.tier === 'premium' && (
    !state.subscription.expiresAt || state.subscription.expiresAt > Date.now()
  );

  const upgradeToPremium = (source: SubscriptionSource) => {
    setState((prev) => ({
      ...prev,
      subscription: {
        tier: 'premium',
        purchasedAt: Date.now(),
        source,
        // For dev/promo, set to lifetime (no expiry)
        expiresAt: source === 'dev' || source === 'promo' ? undefined : Date.now() + 365 * 24 * 60 * 60 * 1000,
      },
    }));
    triggerHaptic('success');
  };

  const restorePurchase = async (): Promise<boolean> => {
    // TODO: Implement actual restore with RevenueCat/IAP
    // For now, just return false (no purchase to restore)
    return false;
  };

  const resetAllData = async (): Promise<void> => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.clear();
      // Reset in-memory state to initial values
      setState(initialState);
      setNewMilestones([]);
    } catch (error) {
      console.error('Failed to reset data:', error);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        stats: {
          ...state.stats,
          currentStreak,
          longestStreak: Math.max(currentStreak, state.stats.longestStreak),
        },
        addLog,
        addUrgeCheckIn,
        addUrgeEntry,
        setOnboarded,
        updateSelectedEmotions,
        updateSelectedLocations,
        resetStreak,
        startJourney,
        completeJourneyDay,
        getJourneyProgress,
        checkAndAwardMilestones,
        setNotificationsEnabled,
        updateLastCheckIn,
        hasCheckedInToday,
        triggerHaptic,
        newMilestones,
        clearNewMilestones,
        getMostCommonTrigger,
        isPremium,
        upgradeToPremium,
        restorePurchase,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
