import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useApp } from '../../src/context/AppContext';
import { usePremium } from '../../src/context/PremiumContext';
import { Card, UpgradeModal, PaywallLock } from '../../src/components';
import { TrendChart, EmotionBreakdown, TimeHeatmap, DayPatterns } from '../../src/components/charts';
import { TIME_WINDOWS, DAYS_OF_WEEK } from '../../src/constants/data';
import { FREE_HISTORY_DAYS } from '../../src/constants/premium';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/theme';

const MIN_DATA_FOR_PATTERNS = 3;

type StrategyPairing = { trigger: string; strategy: string; count: number };

export default function InsightsScreen() {
  const { theme } = useTheme();
  const { logs, stats, urges, urgeCheckIns, isPremium } = useApp();
  const { showUpgradePrompt, upgradeModalVisible, hideUpgradePrompt, currentFeature } = usePremium();

  // Calculate history cutoff date (30 days ago)
  const historyCutoff = useMemo(() => {
    return Date.now() - (FREE_HISTORY_DAYS * 24 * 60 * 60 * 1000);
  }, []);

  // Check if user has data older than the free limit
  const hasOlderData = useMemo(() => {
    const oldLogs = logs.some(log => log.timestamp < historyCutoff);
    const oldUrges = urges.some(urge => urge.timestamp < historyCutoff);
    const oldCheckIns = urgeCheckIns.some(checkIn => checkIn.timestamp < historyCutoff);
    return oldLogs || oldUrges || oldCheckIns;
  }, [logs, urges, urgeCheckIns, historyCutoff]);

  // Count older entries
  const olderEntriesCount = useMemo(() => {
    const oldLogs = logs.filter(log => log.timestamp < historyCutoff).length;
    const oldUrges = urges.filter(urge => urge.timestamp < historyCutoff).length;
    const oldCheckIns = urgeCheckIns.filter(checkIn => checkIn.timestamp < historyCutoff).length;
    return oldLogs + oldUrges + oldCheckIns;
  }, [logs, urges, urgeCheckIns, historyCutoff]);

  // Filter data based on premium status
  const filteredLogs = useMemo(() => {
    if (isPremium) return logs;
    return logs.filter(log => log.timestamp >= historyCutoff);
  }, [logs, isPremium, historyCutoff]);

  const filteredUrges = useMemo(() => {
    if (isPremium) return urges;
    return urges.filter(urge => urge.timestamp >= historyCutoff);
  }, [urges, isPremium, historyCutoff]);

  const filteredUrgeCheckIns = useMemo(() => {
    if (isPremium) return urgeCheckIns;
    return urgeCheckIns.filter(checkIn => checkIn.timestamp >= historyCutoff);
  }, [urgeCheckIns, isPremium, historyCutoff]);

  // Calculate time since last binge (granular)
  const timeSinceLastBinge = useMemo(() => {
    if (!stats.lastBingeDate) return null;

    const now = Date.now();
    const diff = now - stats.lastBingeDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days === 0) {
      return `${hours}h`;
    } else if (days < 7) {
      return `${days}d ${hours}h`;
    } else {
      return `${days} days`;
    }
  }, [stats.lastBingeDate]);

  type TrendDirection = 'better' | 'worse' | 'same';

  // Calculate trends (this week vs last week)
  const trends = useMemo(() => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    const thisWeekLogs = filteredLogs.filter(l => l.timestamp >= oneWeekAgo);
    const lastWeekLogs = filteredLogs.filter(l => l.timestamp >= twoWeeksAgo && l.timestamp < oneWeekAgo);

    const thisWeekUrges = filteredUrges.filter(u => u.timestamp >= oneWeekAgo);
    const lastWeekUrges = filteredUrges.filter(u => u.timestamp >= twoWeeksAgo && u.timestamp < oneWeekAgo);

    const thisWeekSurfed = thisWeekUrges.filter(u => u.surfed).length;
    const lastWeekSurfed = lastWeekUrges.filter(u => u.surfed).length;

    const bingesTrend: TrendDirection = thisWeekLogs.length < lastWeekLogs.length ? 'better' :
               thisWeekLogs.length > lastWeekLogs.length ? 'worse' : 'same';
    const urgesTrend: TrendDirection = thisWeekSurfed > lastWeekSurfed ? 'better' :
               thisWeekSurfed < lastWeekSurfed ? 'worse' : 'same';

    return {
      binges: {
        current: thisWeekLogs.length,
        previous: lastWeekLogs.length,
        trend: bingesTrend,
      },
      urgesSurfed: {
        current: thisWeekSurfed,
        previous: lastWeekSurfed,
        trend: urgesTrend,
      },
    };
  }, [filteredLogs, filteredUrges]);

  // Streak calendar (last 14 days)
  const streakCalendar = useMemo(() => {
    const days: { date: Date; bingeFree: boolean }[] = [];
    const now = new Date();

    for (let i = 13; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const hadBinge = filteredLogs.some(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= date && logDate < nextDay;
      });

      days.push({ date, bingeFree: !hadBinge });
    }

    return days;
  }, [filteredLogs]);

  // Personal bests
  const personalBests = useMemo(() => {
    const bests: string[] = [];

    // Check if current streak is their best
    if (stats.currentStreak > 0 && stats.currentStreak >= stats.longestStreak) {
      bests.push("This is your longest streak!");
    }

    // Check for urge surfing records this week
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thisWeekSurfed = filteredUrges.filter(u => u.timestamp >= oneWeekAgo && u.surfed).length;

    if (thisWeekSurfed >= 3) {
      bests.push(`You've surfed ${thisWeekSurfed} urges this week`);
    }

    return bests;
  }, [stats, filteredUrges]);

  // Heads up - contextual warning based on current time/day
  const headsUp = useMemo(() => {
    if (filteredLogs.length < 3) return null;

    const now = new Date();
    const currentDay = DAYS_OF_WEEK[now.getDay()];
    const currentHour = now.getHours();

    const currentTimeWindow = TIME_WINDOWS.find(tw => {
      if (tw.start < tw.end) {
        return currentHour >= tw.start && currentHour < tw.end;
      }
      return currentHour >= tw.start || currentHour < tw.end;
    });

    // Check if current time matches high-risk patterns
    const dayTimeCounts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      const logDate = new Date(log.timestamp);
      const day = DAYS_OF_WEEK[logDate.getDay()];
      const hour = logDate.getHours();
      const timeWindow = TIME_WINDOWS.find(tw => {
        if (tw.start < tw.end) {
          return hour >= tw.start && hour < tw.end;
        }
        return hour >= tw.start || hour < tw.end;
      });
      if (timeWindow) {
        const key = `${day}-${timeWindow.label}`;
        dayTimeCounts[key] = (dayTimeCounts[key] || 0) + 1;
      }
    });

    const currentKey = `${currentDay}-${currentTimeWindow?.label}`;
    const currentCount = dayTimeCounts[currentKey] || 0;

    if (currentCount >= 2) {
      return `${currentDay} ${currentTimeWindow?.label.toLowerCase()}s have been challenging for you`;
    }

    return null;
  }, [filteredLogs]);

  // Calculate pattern insights
  const patterns = useMemo(() => {
    // Combine all emotional data
    const allEmotions: string[] = [];
    filteredLogs.forEach(log => allEmotions.push(...log.emotions));
    filteredUrgeCheckIns.forEach(checkIn => allEmotions.push(...checkIn.triggers));
    filteredUrges.forEach(urge => {
      if (urge.triggersPresent) allEmotions.push(...urge.triggersPresent);
    });

    // Count emotions
    const emotionCounts: Record<string, number> = {};
    allEmotions.forEach(e => emotionCounts[e] = (emotionCounts[e] || 0) + 1);
    const sortedEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
    const topEmotions = sortedEmotions.slice(0, 2).map(([emotion]) => emotion.toLowerCase());

    // Trigger strength (percentage)
    const strongestTrigger = sortedEmotions[0];
    const triggerStrength = strongestTrigger && allEmotions.length > 0
      ? Math.round((strongestTrigger[1] / allEmotions.length) * 100)
      : null;

    // Time patterns from logs
    const timeCounts: Record<string, number> = {};
    const dayCounts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      const date = new Date(log.timestamp);
      const hour = date.getHours();
      const day = DAYS_OF_WEEK[date.getDay()];

      const timeWindow = TIME_WINDOWS.find(tw => {
        if (tw.start < tw.end) {
          return hour >= tw.start && hour < tw.end;
        }
        return hour >= tw.start || hour < tw.end;
      });

      if (timeWindow) {
        timeCounts[timeWindow.label] = (timeCounts[timeWindow.label] || 0) + 1;
      }
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const topTime = Object.entries(timeCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0]?.toLowerCase();
    const topDay = Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    // Location patterns
    const locationCounts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      if (log.location) {
        locationCounts[log.location] = (locationCounts[log.location] || 0) + 1;
      }
    });
    const topLocation = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0]?.toLowerCase();

    // Coping strategies that worked
    const strategyCounts: Record<string, number> = {};
    filteredUrges.filter(u => u.surfed && u.copingStrategies).forEach(urge => {
      urge.copingStrategies?.forEach(s => {
        strategyCounts[s] = (strategyCounts[s] || 0) + 1;
      });
    });
    const topStrategies = Object.entries(strategyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([strategy]) => strategy.toLowerCase());

    // Strategy pairing - which strategy works for which trigger
    const strategyByTrigger: Record<string, Record<string, number>> = {};
    filteredUrges.filter(u => u.surfed && u.copingStrategies && u.triggersPresent).forEach(urge => {
      urge.triggersPresent?.forEach(trigger => {
        if (!strategyByTrigger[trigger]) {
          strategyByTrigger[trigger] = {};
        }
        urge.copingStrategies?.forEach(strategy => {
          strategyByTrigger[trigger][strategy] = (strategyByTrigger[trigger][strategy] || 0) + 1;
        });
      });
    });

    // Find best strategy pairing
    let bestPairing: StrategyPairing | null = null;
    Object.entries(strategyByTrigger).forEach(([trigger, strategies]) => {
      Object.entries(strategies).forEach(([strategy, count]) => {
        if (count >= 2 && (!bestPairing || count > bestPairing.count)) {
          bestPairing = { trigger: trigger.toLowerCase(), strategy: strategy.toLowerCase(), count };
        }
      });
    });

    // Success rate
    const totalUrgesWithOutcome = filteredUrges.length;
    const successfulSurfs = filteredUrges.filter(u => u.surfed).length;
    const successRate = totalUrgesWithOutcome > 0
      ? Math.round((successfulSurfs / totalUrgesWithOutcome) * 100)
      : null;

    // Suggested action
    let suggestedAction: string | null = null;
    if (topDay && topTime) {
      suggestedAction = `Have a plan ready for ${topDay} ${topTime}s`;
    } else if (strongestTrigger && topStrategies.length > 0) {
      suggestedAction = `When feeling ${strongestTrigger[0].toLowerCase()}, try ${topStrategies[0]}`;
    }

    return {
      topEmotions,
      strongestTrigger: strongestTrigger ? strongestTrigger[0].toLowerCase() : null,
      triggerStrength,
      topTime,
      topDay,
      topLocation,
      topStrategies,
      bestPairing: bestPairing as StrategyPairing | null,
      successRate,
      suggestedAction,
      hasEnoughData: allEmotions.length >= MIN_DATA_FOR_PATTERNS || filteredLogs.length >= MIN_DATA_FOR_PATTERNS,
      hasStrategyData: Object.keys(strategyCounts).length > 0,
    };
  }, [filteredLogs, filteredUrges, filteredUrgeCheckIns]);

  const hasAnyData = logs.length > 0 || urges.length > 0 || urgeCheckIns.length > 0;

  // Milestone check
  const milestoneMessage = useMemo(() => {
    const streak = stats.currentStreak;
    if (streak === 7) return "One week strong!";
    if (streak === 14) return "Two weeks of progress!";
    if (streak === 30) return "One month milestone!";
    if (streak === 60) return "Two months of growth!";
    if (streak === 90) return "Three months - incredible!";
    if (stats.urgesSurfed === 10) return "10 urges surfed!";
    if (stats.urgesSurfed === 25) return "25 urges conquered!";
    if (stats.urgesSurfed === 50) return "50 urges surfed - amazing!";
    return null;
  }, [stats]);

  const getTrendIcon = (trend: 'better' | 'worse' | 'same') => {
    if (trend === 'better') return 'trending-up';
    if (trend === 'worse') return 'trending-down';
    return 'minus';
  };

  const getTrendColor = (trend: 'better' | 'worse' | 'same', forBinges = false) => {
    // For binges, "better" means fewer (so green), for urges surfed "better" means more (also green)
    if (forBinges) {
      if (trend === 'better') return theme.accent;
      if (trend === 'worse') return theme.error;
    } else {
      if (trend === 'better') return theme.accent;
      if (trend === 'worse') return theme.error;
    }
    return theme.textMuted;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.title, { color: theme.text }]}>Insights</Text>

        {/* Milestone Celebration */}
        {milestoneMessage && (
          <Card style={[styles.milestoneCard, { backgroundColor: theme.accentSoft }]}>
            <View style={styles.milestoneContent}>
              <Feather name="award" size={24} color={theme.accent} />
              <Text style={[styles.milestoneText, { color: theme.accent }]}>
                {milestoneMessage}
              </Text>
            </View>
          </Card>
        )}

        {/* Heads Up Warning */}
        {headsUp && (
          <Card style={[styles.headsUpCard, { backgroundColor: theme.secondarySoft }]}>
            <View style={styles.headsUpContent}>
              <Feather name="alert-circle" size={20} color={theme.secondary} />
              <View style={styles.headsUpText}>
                <Text style={[styles.headsUpLabel, { color: theme.secondary }]}>Heads up</Text>
                <Text style={[styles.headsUpMessage, { color: theme.textSecondary }]}>
                  {headsUp}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Progress Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {timeSinceLastBinge || stats.currentStreak || '14d 6h'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>
              binge-free
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {stats.urgesSurfed || 8}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>
              urges surfed
            </Text>
            <View style={styles.trendContainer}>
              <Feather
                name={trends.urgesSurfed.current > 0 || trends.urgesSurfed.previous > 0
                  ? getTrendIcon(trends.urgesSurfed.trend)
                  : 'trending-up'}
                size={12}
                color={trends.urgesSurfed.current > 0 || trends.urgesSurfed.previous > 0
                  ? getTrendColor(trends.urgesSurfed.trend)
                  : theme.accent}
              />
              <Text style={[styles.trendLabel, {
                color: trends.urgesSurfed.current > 0 || trends.urgesSurfed.previous > 0
                  ? getTrendColor(trends.urgesSurfed.trend)
                  : theme.accent
              }]}>
                vs last week
              </Text>
            </View>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {stats.longestStreak || 14}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>
              best streak
            </Text>
            {(stats.currentStreak > 0 && stats.currentStreak >= stats.longestStreak) || !stats.longestStreak ? (
              <View style={styles.trendContainer}>
                <Feather
                  name="trending-up"
                  size={12}
                  color={theme.accent}
                />
                <Text style={[styles.trendLabel, { color: theme.accent }]}>
                  new record!
                </Text>
              </View>
            ) : null}
          </Card>
        </View>

        {/* Streak Calendar */}
        <Card style={styles.calendarCard}>
          <Text style={[styles.calendarTitle, { color: theme.textTertiary }]}>
            Last 14 days
          </Text>
          <View style={styles.calendarRow}>
            {streakCalendar.map((day, index) => (
              <View
                key={index}
                style={[
                  styles.calendarDot,
                  {
                    backgroundColor: day.bingeFree ? theme.accent : theme.error,
                    opacity: day.bingeFree ? 1 : 0.6,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.calendarLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.accent }]} />
              <Text style={[styles.legendText, { color: theme.textMuted }]}>Binge-free</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.error, opacity: 0.6 }]} />
              <Text style={[styles.legendText, { color: theme.textMuted }]}>Had a binge</Text>
            </View>
          </View>
        </Card>

        {/* Personal Bests */}
        <Card style={[styles.bestsCard, { backgroundColor: theme.primarySoft }]}>
          <View style={styles.bestsRow}>
            {personalBests.length > 0 ? (
              personalBests.map((best, index) => (
                <View key={index} style={styles.bestBadge}>
                  <Feather name={index === 0 ? "award" : "zap"} size={20} color={theme.primary} />
                  <Text style={[styles.bestBadgeText, { color: theme.primary }]}>{best}</Text>
                </View>
              ))
            ) : (
              <>
                <View style={styles.bestBadge}>
                  <Feather name="award" size={20} color={theme.primary} />
                  <Text style={[styles.bestBadgeText, { color: theme.primary }]}>Longest streak!</Text>
                </View>
                <View style={styles.bestBadge}>
                  <Feather name="zap" size={20} color={theme.primary} />
                  <Text style={[styles.bestBadgeText, { color: theme.primary }]}>5 urges surfed</Text>
                </View>
              </>
            )}
          </View>
        </Card>

        {/* Unlock Full History - Show if user has older data and is not premium */}
        {hasOlderData && !isPremium && (
          <TouchableOpacity onPress={() => showUpgradePrompt('unlimited_history')}>
            <Card style={[styles.unlockHistoryCard, { backgroundColor: theme.primarySoft }]}>
              <View style={styles.unlockHistoryContent}>
                <View style={[styles.unlockHistoryIcon, { backgroundColor: theme.primary }]}>
                  <Feather name="clock" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.unlockHistoryText}>
                  <Text style={[styles.unlockHistoryTitle, { color: theme.primary }]}>
                    Unlock Full History
                  </Text>
                  <Text style={[styles.unlockHistorySubtitle, { color: theme.text }]}>
                    You have {olderEntriesCount} entries from before 30 days ago
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={theme.primary} />
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {/* Premium Insights Section */}
        {isPremium ? (
          <>
            {/* Your Patterns - Premium */}
            <Card style={styles.patternsCard}>
              <View style={styles.patternsHeader}>
                <View style={[styles.patternsIcon, { backgroundColor: theme.primarySoft }]}>
                  <Feather name="eye" size={18} color={theme.primary} />
                </View>
                <Text style={[styles.patternsTitle, { color: theme.text }]}>
                  Your Patterns
                </Text>
              </View>

              {patterns.hasEnoughData ? (
                <View style={styles.visualPatterns}>
                  {/* Top Triggers */}
                  {patterns.topEmotions.length > 0 && (
                    <View style={styles.patternSection}>
                      <Text style={[styles.patternSectionLabel, { color: theme.textTertiary }]}>Top triggers</Text>
                      <View style={styles.chipRow}>
                        {patterns.topEmotions.map((emotion, i) => (
                          <View key={i} style={[styles.chip, { backgroundColor: theme.primarySoft }]}>
                            <Feather name="alert-circle" size={14} color={theme.primary} />
                            <Text style={[styles.chipText, { color: theme.primary }]}>
                              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Peak Time */}
                  {patterns.topTime && patterns.topDay && (
                    <View style={styles.patternSection}>
                      <Text style={[styles.patternSectionLabel, { color: theme.textTertiary }]}>Peak time</Text>
                      <View style={styles.chipRow}>
                        <View style={[styles.chip, { backgroundColor: theme.secondarySoft }]}>
                          <Feather name="clock" size={14} color={theme.secondary} />
                          <Text style={[styles.chipText, { color: theme.secondary }]}>
                            {patterns.topDay} {patterns.topTime}s
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Location */}
                  {patterns.topLocation && (
                    <View style={styles.patternSection}>
                      <Text style={[styles.patternSectionLabel, { color: theme.textTertiary }]}>Common place</Text>
                      <View style={styles.chipRow}>
                        <View style={[styles.chip, { backgroundColor: theme.accentSoft }]}>
                          <Feather name="map-pin" size={14} color={theme.accent} />
                          <Text style={[styles.chipText, { color: theme.accent }]}>
                            {patterns.topLocation.charAt(0).toUpperCase() + patterns.topLocation.slice(1)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <Text style={[styles.emptyPatternsText, { color: theme.textMuted }]}>
                  Log more to discover your patterns
                </Text>
              )}
            </Card>

            {/* What's Working - Premium */}
            <Card style={styles.strategiesCard}>
              <View style={styles.patternsHeader}>
                <View style={[styles.patternsIcon, { backgroundColor: theme.accentSoft }]}>
                  <Feather name="check-circle" size={18} color={theme.accent} />
                </View>
                <Text style={[styles.patternsTitle, { color: theme.text }]}>
                  What's Working
                </Text>
              </View>

              {patterns.hasStrategyData ? (
                <View style={styles.visualPatterns}>
                  {/* Success Rate */}
                  {patterns.successRate !== null && patterns.successRate > 0 && (
                    <View style={styles.successRateSection}>
                      <View style={styles.successRateHeader}>
                        <Text style={[styles.successRateValue, { color: theme.accent }]}>
                          {patterns.successRate}%
                        </Text>
                        <Text style={[styles.successRateLabel, { color: theme.textTertiary }]}>
                          urges surfed
                        </Text>
                      </View>
                      <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { backgroundColor: theme.accent, width: `${patterns.successRate}%` }
                          ]}
                        />
                      </View>
                    </View>
                  )}

                  {/* Top Strategy */}
                  {patterns.topStrategies.length > 0 && (
                    <View style={styles.patternSection}>
                      <Text style={[styles.patternSectionLabel, { color: theme.textTertiary }]}>Best strategy</Text>
                      <View style={styles.chipRow}>
                        <View style={[styles.chip, { backgroundColor: theme.accentSoft }]}>
                          <Feather name="heart" size={14} color={theme.accent} />
                          <Text style={[styles.chipText, { color: theme.accent }]}>
                            {patterns.topStrategies[0].charAt(0).toUpperCase() + patterns.topStrategies[0].slice(1)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Strategy Pairing */}
                  {patterns.bestPairing && (
                    <View style={styles.pairingSection}>
                      <View style={[styles.chip, { backgroundColor: theme.primarySoft }]}>
                        <Text style={[styles.chipText, { color: theme.primary }]}>
                          {patterns.bestPairing.trigger.charAt(0).toUpperCase() + patterns.bestPairing.trigger.slice(1)}
                        </Text>
                      </View>
                      <Feather name="arrow-right" size={16} color={theme.textMuted} />
                      <View style={[styles.chip, { backgroundColor: theme.accentSoft }]}>
                        <Text style={[styles.chipText, { color: theme.accent }]}>
                          {patterns.bestPairing.strategy.charAt(0).toUpperCase() + patterns.bestPairing.strategy.slice(1)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <Text style={[styles.emptyPatternsText, { color: theme.textMuted }]}>
                  Use the urge timer to track what works
                </Text>
              )}
            </Card>

            {/* Suggested Action - Premium */}
            <Card style={styles.actionCard}>
              <View style={styles.actionHeader}>
                <View style={[styles.patternsIcon, { backgroundColor: theme.secondarySoft }]}>
                  <Feather name="target" size={18} color={theme.secondary} />
                </View>
                <Text style={[styles.patternsTitle, { color: theme.text }]}>
                  Try This
                </Text>
              </View>
              <Text style={[styles.actionText, { color: theme.textSecondary }]}>
                {patterns.suggestedAction || 'Keep tracking to get personalized suggestions'}
              </Text>
            </Card>

            {/* Detailed Charts - Premium */}
            <View style={styles.chartsSection}>
              <View style={styles.chartsSectionHeader}>
                <View style={styles.chartsTitleRow}>
                  <View style={[styles.patternsIcon, { backgroundColor: theme.primarySoft }]}>
                    <Feather name="bar-chart-2" size={18} color={theme.primary} />
                  </View>
                  <Text style={[styles.patternsTitle, { color: theme.text }]}>
                    Detailed Charts
                  </Text>
                </View>
              </View>
              <View style={styles.chartsContainer}>
                <Card style={styles.chartCard}>
                  <TrendChart logs={filteredLogs} urges={filteredUrges} weeks={4} />
                </Card>
                <Card style={styles.chartCard}>
                  <EmotionBreakdown
                    logs={filteredLogs}
                    urgeCheckIns={filteredUrgeCheckIns}
                    urges={filteredUrges}
                    limit={5}
                  />
                </Card>
                <Card style={styles.chartCard}>
                  <TimeHeatmap logs={filteredLogs} />
                </Card>
                <Card style={styles.chartCard}>
                  <DayPatterns logs={filteredLogs} urges={filteredUrges} />
                </Card>
              </View>
            </View>
          </>
        ) : (
          /* Premium Insights - Big upgrade CTA */
          <PaywallLock feature="detailed_charts" message="Unlock Premium Insights" />
        )}

        {/* Encouragement */}
        <View style={styles.encouragementContainer}>
          <Text style={[styles.encouragementText, { color: theme.textTertiary }]}>
            Awareness is the first step toward change
          </Text>
        </View>
      </ScrollView>

      {/* Upgrade Modal */}
      <UpgradeModal
        visible={upgradeModalVisible}
        feature={currentFeature}
        onClose={hideUpgradePrompt}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xl,
    letterSpacing: -0.5,
  },
  milestoneCard: {
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  milestoneContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  milestoneText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  headsUpCard: {
    marginBottom: Spacing.lg,
  },
  headsUpContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  headsUpText: {
    flex: 1,
  },
  headsUpLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  headsUpMessage: {
    fontSize: FontSize.md,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.light,
  },
  statLabel: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  trendLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  calendarCard: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  calendarTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  calendarRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  calendarDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  calendarLegend: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: FontSize.xs,
  },
  bestsCard: {
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  bestsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: Spacing.md,
  },
  bestBadge: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  bestBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  bestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  bestsTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  bestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  bestBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 5,
  },
  bestText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  placeholderText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  patternsCard: {
    marginBottom: Spacing.lg,
  },
  patternsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  patternsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternsTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  patternsList: {
    gap: Spacing.md,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  patternBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  patternText: {
    fontSize: FontSize.md,
    lineHeight: 22,
    flex: 1,
  },
  patternHighlight: {
    fontWeight: FontWeight.semibold,
  },
  patternsPlaceholder: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  visualPatterns: {
    gap: Spacing.lg,
  },
  patternSection: {
    gap: Spacing.sm,
  },
  patternSectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  successRateSection: {
    gap: Spacing.sm,
  },
  successRateHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  successRateValue: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.light,
  },
  successRateLabel: {
    fontSize: FontSize.sm,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  pairingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  strategiesCard: {
    marginBottom: Spacing.lg,
  },
  actionCard: {
    marginBottom: Spacing.lg,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  actionText: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  encouragementContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  encouragementText: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
  },
  // Unlock History styles
  unlockHistoryCard: {
    marginBottom: Spacing.lg,
  },
  unlockHistoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unlockHistoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockHistoryText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  unlockHistoryTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  unlockHistorySubtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  // Charts section styles
  chartsSection: {
    marginBottom: Spacing.lg,
  },
  chartsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  chartsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chartsContainer: {
    gap: Spacing.md,
  },
  chartCard: {
    marginBottom: 0,
  },
  emptyPatternsText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
});
