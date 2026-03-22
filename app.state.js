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
  finance: { income: 0, savingsGoal: 0 },
  cycle: { startDate: '', length: 28 },
  settings: { theme: 'light', apiKey: '', apiProvider: 'builtin', lang: 'en' },
  breakTimer: null,
  focusTimer: null,
  schedulerOffset: 0,

  load() {
    try {
      const d = JSON.parse(localStorage.getItem('heros_data'));
      if (d) Object.assign(this, { ...this, ...d });
    } catch (e) {}
  },
  save() {
    const d = {};
    ['user','tasks','events','groceries','expenses','mealPlan','familyEvents','geoReminders','skills','wins','moods','sleepLog','finance','cycle','settings'].forEach(k => d[k] = this[k]);
    localStorage.setItem('heros_data', JSON.stringify(d));
  }
};
