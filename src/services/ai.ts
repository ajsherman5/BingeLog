import AsyncStorage from '@react-native-async-storage/async-storage';
import { BingeLog, UrgeCheckIn, UserStats } from '../types';

const AI_API_KEY_STORAGE = '@bingelog_ai_key';

// Store API key securely
export async function setAIApiKey(key: string): Promise<void> {
  await AsyncStorage.setItem(AI_API_KEY_STORAGE, key);
}

export async function getAIApiKey(): Promise<string | null> {
  return await AsyncStorage.getItem(AI_API_KEY_STORAGE);
}

export async function hasAIApiKey(): Promise<boolean> {
  const key = await getAIApiKey();
  return !!key;
}

// Call Claude API
async function callClaude(prompt: string, systemPrompt: string): Promise<string | null> {
  const apiKey = await getAIApiKey();
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.content?.[0]?.text || null;
  } catch (error) {
    console.error('AI API error:', error);
    return null;
  }
}

// AI Urge Coach - Get personalized coaching message during urge timer
export async function getUrgeCoachMessage(
  stats: UserStats,
  recentTriggers: string[],
  secondsRemaining: number
): Promise<string | null> {
  const systemPrompt = `You are a compassionate, supportive coach helping someone resist a binge eating urge.
Keep responses SHORT (1-2 sentences max). Be warm but not preachy.
Focus on the present moment and their strength. Never shame or lecture.
Speak directly to them in second person.`;

  const prompt = `The user is ${secondsRemaining} seconds into their 90-second urge timer.
Their stats: ${stats.urgesSurfed} urges resisted, ${stats.currentStreak} days binge-free.
${recentTriggers.length > 0 ? `Recent triggers: ${recentTriggers.join(', ')}` : ''}

Give them ONE short, encouraging message to help them through this moment.`;

  return callClaude(prompt, systemPrompt);
}

// Natural Language Log Parsing
export interface ParsedLog {
  emotions: string[];
  location: string;
  note: string;
  confidence: number;
}

export async function parseNaturalLanguageLog(
  input: string,
  availableEmotions: string[],
  availableLocations: string[]
): Promise<ParsedLog | null> {
  const systemPrompt = `You parse natural language descriptions of binge eating episodes into structured data.
Return ONLY valid JSON, no other text. Match emotions and locations to the available options when possible.`;

  const prompt = `Parse this into a binge log:
"${input}"

Available emotions: ${availableEmotions.join(', ')}
Available locations: ${availableLocations.join(', ')}

Return JSON format:
{"emotions": ["matched emotions or empty"], "location": "matched location or empty string", "note": "key details as a brief note", "confidence": 0.0-1.0}`;

  const response = await callClaude(prompt, systemPrompt);
  if (!response) return null;

  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

// Smart Pattern Insights
export interface PatternInsight {
  title: string;
  description: string;
  type: 'warning' | 'positive' | 'neutral';
}

export async function generatePatternInsights(
  logs: BingeLog[],
  urgeCheckIns: UrgeCheckIn[],
  stats: UserStats
): Promise<PatternInsight[]> {
  if (logs.length < 3) return [];

  const systemPrompt = `You analyze binge eating patterns to provide helpful, non-judgmental insights.
Return ONLY valid JSON array, no other text. Focus on actionable patterns.
Be supportive, not alarming. Frame insights as helpful observations.`;

  // Prepare data summary
  const logSummary = logs.slice(0, 20).map(log => ({
    day: new Date(log.timestamp).toLocaleDateString('en-US', { weekday: 'long' }),
    hour: new Date(log.timestamp).getHours(),
    emotions: log.emotions,
    location: log.location,
  }));

  const triggerCounts: Record<string, number> = {};
  urgeCheckIns.forEach(c => c.triggers.forEach(t => {
    triggerCounts[t] = (triggerCounts[t] || 0) + 1;
  }));

  const prompt = `Analyze these binge eating patterns:

Recent logs: ${JSON.stringify(logSummary)}
Trigger frequency: ${JSON.stringify(triggerCounts)}
Stats: ${stats.totalBinges} total binges, ${stats.urgesSurfed} urges resisted, ${stats.currentStreak} day streak

Find 2-3 meaningful patterns. Return JSON array:
[{"title": "short title", "description": "1-2 sentence insight", "type": "warning|positive|neutral"}]`;

  const response = await callClaude(prompt, systemPrompt);
  if (!response) return [];

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}

// Predictive Risk Analysis
export interface RiskPrediction {
  dayOfWeek: string;
  timeOfDay: string;
  riskLevel: 'low' | 'medium' | 'high';
  reason: string;
}

export async function predictHighRiskTimes(logs: BingeLog[]): Promise<RiskPrediction[]> {
  if (logs.length < 5) return [];

  const systemPrompt = `You analyze binge eating patterns to predict high-risk times.
Return ONLY valid JSON array. Be helpful, not scary.`;

  const logTimes = logs.slice(0, 30).map(log => ({
    day: new Date(log.timestamp).toLocaleDateString('en-US', { weekday: 'long' }),
    hour: new Date(log.timestamp).getHours(),
  }));

  const prompt = `Based on these binge times, predict high-risk periods:

${JSON.stringify(logTimes)}

Return JSON array of predictions (1-2 max):
[{"dayOfWeek": "Sunday", "timeOfDay": "evening", "riskLevel": "high|medium|low", "reason": "brief explanation"}]`;

  const response = await callClaude(prompt, systemPrompt);
  if (!response) return [];

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}

// Check if current time matches a high-risk period
export function isHighRiskTime(predictions: RiskPrediction[]): RiskPrediction | null {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentHour = now.getHours();

  const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';

  return predictions.find(p =>
    p.dayOfWeek.toLowerCase() === currentDay.toLowerCase() &&
    p.timeOfDay.toLowerCase() === timeOfDay.toLowerCase() &&
    (p.riskLevel === 'high' || p.riskLevel === 'medium')
  ) || null;
}
