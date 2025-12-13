import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION_MESSAGES } from '../constants/data';
import { predictHighRiskTimes, RiskPrediction, hasAIApiKey } from '../services/ai';
import { BingeLog } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4A5A5',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleEveningCheckIn(): Promise<void> {
  // Cancel existing evening notifications
  await cancelEveningCheckIn();

  const messages = NOTIFICATION_MESSAGES.eveningCheckIn;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Evening Check-in',
      body: randomMessage,
      data: { type: 'evening_checkin' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20, // 8 PM
      minute: 0,
    },
  });
}

export async function cancelEveningCheckIn(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.type === 'evening_checkin') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

export async function scheduleMorningGreeting(): Promise<void> {
  // Cancel existing morning notifications
  await cancelMorningGreeting();

  const messages = NOTIFICATION_MESSAGES.morningGreeting;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Good Morning',
      body: randomMessage,
      data: { type: 'morning_greeting' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9, // 9 AM
      minute: 0,
    },
  });
}

export async function cancelMorningGreeting(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.type === 'morning_greeting') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

export async function enableAllNotifications(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (hasPermission) {
    await scheduleEveningCheckIn();
    await scheduleMorningGreeting();
  }
}

export async function disableAllNotifications(): Promise<void> {
  await cancelEveningCheckIn();
  await cancelMorningGreeting();
}

export async function sendStreakCelebration(streak: number): Promise<void> {
  const messages = NOTIFICATION_MESSAGES.streakCelebration;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${streak} Day Streak!`,
      body: randomMessage,
      data: { type: 'streak_celebration' },
    },
    trigger: null, // Send immediately
  });
}

// Predictive notifications based on AI analysis
export async function schedulePredictiveNotifications(logs: BingeLog[]): Promise<void> {
  // Cancel existing predictive notifications
  await cancelPredictiveNotifications();

  // Check if AI is available
  const hasAI = await hasAIApiKey();
  if (!hasAI || logs.length < 5) return;

  // Get predictions from AI
  const predictions = await predictHighRiskTimes(logs);
  if (predictions.length === 0) return;

  // Schedule notifications for high-risk times
  for (const prediction of predictions) {
    if (prediction.riskLevel === 'low') continue;

    const dayMap: Record<string, number> = {
      'sunday': 1, 'monday': 2, 'tuesday': 3, 'wednesday': 4,
      'thursday': 5, 'friday': 6, 'saturday': 7,
    };

    const timeMap: Record<string, number> = {
      'morning': 9,
      'afternoon': 14,
      'evening': 18,
    };

    const weekday = dayMap[prediction.dayOfWeek.toLowerCase()];
    const hour = timeMap[prediction.timeOfDay.toLowerCase()] || 18;

    if (!weekday) continue;

    const messages = [
      "This is usually a challenging time for you. Remember: urges pass.",
      "Heads up - you might feel urges soon. You've got tools to handle this.",
      "Checking in: this time has been tricky before. How are you feeling?",
      "Gentle reminder: you're stronger than the urge. Take a breath.",
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: prediction.riskLevel === 'high' ? 'Urge Alert' : 'Gentle Check-in',
        body: randomMessage,
        data: { type: 'predictive', prediction },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute: 0,
      },
    });
  }
}

export async function cancelPredictiveNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.type === 'predictive') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

// Send immediate predictive alert (for high-risk detection)
export async function sendPredictiveAlert(prediction: RiskPrediction): Promise<void> {
  const messages = [
    `Based on your patterns, ${prediction.timeOfDay.toLowerCase()}s on ${prediction.dayOfWeek} can be challenging. You've got this.`,
    `This is typically a high-risk time for you. Remember your coping tools.`,
    `Urges might be stronger right now. Take a moment to check in with yourself.`,
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Check-in',
      body: randomMessage,
      data: { type: 'predictive_immediate' },
    },
    trigger: null, // Send immediately
  });
}
