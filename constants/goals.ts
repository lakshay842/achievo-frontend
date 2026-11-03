export const GOAL_CATEGORIES = [
  { value: 'education', label: 'Education' },
  { value: 'programming', label: 'Programming' },
  { value: 'career', label: 'Career' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'business', label: 'Business' },
  { value: 'language', label: 'Language' },
  { value: 'personal', label: 'Personal development' },
  { value: 'finance', label: 'Finance' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'custom', label: 'Custom' },
] as const;

export const INTEREST_OPTIONS = GOAL_CATEGORIES.map((item) => item);

export const DAILY_TIME_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
] as const;

export const MOTIVATION_STYLES = [
  { value: 'gentle', label: 'Gentle' },
  { value: 'direct', label: 'Direct' },
  { value: 'ambitious', label: 'Ambitious' },
] as const;

export const NOTIFICATION_TIMES = [
  { value: '07:00', label: '7:00' },
  { value: '08:00', label: '8:00' },
  { value: '09:00', label: '9:00' },
  { value: '18:00', label: '18:00' },
  { value: '20:00', label: '20:00' },
] as const;

export type GoalCategory = (typeof GOAL_CATEGORIES)[number]['value'];
