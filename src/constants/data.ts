import { Milestone, Journey } from '../types';

export const EMOTIONS = [
  'Stressed',
  'Anxious',
  'Lonely',
  'Bored',
  'Sad',
  'Angry',
  'Tired',
  'Overwhelmed',
  'Frustrated',
  'Empty',
  'Numb',
  'Restless',
];

export const LOCATIONS = [
  'Home',
  'Work',
  'Car',
  'Restaurant',
  'Friend\'s place',
  'Parents\' house',
  'Kitchen',
  'Bedroom',
  'Living room',
  'Outside',
];

export const URGE_TIMER_SECONDS = 90;

export const MIN_LOGS_FOR_INSIGHTS = 7;

export const TIME_WINDOWS = [
  { label: 'Morning', start: 5, end: 12 },
  { label: 'Afternoon', start: 12, end: 17 },
  { label: 'Evening', start: 17, end: 21 },
  { label: 'Night', start: 21, end: 5 },
];

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const GENTLE_MESSAGES = [
  'Urges peak and fall. This will pass.',
  'You are not your urges.',
  'Take a breath. You have time.',
  'This moment is temporary.',
  'You are stronger than this urge.',
  'Notice the feeling without acting on it.',
  'What do you really need right now?',
];

// Urge intensity labels for the 1-5 scale
export const URGE_INTENSITY_LABELS = [
  { value: 1, label: 'None', description: 'No urges right now', icon: 'check-circle' },
  { value: 2, label: 'Mild', description: 'Slight thoughts about food', icon: 'minus-circle' },
  { value: 3, label: 'Moderate', description: 'Noticeable urges', icon: 'alert-circle' },
  { value: 4, label: 'Strong', description: 'Hard to resist', icon: 'alert-triangle' },
  { value: 5, label: 'Overwhelming', description: 'Very difficult', icon: 'alert-octagon' },
];

// Common triggers for urge check-ins (subset of emotions + situational)
export const URGE_TRIGGERS = [
  'Stressed',
  'Anxious',
  'Lonely',
  'Bored',
  'Sad',
  'Tired',
  'Hungry',
  'After a meal',
  'Late night',
  'Work pressure',
  'Social situation',
  'Saw triggering food',
];

// Coping strategies that helped surf the urge
export const COPING_STRATEGIES = [
  'Deep breathing',
  'Waited it out',
  'Distraction',
  'Went for a walk',
  'Called someone',
  'Drank water',
  'Journaled',
  'Meditation',
  'Physical activity',
  'Listened to music',
];

// Milestone definitions
export const MILESTONES: Milestone[] = [
  // Streak milestones
  { id: 'streak_3', type: 'streak', days: 3, title: 'First Steps', description: '3 days of awareness' },
  { id: 'streak_7', type: 'streak', days: 7, title: 'One Week', description: 'A full week of mindfulness' },
  { id: 'streak_14', type: 'streak', days: 14, title: 'Two Weeks', description: 'Building momentum' },
  { id: 'streak_30', type: 'streak', days: 30, title: 'One Month', description: 'A month of growth' },
  { id: 'streak_60', type: 'streak', days: 60, title: 'Two Months', description: 'Deepening awareness' },
  { id: 'streak_90', type: 'streak', days: 90, title: 'Three Months', description: 'Remarkable progress' },
  { id: 'streak_180', type: 'streak', days: 180, title: 'Six Months', description: 'Half a year of strength' },
  { id: 'streak_365', type: 'streak', days: 365, title: 'One Year', description: 'An incredible journey' },

  // Urges surfed milestones
  { id: 'urges_1', type: 'urges_surfed', days: 1, title: 'First Surf', description: 'You rode your first urge wave' },
  { id: 'urges_5', type: 'urges_surfed', days: 5, title: 'Wave Rider', description: '5 urges surfed successfully' },
  { id: 'urges_10', type: 'urges_surfed', days: 10, title: 'Steady Sailor', description: '10 urges surfed' },
  { id: 'urges_25', type: 'urges_surfed', days: 25, title: 'Ocean Master', description: '25 urges overcome' },
  { id: 'urges_50', type: 'urges_surfed', days: 50, title: 'Surf Champion', description: '50 urges surfed' },

  // Logging milestones
  { id: 'logs_1', type: 'logs', days: 1, title: 'First Log', description: 'Started your journey' },
  { id: 'logs_7', type: 'logs', days: 7, title: 'Week of Logs', description: '7 entries recorded' },
  { id: 'logs_30', type: 'logs', days: 30, title: 'Dedicated Logger', description: '30 entries recorded' },
];

// Self-care journeys
export const JOURNEYS: Journey[] = [
  {
    id: 'understanding_triggers',
    title: 'Understanding Your Triggers',
    description: 'A 7-day exploration of what drives your urges',
    duration: 7,
    category: 'awareness',
    icon: 'compass',
    days: [
      {
        day: 1,
        title: 'What is a Trigger?',
        prompt: 'Today, simply notice when you feel the urge to binge. Don\'t judge it—just observe.',
        reflection: 'What was happening around you when the urge appeared?',
      },
      {
        day: 2,
        title: 'Emotional Triggers',
        prompt: 'Pay attention to your emotions today. Which feelings seem connected to food thoughts?',
        reflection: 'List 3 emotions you noticed before thinking about food.',
      },
      {
        day: 3,
        title: 'Situational Triggers',
        prompt: 'Notice the places, times, and situations where urges tend to arise.',
        reflection: 'Is there a pattern in where or when urges happen?',
      },
      {
        day: 4,
        title: 'Physical Triggers',
        prompt: 'Tune into your body. How do tiredness, hunger, or physical discomfort affect urges?',
        reflection: 'How did your physical state influence your relationship with food today?',
      },
      {
        day: 5,
        title: 'Social Triggers',
        prompt: 'Observe how interactions with others affect your urges.',
        reflection: 'Did any conversations or social situations trigger food thoughts?',
      },
      {
        day: 6,
        title: 'Thought Patterns',
        prompt: 'Notice the thoughts that precede urges. What stories does your mind tell?',
        reflection: 'What recurring thoughts do you notice before urges arise?',
      },
      {
        day: 7,
        title: 'Your Trigger Map',
        prompt: 'Review your week of observations. What have you learned about your triggers?',
        reflection: 'What are your top 3 triggers? How might you prepare for them?',
      },
    ],
  },
  {
    id: 'building_calm',
    title: 'Creating Calm',
    description: 'Learn to find peace in difficult moments',
    duration: 7,
    category: 'mindfulness',
    icon: 'feather',
    days: [
      {
        day: 1,
        title: 'The Pause',
        prompt: 'Practice pausing for 3 breaths before responding to any urge or stress.',
        exercise: 'Take 3 slow breaths whenever you notice tension.',
        reflection: 'How did pausing change your experience?',
      },
      {
        day: 2,
        title: 'Body Awareness',
        prompt: 'Check in with your body 3 times today. Where do you hold tension?',
        exercise: 'Scan from head to toe, noticing sensations without judgment.',
        reflection: 'What did you discover about your body today?',
      },
      {
        day: 3,
        title: 'Grounding',
        prompt: 'When stressed, use the 5-4-3-2-1 technique: 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste.',
        exercise: 'Practice grounding once today, even if you\'re not stressed.',
        reflection: 'How did grounding affect your mental state?',
      },
      {
        day: 4,
        title: 'Breath as Anchor',
        prompt: 'Use your breath as an anchor today. Return to it whenever you feel scattered.',
        exercise: 'Try box breathing: inhale 4 counts, hold 4, exhale 4, hold 4.',
        reflection: 'Did focusing on breath help you feel more centered?',
      },
      {
        day: 5,
        title: 'Finding Stillness',
        prompt: 'Take 5 minutes of complete stillness today. No phone, no distractions.',
        exercise: 'Sit quietly and simply be present.',
        reflection: 'What came up during your stillness practice?',
      },
      {
        day: 6,
        title: 'Calm in Motion',
        prompt: 'Bring mindful awareness to a routine activity—walking, showering, eating.',
        exercise: 'Choose one activity and do it with full presence.',
        reflection: 'How did mindful movement feel different from autopilot?',
      },
      {
        day: 7,
        title: 'Your Calm Toolkit',
        prompt: 'Reflect on which calming techniques resonated with you this week.',
        reflection: 'Which practices will you continue? What\'s your go-to calming strategy?',
      },
    ],
  },
  {
    id: 'self_compassion',
    title: 'Being Kind to Yourself',
    description: 'Replace self-criticism with self-compassion',
    duration: 5,
    category: 'self-compassion',
    icon: 'heart',
    days: [
      {
        day: 1,
        title: 'Noticing Self-Talk',
        prompt: 'Pay attention to how you speak to yourself today, especially after urges or slips.',
        reflection: 'What tone do you use with yourself? Would you speak that way to a friend?',
      },
      {
        day: 2,
        title: 'Common Humanity',
        prompt: 'Remember: struggling with food is incredibly common. You are not alone or broken.',
        exercise: 'When you feel shame, remind yourself: "Many people feel this way."',
        reflection: 'How does remembering others share this struggle affect you?',
      },
      {
        day: 3,
        title: 'The Friend Perspective',
        prompt: 'When you catch yourself being self-critical, ask: "What would I say to a dear friend?"',
        exercise: 'Write yourself a brief letter as if writing to a struggling friend.',
        reflection: 'Was it easier to be kind from the friend perspective?',
      },
      {
        day: 4,
        title: 'Allowing Imperfection',
        prompt: 'Today, practice allowing yourself to be imperfect without harsh judgment.',
        exercise: 'Notice one "mistake" and respond with "It\'s okay, I\'m learning."',
        reflection: 'How did allowing imperfection feel?',
      },
      {
        day: 5,
        title: 'Self-Compassion Affirmation',
        prompt: 'Create a personal self-compassion phrase to use when struggling.',
        exercise: 'Try: "May I be kind to myself in this moment."',
        reflection: 'What self-compassion phrase resonates with you?',
      },
    ],
  },
  {
    id: 'stress_without_food',
    title: 'Stress Without Food',
    description: 'Develop alternative coping strategies',
    duration: 7,
    category: 'coping',
    icon: 'shield',
    days: [
      {
        day: 1,
        title: 'Identify the Need',
        prompt: 'When you want to eat emotionally, ask: "What do I really need right now?"',
        reflection: 'What needs came up today? (comfort, distraction, soothing, etc.)',
      },
      {
        day: 2,
        title: 'Movement',
        prompt: 'When stressed, try movement first—a walk, stretching, or dancing.',
        exercise: 'Take a 5-minute movement break when you feel tense.',
        reflection: 'How did movement affect your stress levels?',
      },
      {
        day: 3,
        title: 'Connection',
        prompt: 'Reach out to someone today instead of turning to food for comfort.',
        exercise: 'Text or call a friend, even just to say hello.',
        reflection: 'How did human connection feel compared to food comfort?',
      },
      {
        day: 4,
        title: 'Creative Expression',
        prompt: 'Channel stress into something creative—writing, drawing, music, crafting.',
        exercise: 'Spend 10 minutes on a creative activity.',
        reflection: 'Did creating help release some emotional pressure?',
      },
      {
        day: 5,
        title: 'Comfort Without Food',
        prompt: 'Make a list of non-food comforts: a warm bath, soft blanket, favorite show.',
        exercise: 'Use one comfort from your list today.',
        reflection: 'What non-food comfort worked well for you?',
      },
      {
        day: 6,
        title: 'Sitting With Discomfort',
        prompt: 'Practice tolerating uncomfortable emotions without numbing them.',
        exercise: 'When stressed, set a timer for 5 minutes and just feel.',
        reflection: 'What happened when you didn\'t try to escape the feeling?',
      },
      {
        day: 7,
        title: 'Your Coping Toolkit',
        prompt: 'Build your personal toolkit of stress-relieving alternatives.',
        reflection: 'List 5 go-to strategies you can use instead of food.',
      },
    ],
  },
];

// Notification messages (gentle and compassionate)
export const NOTIFICATION_MESSAGES = {
  eveningCheckIn: [
    'How are you feeling tonight?',
    'Taking a moment for your evening reflection?',
    'Ready for a gentle check-in?',
    'Your evening moment of awareness awaits.',
  ],
  morningGreeting: [
    'A new day of awareness begins.',
    'Good morning. How are you feeling today?',
    'Starting fresh. You\'ve got this.',
    'Another day to practice kindness toward yourself.',
  ],
  streakCelebration: [
    'Your awareness is growing stronger.',
    'Look at you go! Another day of progress.',
    'Your journey continues beautifully.',
  ],
  gentleReminder: [
    'The urge timer is here if you need it.',
    'Remember: urges pass. You don\'t have to act.',
    'Breathing through the hard moments.',
  ],
};

// Affirmations for milestone cards
export const MILESTONE_AFFIRMATIONS = [
  'Every day of awareness matters.',
  'Progress, not perfection.',
  'You are building something beautiful.',
  'Small steps lead to big changes.',
  'Your journey is uniquely yours.',
  'Awareness is the first step to freedom.',
  'Be proud of how far you\'ve come.',
  'Growth happens one day at a time.',
];
