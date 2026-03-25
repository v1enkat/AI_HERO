import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Task,
  CalendarEvent,
  GroceryItem,
  Expense,
  MoodEntry,
  SleepEntry,
  GeoReminder,
  FamilyEvent,
  Skill,
  Win,
  ChatTurn,
  EnergyLevel,
  InstructorTopicKey,
} from '../types/herai';

export interface HerAIPersisted {
  user: { name: string; energy: EnergyLevel; learningStyle: string };
  tasks: Task[];
  events: CalendarEvent[];
  groceries: GroceryItem[];
  expenses: Expense[];
  mealPlan: { day: string; breakfast: string; lunch: string; dinner: string }[];
  familyEvents: FamilyEvent[];
  geoReminders: GeoReminder[];
  skills: Skill[];
  wins: Win[];
  moods: MoodEntry[];
  sleepLog: SleepEntry[];
  finance: { income: number; savingsGoal: number };
  cycle: { startDate: string; length: number };
  settings: { theme: 'light' | 'dark'; apiKey: string; apiProvider: string; lang: string };
  chatHistory: ChatTurn[];
  instructorTopic: InstructorTopicKey;
  instructorWeek: number;
  schedulerOffset: number;
}

export type HerAIStore = HerAIPersisted & {
  addTask: (t: Omit<Task, 'id' | 'done' | 'created'> & Partial<Pick<Task, 'done' | 'created'>>) => void;
  toggleTask: (id: number) => void;
  removeTask: (id: number) => void;
  patchTasks: (fn: (tasks: Task[]) => Task[]) => void;
  addExpense: (e: Omit<Expense, 'id'>) => void;
  removeExpense: (id: number) => void;
  setFinance: (partial: Partial<HerAIPersisted['finance']>) => void;
  addEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  removeEvent: (id: number) => void;
  setSchedulerOffset: (n: number | ((n: number) => number)) => void;
  addGrocery: (g: Omit<GroceryItem, 'id' | 'bought'>) => void;
  toggleGrocery: (id: number) => void;
  removeGrocery: (id: number) => void;
  setMealPlan: (plan: HerAIPersisted['mealPlan']) => void;
  addFamilyEvent: (e: Omit<FamilyEvent, 'id'>) => void;
  removeFamilyEvent: (id: number) => void;
  addGeoReminder: (g: Omit<GeoReminder, 'id' | 'dismissed'>) => void;
  removeGeoReminder: (id: number) => void;
  logMood: (mood: string) => void;
  setCycle: (partial: Partial<HerAIPersisted['cycle']>) => void;
  addSleep: (hours: number, quality: string) => void;
  addWin: (text: string, date: string) => void;
  removeWin: (id: number) => void;
  setUser: (partial: Partial<HerAIPersisted['user']>) => void;
  setSettings: (partial: Partial<HerAIPersisted['settings']>) => void;
  setChatHistory: (h: ChatTurn[]) => void;
  appendChatTurn: (turn: ChatTurn) => void;
  setInstructorTopic: (t: InstructorTopicKey) => void;
  setInstructorWeek: (w: number) => void;
  resetAll: () => void;
}

const initial: HerAIPersisted = {
  user: { name: '', energy: 'high', learningStyle: 'visual' },
  tasks: [],
  events: [],
  groceries: [],
  expenses: [],
  mealPlan: [],
  familyEvents: [],
  geoReminders: [],
  skills: [],
  wins: [],
  moods: [],
  sleepLog: [],
  finance: { income: 0, savingsGoal: 0 },
  cycle: { startDate: '', length: 28 },
  settings: { theme: 'light', apiKey: '', apiProvider: 'builtin', lang: 'en' },
  chatHistory: [],
  instructorTopic: null,
  instructorWeek: 0,
  schedulerOffset: 0,
};

export const useHerAIStore = create<HerAIStore>()(
  persist(
    (set) => ({
      ...initial,
      addTask: (t) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              id: Date.now(),
              done: false,
              created: new Date().toISOString(),
              ...t,
            },
          ],
        })),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)),
        })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) })),
      patchTasks: (fn) => set((s) => ({ tasks: fn(s.tasks) })),
      addExpense: (e) => set((s) => ({ expenses: [...s.expenses, { ...e, id: Date.now() }] })),
      removeExpense: (id) => set((s) => ({ expenses: s.expenses.filter((x) => x.id !== id) })),
      setFinance: (partial) =>
        set((s) => ({ finance: { ...s.finance, ...partial } })),
      addEvent: (e) =>
        set((s) => ({ events: [...s.events, { ...e, id: Date.now() }] })),
      removeEvent: (id) => set((s) => ({ events: s.events.filter((x) => x.id !== id) })),
      setSchedulerOffset: (n) =>
        set((s) => ({
          schedulerOffset: typeof n === 'function' ? n(s.schedulerOffset) : n,
        })),
      addGrocery: (g) =>
        set((s) => ({
          groceries: [...s.groceries, { ...g, id: Date.now(), bought: false }],
        })),
      toggleGrocery: (id) =>
        set((s) => ({
          groceries: s.groceries.map((x) =>
            x.id === id ? { ...x, bought: !x.bought } : x
          ),
        })),
      removeGrocery: (id) =>
        set((s) => ({ groceries: s.groceries.filter((x) => x.id !== id) })),
      setMealPlan: (plan) => set({ mealPlan: plan }),
      addFamilyEvent: (e) =>
        set((s) => ({
          familyEvents: [...s.familyEvents, { ...e, id: Date.now() }],
        })),
      removeFamilyEvent: (id) =>
        set((s) => ({
          familyEvents: s.familyEvents.filter((x) => x.id !== id),
        })),
      addGeoReminder: (g) =>
        set((s) => ({
          geoReminders: [...s.geoReminders, { ...g, id: Date.now(), dismissed: false }],
        })),
      removeGeoReminder: (id) =>
        set((s) => ({
          geoReminders: s.geoReminders.filter((x) => x.id !== id),
        })),
      logMood: (mood) => {
        const today = new Date().toISOString().slice(0, 10);
        set((s) => {
          const moods = [...s.moods];
          const i = moods.findIndex((m) => m.date === today);
          if (i >= 0) moods[i] = { date: today, mood };
          else moods.push({ date: today, mood });
          return { moods };
        });
      },
      setCycle: (partial) =>
        set((s) => ({ cycle: { ...s.cycle, ...partial } })),
      addSleep: (hours, quality) => {
        const date = new Date().toISOString().slice(0, 10);
        set((s) => ({
          sleepLog: [...s.sleepLog, { date, hours, quality }],
        }));
      },
      addWin: (text, date) =>
        set((s) => ({
          wins: [...s.wins, { id: Date.now(), text, date }],
        })),
      removeWin: (id) =>
        set((s) => ({ wins: s.wins.filter((w) => w.id !== id) })),
      setUser: (partial) =>
        set((s) => ({ user: { ...s.user, ...partial } })),
      setSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),
      setChatHistory: (h) => set({ chatHistory: h }),
      appendChatTurn: (turn) =>
        set((s) => ({
          chatHistory: [...s.chatHistory, turn].slice(-20),
        })),
      setInstructorTopic: (t) => set({ instructorTopic: t }),
      setInstructorWeek: (w) => set({ instructorWeek: w }),
      resetAll: () => {
        localStorage.removeItem('herai_data');
        set({ ...initial });
      },
    }),
    {
      name: 'herai_data',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user,
        tasks: s.tasks,
        events: s.events,
        groceries: s.groceries,
        expenses: s.expenses,
        mealPlan: s.mealPlan,
        familyEvents: s.familyEvents,
        geoReminders: s.geoReminders,
        skills: s.skills,
        wins: s.wins,
        moods: s.moods,
        sleepLog: s.sleepLog,
        finance: s.finance,
        cycle: s.cycle,
        settings: s.settings,
        chatHistory: s.chatHistory,
        instructorTopic: s.instructorTopic,
        instructorWeek: s.instructorWeek,
        schedulerOffset: s.schedulerOffset,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<HerAIPersisted>),
      }),
    }
  )
);
