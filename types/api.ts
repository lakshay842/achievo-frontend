export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  timezone: string;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
};

export type NotificationPreferences = {
  notificationsEnabled: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string;
  taskReminder: boolean;
  motivation: boolean;
  milestoneCelebration: boolean;
  missedTask: boolean;
  deadlineReminder: boolean;
};

export type AuthSession = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type GoalStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export type Goal = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  status: GoalStatus;
  currentLevel?: string | null;
  desiredOutcome?: string | null;
  availableMinutesPerDay: number;
  durationDays: number;
  startDate?: string | null;
  targetDate?: string | null;
  progressPercent: number;
  activeRoadmapId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClarificationQuestion = {
  id: string;
  question: string;
  answer?: string;
};

export type Assessment = {
  id: string;
  goalId: string;
  category: string;
  currentLevel?: string | null;
  desiredOutcome?: string | null;
  availableTimeMinutes: number;
  missingInformation: string[];
  clarificationQuestions: ClarificationQuestion[];
  summary?: string | null;
  status: 'needs_clarification' | 'ready';
};

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'skipped'
  | 'missed'
  | 'superseded';

export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  goalId: string;
  roadmapId: string;
  milestoneId: string;
  day: number;
  taskDate?: string | null;
  title: string;
  durationMinutes: number;
  priority: TaskPriority;
  instructions: string[];
  completionCriteria: string[];
  status: TaskStatus;
  isActive: boolean;
  startedAt?: string | null;
  completedAt?: string | null;
  difficultyFeedback?: 'easy' | 'moderate' | 'hard' | null;
  feedbackNote?: string | null;
};

export type Milestone = {
  id: string;
  title: string;
  description?: string | null;
  sequence: number;
  status: 'pending' | 'active' | 'completed';
  tasks: Task[];
};

export type Roadmap = {
  id: string;
  goalId: string;
  version: number;
  status: 'draft' | 'approved' | 'superseded';
  title: string;
  category: string;
  durationDays: number;
  dailyMinutes: number;
  source: 'gemini' | 'mock';
  startDate?: string | null;
  endDate?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  milestones: Milestone[];
};

export type ProgressOverview = {
  completedTasks: number;
  pendingTasks: number;
  missedTasks: number;
  skippedTasks: number;
  completionPercentage: number;
  timeInvestedMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string | null;
  activeGoals: number;
  goals: Array<{
    id: string;
    title: string;
    status: GoalStatus;
    progressPercent: number;
  }>;
};

export type ProgressRange = {
  startDate: string;
  endDate: string;
  timeZone: string;
  completedTasks: number;
  scheduledTasks: number;
  completionPercentage: number;
  timeInvestedMinutes: number;
  days: Array<{
    date: string;
    completedTasks: number;
    scheduledTasks: number;
    minutes: number;
  }>;
};

export type GoalProgress = {
  goalId: string;
  title: string;
  status: GoalStatus;
  completedTasks: number;
  pendingTasks: number;
  missedTasks: number;
  completionPercentage: number;
  progressPercent: number;
  timeInvestedMinutes: number;
  milestones: Array<{
    id: string;
    title: string;
    sequence: number;
    status: string;
    completedTasks: number;
    totalTasks: number;
    progressPercent: number;
  }>;
};

export type Streaks = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string | null;
};

export type Motivation = {
  tone: 'restart' | 'milestone' | 'consistent' | 'steady';
  message: string;
};

export type CoachReply = {
  conversationId: string;
  reply: string;
};

export type CoachHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type CoachHistory = {
  conversationId: string | null;
  messages: CoachHistoryMessage[];
};

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  status: 'pending' | 'sent' | 'failed' | 'skipped';
  scheduledFor: string;
  sentAt?: string | null;
  createdAt: string;
};

export type AnalyzeGoalInput = {
  goalId?: string;
  title: string;
  description?: string;
  category?: string;
  currentLevel?: string;
  desiredOutcome?: string;
  availableMinutesPerDay: number;
  durationDays: number;
};

export type CreateGoalInput = {
  title: string;
  description?: string;
  category?: string;
  currentLevel?: string;
  desiredOutcome?: string;
  availableMinutesPerDay: number;
  durationDays: number;
  startDate?: string;
  targetDate?: string;
};
