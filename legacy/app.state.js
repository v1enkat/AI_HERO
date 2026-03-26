const S = {
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
  wellnessBreakReminders: { enabled: false, dayKey: '', validBreaksCount: 0 },
  /** Same as React app — authoritative break completions for scoring (shared herai_data). */
  wellnessBreakTaskCount: { dateKey: '', count: 0 },
  breakActivities: [],
  finance: { income: 0, savingsGoal: 0 },
  cycle: { startDate: '', length: 28 },
  settings: { theme: 'light', apiKey: '', apiProvider: 'builtin', lang: 'en' },
  breakTimer: null,
  focusTimer: null,
  schedulerOffset: 0,
  chatHistory: [],
  instructorHistory: [],
  instructorTopic: null,
  instructorWeek: 0,

  load() {
    try {
      const d = JSON.parse(localStorage.getItem('herai_data'));
      if (d) Object.assign(this, { ...this, ...d });
    } catch (e) {}
  },
  save() {
    const d = {};
    ['user','tasks','events','groceries','expenses','mealPlan','familyEvents','geoReminders','skills','wins','moods','sleepLog','wellnessBreakReminders','wellnessBreakTaskCount','breakActivities','finance','cycle','settings','chatHistory','instructorTopic','instructorWeek'].forEach(k => d[k] = this[k]);
    localStorage.setItem('herai_data', JSON.stringify(d));
  }
};
