import { BingeLog, UrgeCheckIn, PredictiveAlert } from '../types';
import { TIME_WINDOWS, DAYS_OF_WEEK } from '../constants/data';

const ALERT_THRESHOLD = 2; // Minimum occurrences to trigger alert
const RECENT_DAYS = 30; // Look back period for pattern analysis

interface RiskPattern {
  day: string;
  timeWindow: string;
  count: number;
  riskScore: number;
}

function getCurrentTimeWindow(): string {
  const hour = new Date().getHours();
  const timeWindow = TIME_WINDOWS.find(tw => {
    if (tw.start < tw.end) {
      return hour >= tw.start && hour < tw.end;
    }
    return hour >= tw.start || hour < tw.end;
  });
  return timeWindow?.label || 'Evening';
}

function getTimeWindowFromHour(hour: number): string {
  const timeWindow = TIME_WINDOWS.find(tw => {
    if (tw.start < tw.end) {
      return hour >= tw.start && hour < tw.end;
    }
    return hour >= tw.start || hour < tw.end;
  });
  return timeWindow?.label || 'Evening';
}

export function analyzePatternsForPredictions(
  logs: BingeLog[],
  checkIns: UrgeCheckIn[]
): RiskPattern[] {
  const now = Date.now();
  const cutoff = now - (RECENT_DAYS * 24 * 60 * 60 * 1000);

  // Filter to recent data
  const recentLogs = logs.filter(log => log.timestamp >= cutoff);

  // Build day/time frequency map
  const patterns: Record<string, number> = {};
  const totalsByDay: Record<string, number> = {};
  const totalsByTime: Record<string, number> = {};

  recentLogs.forEach(log => {
    const date = new Date(log.timestamp);
    const day = DAYS_OF_WEEK[date.getDay()];
    const timeWindow = getTimeWindowFromHour(date.getHours());
    const key = `${day}-${timeWindow}`;

    patterns[key] = (patterns[key] || 0) + 1;
    totalsByDay[day] = (totalsByDay[day] || 0) + 1;
    totalsByTime[timeWindow] = (totalsByTime[timeWindow] || 0) + 1;
  });

  // Calculate risk scores
  const riskPatterns: RiskPattern[] = [];
  const totalLogs = recentLogs.length || 1;

  Object.entries(patterns).forEach(([key, count]) => {
    if (count >= ALERT_THRESHOLD) {
      const [day, timeWindow] = key.split('-');
      // Risk score is based on frequency relative to total
      const riskScore = (count / totalLogs) * 100;
      riskPatterns.push({ day, timeWindow, count, riskScore });
    }
  });

  // Sort by risk score
  return riskPatterns.sort((a, b) => b.riskScore - a.riskScore);
}

export function getPredictiveAlert(
  logs: BingeLog[],
  checkIns: UrgeCheckIn[]
): PredictiveAlert | null {
  if (logs.length < 3) return null;

  const now = new Date();
  const currentDay = DAYS_OF_WEEK[now.getDay()];
  const currentTimeWindow = getCurrentTimeWindow();
  const currentHour = now.getHours();

  const patterns = analyzePatternsForPredictions(logs, checkIns);

  // Check if current time matches a high-risk pattern
  const currentPattern = patterns.find(
    p => p.day === currentDay && p.timeWindow === currentTimeWindow
  );

  if (currentPattern && currentPattern.count >= ALERT_THRESHOLD) {
    return {
      type: 'warning',
      message: `${currentDay} ${currentTimeWindow.toLowerCase()}s have been challenging for you`,
      suggestion: 'The urge timer is ready if you need it',
    };
  }

  // Check if we're approaching a high-risk time (within 2 hours)
  const nextTimeWindow = TIME_WINDOWS.find(tw => tw.start > currentHour);
  if (nextTimeWindow) {
    const upcomingPattern = patterns.find(
      p => p.day === currentDay && p.timeWindow === nextTimeWindow.label
    );
    if (upcomingPattern && upcomingPattern.count >= ALERT_THRESHOLD) {
      return {
        type: 'info',
        message: `${currentDay} ${nextTimeWindow.label.toLowerCase()}s are usually tough`,
        suggestion: 'Have your coping strategies ready',
      };
    }
  }

  // Check if tomorrow is typically difficult
  const tomorrow = DAYS_OF_WEEK[(now.getDay() + 1) % 7];
  const tomorrowPatterns = patterns.filter(p => p.day === tomorrow);
  if (tomorrowPatterns.length > 0 && tomorrowPatterns[0].count >= ALERT_THRESHOLD) {
    const toughTime = tomorrowPatterns[0];
    return {
      type: 'info',
      message: `Tomorrow (${tomorrow}) ${toughTime.timeWindow.toLowerCase()}s can be challenging`,
      suggestion: 'Consider planning ahead',
    };
  }

  return null;
}

export function getWeeklyRiskSummary(
  logs: BingeLog[],
  checkIns: UrgeCheckIn[]
): { highRiskDays: string[]; bestDays: string[] } {
  const patterns = analyzePatternsForPredictions(logs, checkIns);

  // Aggregate by day
  const dayRisks: Record<string, number> = {};
  DAYS_OF_WEEK.forEach(day => {
    const dayPatterns = patterns.filter(p => p.day === day);
    dayRisks[day] = dayPatterns.reduce((sum, p) => sum + p.count, 0);
  });

  const sortedDays = Object.entries(dayRisks).sort((a, b) => b[1] - a[1]);
  const highRiskDays = sortedDays
    .filter(([, count]) => count >= ALERT_THRESHOLD)
    .slice(0, 2)
    .map(([day]) => day);

  const bestDays = sortedDays
    .filter(([, count]) => count === 0)
    .slice(0, 2)
    .map(([day]) => day);

  return { highRiskDays, bestDays };
}
