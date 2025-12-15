import { PremiumFeature } from '../types';

export const FREE_HISTORY_DAYS = 30;

export interface PremiumFeatureConfig {
  id: PremiumFeature;
  name: string;
  description: string;
  icon: string;
  benefits: string[];
}

export const PREMIUM_FEATURES: Record<PremiumFeature, PremiumFeatureConfig> = {
  unlimited_history: {
    id: 'unlimited_history',
    name: 'Unlimited History',
    description: 'Access your complete journey, not just the last 30 days',
    icon: 'clock',
    benefits: [
      'See your full progress over time',
      'Track long-term patterns and trends',
      'Never lose your valuable data',
    ],
  },
  detailed_charts: {
    id: 'detailed_charts',
    name: 'Detailed Charts',
    description: 'Visual breakdowns and trend analysis',
    icon: 'bar-chart-2',
    benefits: [
      'Weekly and monthly trend charts',
      'Emotion breakdown visualization',
      'Time-of-day heatmap',
      'Day-of-week patterns',
    ],
  },
  predictive_alerts: {
    id: 'predictive_alerts',
    name: 'Predictive Alerts',
    description: 'AI-powered warnings when you need them most',
    icon: 'bell',
    benefits: [
      'Get notified during high-risk times',
      'Personalized based on your patterns',
      'Prepare before urges hit',
    ],
  },
  ai_coach: {
    id: 'ai_coach',
    name: 'AI Coach',
    description: 'In-the-moment conversational support',
    icon: 'message-circle',
    benefits: [
      'Chat when you need support',
      'Personalized coping strategies',
      'Available 24/7',
    ],
  },
  export_reports: {
    id: 'export_reports',
    name: 'Export Reports',
    description: 'Share your progress with your therapist',
    icon: 'download',
    benefits: [
      'PDF reports of your journey',
      'Share with healthcare providers',
      'Track progress over sessions',
    ],
  },
};

export const PREMIUM_PRICE = {
  monthly: '$4.99/month',
  yearly: '$29.99/year',
  lifetime: '$79.99',
};

export const ALL_PREMIUM_BENEFITS = [
  'Unlimited history access',
  'Detailed charts and visualizations',
  'AI-powered predictive alerts',
  'Priority support',
];
