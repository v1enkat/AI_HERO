export type EnergyLevel = 'high' | 'medium' | 'low';

export interface Task {
  id: number;
  text: string;
  priority: string;
  category: string;
  scheduledTime: string | null;
  done: boolean;
  created?: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  time: string;
  date: string;
  type: string;
}

export interface GroceryItem {
  id: number;
  name: string;
  category: string;
  bought: boolean;
}

export interface Expense {
  id: number;
  amount: number;
  desc: string;
  category: string;
  date: string;
}

/** Extra earnings on top of monthly salary (freelance, gifts, etc.). */
export interface SideIncomeEntry {
  id: number;
  amount: number;
  desc: string;
  date: string;
}

export interface MoodEntry {
  date: string;
  mood: string;
}

export interface SleepEntry {
  date: string;
  hours: number;
  quality: string;
}

export interface GeoReminder {
  id: number;
  store: string;
  category: string;
  items: string[];
  favorite: boolean;
  dismissed: boolean;
}

export interface FamilyEvent {
  id: number;
  event: string;
  date: string;
  who: string;
}

export interface Skill {
  name: string;
  minutes: number;
}

export interface Win {
  id: number;
  text: string;
  date: string;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export type InstructorTopicKey = 'excel' | 'python' | 'communication' | 'design' | null;
