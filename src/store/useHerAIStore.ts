import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Task,
  CalendarEvent,
  GroceryItem,
  Expense,
  SideIncomeEntry,
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
import { calendarDateKey } from '../utils/calendarDate';

export interface HerAIPersisted {
  user: { name: string; energy: EnergyLevel; learningStyle: string };
  tasks: Task[];
  events: CalendarEvent[];
  groceries: GroceryItem[];
  expenses: Expense[];
  sideIncomes: SideIncomeEntry[];
  mealPlan: { day: string; breakfast: string; lunch: string; dinner: string }[];
  familyEvents: FamilyEvent[];
  geoReminders: GeoReminder[];
  skills: Skill[];
  wins: Win[];
  moods: MoodEntry[];
  sleepLog: SleepEntry[];
  finance: { income: number; savingsGoal: number };
  cycle: { startDate: string; endDate?: string; length: number };
  settings: { theme: 'light' | 'dark'; apiKey: string; apiProvider: string; lang: string };
  chatHistory: ChatTurn[];
  instructorTopic: InstructorTopicKey;
  instructorWeek: number;
  schedulerOffset: number;
  /** Daily count of break tasks marked Done (resets by calendar day). Toggle only affects 45-min reminders. */
  wellnessBreakReminders: { enabled: boolean; dayKey: string; validBreaksCount: number };
  /**
   * Authoritative count for wellness scoring (Done on break tasks). Separate from `wellnessBreakReminders`
   * so persist/rehydration cannot drop updates tied to the reminder toggle object.
   */
  wellnessBreakTaskCount: { dateKey: string; count: number };
  /** User-defined ideas for what to do during break reminders. */
  breakActivities: string[];
}

export type HerAIStore = HerAIPersisted & {
  addTask: (t: Omit<Task, 'id' | 'done' | 'created'> & Partial<Pick<Task, 'done' | 'created'>>) => void;
  toggleTask: (id: number) => void;
  removeTask: (id: number) => void;
  patchTasks: (fn: (tasks: Task[]) => Task[]) => void;
  addExpense: (e: Omit<Expense, 'id'>) => void;
  removeExpense: (id: number) => void;
  addSideIncome: (e: Omit<SideIncomeEntry, 'id'>) => void;
  removeSideIncome: (id: number) => void;
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
  setWellnessBreakRemindersEnabled: (enabled: boolean) => void;
  incrementWellnessValidBreak: () => void;
  /** One atomic update: count a completed break task and remove it from the list. */
  completeBreakActivityAt: (index: number) => void;
  addBreakActivity: (text: string) => void;
  removeBreakActivity: (index: number) => void;
}

/** Avoid losing in-memory break completions when persist rehydration finishes after the user taps Done. */
function mergeWellnessBreakReminders(
  persisted: Partial<HerAIPersisted>['wellnessBreakReminders'] | undefined,
  current: HerAIPersisted['wellnessBreakReminders'],
  today: string
): HerAIPersisted['wellnessBreakReminders'] {
  if (persisted == null) return current;
  const wP = persisted;
  const wC = current;
  const pForToday = wP.dayKey === today ? Number(wP.validBreaksCount) || 0 : 0;
  const cForToday = wC.dayKey === today ? Number(wC.validBreaksCount) || 0 : 0;
  const maxToday = Math.max(pForToday, cForToday);
  if (wP.dayKey === today || wC.dayKey === today) {
    return {
      ...wP,
      ...wC,
      dayKey: today,
      validBreaksCount: maxToday,
    };
  }
  return { ...wC, ...wP };
}

/** Merge mood logs by date; in-memory `current` wins on duplicate dates (fixes persist rehydration racing mood taps). */
function mergeMoodEntries(persisted: MoodEntry[] | undefined, current: MoodEntry[]): MoodEntry[] {
  const map = new Map<string, string>();
  if (persisted) {
    for (const e of persisted) {
      map.set(e.date, e.mood);
    }
  }
  for (const e of current) {
    map.set(e.date, e.mood);
  }
  return Array.from(map.entries())
    .map(([date, mood]) => ({ date, mood }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function mergeBreakTaskCount(
  persisted: Partial<HerAIPersisted>['wellnessBreakTaskCount'] | undefined,
  current: HerAIPersisted['wellnessBreakTaskCount'],
  today: string,
  legacyReminders: Partial<HerAIPersisted>['wellnessBreakReminders'] | undefined
): HerAIPersisted['wellnessBreakTaskCount'] {
  let p = persisted;
  if (p == null && legacyReminders?.dayKey === today) {
    const n = Number(legacyReminders.validBreaksCount) || 0;
    if (n > 0) p = { dateKey: today, count: n };
  }
  if (p == null) return current;
  const wP = p;
  const wC = current;
  const pToday = wP.dateKey === today ? Number(wP.count) || 0 : 0;
  const cToday = wC.dateKey === today ? Number(wC.count) || 0 : 0;
  const maxToday = Math.max(pToday, cToday);
  if (wP.dateKey === today || wC.dateKey === today) {
    return { dateKey: today, count: maxToday };
  }
  return { ...wC, ...wP };
}

function mergePersistedState(persisted: unknown, current: HerAIStore): HerAIStore {
  const p = (persisted as Partial<HerAIPersisted> | null | undefined) ?? {};
  const today = calendarDateKey();
  const breakTaskCount = mergeBreakTaskCount(
    p.wellnessBreakTaskCount,
    current.wellnessBreakTaskCount,
    today,
    p.wellnessBreakReminders
  );
  const wrMerged = mergeWellnessBreakReminders(
    p.wellnessBreakReminders,
    current.wellnessBreakReminders,
    today
  );
  const wrSynced =
    breakTaskCount.dateKey === today
      ? {
          ...wrMerged,
          dayKey: today,
          validBreaksCount: Math.max(
            wrMerged.dayKey === today ? Number(wrMerged.validBreaksCount) || 0 : 0,
            breakTaskCount.count
          ),
        }
      : wrMerged;
  return {
    ...current,
    ...p,
    moods: mergeMoodEntries(p.moods, current.moods),
    wellnessBreakTaskCount: breakTaskCount,
    wellnessBreakReminders: wrSynced,
  };
}

const initial: HerAIPersisted = {
  user: { name: '', energy: 'high', learningStyle: 'visual' },
  tasks: [],
  events: [],
  groceries: [],
  expenses: [],
  sideIncomes: [],
  mealPlan: [],
  familyEvents: [],
  geoReminders: [],
  skills: [],
  wins: [],
  moods: [],
  sleepLog: [],
  finance: { income: 0, savingsGoal: 0 },
  cycle: { startDate: '', endDate: '', length: 28 },
  settings: { theme: 'light', apiKey: '', apiProvider: 'builtin', lang: 'en' },
  chatHistory: [],
  instructorTopic: null,
  instructorWeek: 0,
  schedulerOffset: 0,
  wellnessBreakReminders: { enabled: false, dayKey: '', validBreaksCount: 0 },
  wellnessBreakTaskCount: { dateKey: '', count: 0 },
  breakActivities: [],
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
      addSideIncome: (e) =>
        set((s) => ({
          sideIncomes: [...(s.sideIncomes ?? []), { ...e, id: Date.now() }],
        })),
      removeSideIncome: (id) =>
        set((s) => ({ sideIncomes: (s.sideIncomes ?? []).filter((x) => x.id !== id) })),
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
        const today = calendarDateKey();
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
        const date = calendarDateKey();
        const h = Number(hours);
        if (!Number.isFinite(h) || h <= 0) return;
        set((s) => ({
          sleepLog: [...s.sleepLog.filter((e) => e.date !== date), { date, hours: h, quality }],
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
      setWellnessBreakRemindersEnabled: (enabled) =>
        set((s) => ({
          wellnessBreakReminders: { ...s.wellnessBreakReminders, enabled },
        })),
      incrementWellnessValidBreak: () =>
        set((s) => {
          const today = calendarDateKey();
          const w = s.wellnessBreakReminders;
          const btc = s.wellnessBreakTaskCount ?? { dateKey: '', count: 0 };
          const fromBr = w.dayKey === today ? Number(w.validBreaksCount) || 0 : 0;
          const fromBtc = btc.dateKey === today ? Number(btc.count) || 0 : 0;
          const next = Math.max(fromBr, fromBtc) + 1;
          return {
            wellnessBreakReminders: {
              ...w,
              dayKey: today,
              validBreaksCount: next,
            },
            wellnessBreakTaskCount: { dateKey: today, count: next },
          };
        }),
      addBreakActivity: (text) => {
        const t = text.trim().slice(0, 200);
        if (!t) return;
        set((s) => ({
          breakActivities: [...s.breakActivities, t].slice(0, 40),
        }));
      },
      removeBreakActivity: (index) =>
        set((s) => ({
          breakActivities: s.breakActivities.filter((_, i) => i !== index),
        })),
      completeBreakActivityAt: (index) =>
        set((s) => {
          if (index < 0 || index >= s.breakActivities.length) return {};
          const today = calendarDateKey();
          const w = s.wellnessBreakReminders;
          const btc = s.wellnessBreakTaskCount ?? { dateKey: '', count: 0 };
          const fromBr = w.dayKey === today ? Number(w.validBreaksCount) || 0 : 0;
          const fromBtc = btc.dateKey === today ? Number(btc.count) || 0 : 0;
          const next = Math.max(fromBr, fromBtc) + 1;
          return {
            wellnessBreakTaskCount: { dateKey: today, count: next },
            wellnessBreakReminders: {
              ...w,
              dayKey: today,
              validBreaksCount: next,
            },
            breakActivities: s.breakActivities.filter((_, i) => i !== index),
          };
        }),
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
        sideIncomes: s.sideIncomes,
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
        wellnessBreakReminders: s.wellnessBreakReminders,
        wellnessBreakTaskCount: s.wellnessBreakTaskCount,
        breakActivities: s.breakActivities,
      }),
      merge: (persisted, current) => mergePersistedState(persisted, current as HerAIStore),
    }
  )
);
