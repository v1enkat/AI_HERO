/* ================================================================
   AI HER-OS — Full Application Logic
   ================================================================ */

// ==================== STATE ====================
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

// ==================== ROUTER ====================
const Router = {
  go(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const el = document.getElementById('page-' + page);
    if (el) el.classList.add('active');
    const nav = document.querySelector(`[data-page="${page}"]`);
    if (nav) nav.classList.add('active');
    this.refresh(page);
  },
  refresh(page) {
    if (page === 'dashboard') Dashboard.render();
    if (page === 'productivity') Productivity.render();
    if (page === 'scheduler') Scheduler.render();
    if (page === 'learning') Learning.render();
    if (page === 'home') Home.render();
    if (page === 'finance') Finance.render();
    if (page === 'wellness') Wellness.render();
    if (page === 'branding') Branding.render();
  }
};

// ==================== MODAL ====================
const Modal = {
  open(title, html) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modal').classList.add('open');
    document.getElementById('modalOverlay').classList.add('open');
  },
  close() {
    document.getElementById('modal').classList.remove('open');
    document.getElementById('modalOverlay').classList.remove('open');
  }
};

// ==================== TOAST ====================
function toast(msg, type = 'info') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.innerHTML = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

// ==================== AI ENGINE ====================
const AI = {
  getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  },

  getEnergyTip(level) {
    const tips = {
      high: [
        'High energy detected — perfect for deep work!',
        'You\'re at peak energy. Tackle your hardest task now.',
        'Energy is high — start that creative project!',
        'Great energy! Focus on tasks that need maximum brainpower.'
      ],
      medium: [
        'Medium energy — good for meetings and collaborative work.',
        'Steady energy. Handle routine tasks and emails now.',
        'Moderate energy — mix easy and medium tasks.',
        'Good time for learning or skill practice.'
      ],
      low: [
        'Energy is low. Stick to simple tasks and take breaks.',
        'Low energy detected. Consider a short walk or snack.',
        'Rest if you can. Only handle urgent items.',
        'Low energy — perfect time for planning, not executing.'
      ]
    };
    const arr = tips[level] || tips.medium;
    return arr[Math.floor(Math.random() * arr.length)];
  },

  getDashInsight() {
    const insights = [];
    const h = new Date().getHours();
    const pending = S.tasks.filter(t => !t.done).length;
    const today = new Date().toISOString().slice(0, 10);
    const todayMood = S.moods.find(m => m.date === today);

    if (h < 12 && S.user.energy === 'high') insights.push('Your energy peaks in the morning. Schedule your hardest task before lunch.');
    if (pending > 5) insights.push(`You have ${pending} pending tasks. Consider converting some into smaller microtasks.`);
    if (pending === 0 && S.tasks.length > 0) insights.push('All tasks complete! Great job. Consider learning something new today.');
    if (todayMood && todayMood.mood === 'stressed') insights.push('You reported feeling stressed. I\'ve adjusted suggestions to include more breaks.');
    if (S.expenses.length > 3) {
      const total = S.expenses.reduce((s, e) => s + e.amount, 0);
      if (S.finance.income > 0 && total > S.finance.income * 0.7) insights.push('⚠️ You\'ve spent over 70% of your income. Consider reviewing expenses.');
    }

    const phase = this.getCyclePhase();
    if (phase.phase === 'menstrual') insights.push('You\'re in your menstrual phase. Schedule lighter tasks and prioritize rest.');
    if (phase.phase === 'ovulation') insights.push('Ovulation phase — your communication skills peak now. Great time for presentations!');

    if (insights.length === 0) insights.push('Add tasks, log expenses, and track your mood to get personalized AI insights!');
    return insights[Math.floor(Math.random() * insights.length)];
  },

  getSuggestions() {
    const suggestions = [];
    const h = new Date().getHours();
    const pending = S.tasks.filter(t => !t.done);

    if (S.user.energy === 'high' && pending.some(t => t.priority === 'high')) {
      suggestions.push({ icon: '🔥', text: 'Energy is high — tackle "' + pending.find(t => t.priority === 'high').text + '" now' });
    }
    if (h >= 14 && h <= 16) suggestions.push({ icon: '☕', text: 'Afternoon slump zone. Take a 5-minute break.' });
    if (S.groceries.filter(g => !g.bought).length > 0) suggestions.push({ icon: '🛒', text: S.groceries.filter(g => !g.bought).length + ' items on your grocery list. Shop on your way home?' });
    if (S.skills.length > 0) suggestions.push({ icon: '📚', text: 'Time for a 10-min learning capsule? Keep your streak alive!' });
    if (h >= 20) suggestions.push({ icon: '🌙', text: 'Evening wind-down. Review tomorrow\'s plan and prepare for rest.' });
    if (pending.length > 3) suggestions.push({ icon: '✂️', text: 'Too many tasks? Let AI break them into smaller microtasks.' });

    if (suggestions.length === 0) suggestions.push({ icon: '💡', text: 'Start adding tasks and data — AI will learn your patterns!' });
    return suggestions;
  },

  getCyclePhase() {
    if (!S.cycle.startDate) return { phase: 'unknown', day: 0, text: 'Set your cycle dates' };
    const start = new Date(S.cycle.startDate);
    const today = new Date();
    const diff = Math.floor((today - start) / 86400000);
    const day = ((diff % S.cycle.length) + S.cycle.length) % S.cycle.length + 1;
    const len = S.cycle.length;

    let phase, text, recs;
    if (day <= 5) {
      phase = 'menstrual'; text = '🌑 Menstrual Phase';
      recs = 'Rest & reflect. Schedule lighter tasks. Practice gentle self-care. Avoid high-pressure meetings if possible.';
    } else if (day <= Math.floor(len * 0.5)) {
      phase = 'follicular'; text = '🌒 Follicular Phase';
      recs = 'Rising energy! Great time to plan, brainstorm, and start new projects. Your creativity peaks now.';
    } else if (day <= Math.floor(len * 0.57)) {
      phase = 'ovulation'; text = '🌕 Ovulation Phase';
      recs = 'Peak energy & communication! Schedule presentations, networking, and leadership tasks. You\'re magnetic right now.';
    } else {
      phase = 'luteal'; text = '🌘 Luteal Phase';
      recs = 'Time to organize & complete. Focus on finishing tasks, deep work, and preparation. Expect energy to gradually decrease.';
    }
    return { phase, day, text, recs };
  },

  autoScheduleTasks() {
    const pending = S.tasks.filter(t => !t.done && !t.scheduledTime);
    if (pending.length === 0) return 'No unscheduled tasks to plan.';

    const hours = [9, 10, 11, 14, 15, 16];
    const highFirst = pending.sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return (p[a.priority] || 1) - (p[b.priority] || 1);
    });

    highFirst.forEach((t, i) => {
      if (i < hours.length) {
        t.scheduledTime = hours[i] + ':00';
      }
    });
    S.save();
    return `Scheduled ${Math.min(pending.length, hours.length)} tasks. High-priority tasks placed in morning peak hours.`;
  },

  workloadLevel() {
    const today = new Date().toISOString().slice(0, 10);
    const todayEvents = S.events.filter(e => e.date === today && e.type === 'work');
    if (todayEvents.length >= 4) return { level: 'Heavy', pct: 85, note: 'Heavy workday — personal tasks shifted to evening/tomorrow', color: '#E8526F' };
    if (todayEvents.length >= 2) return { level: 'Moderate', pct: 50, note: 'Balanced day — personal tasks can stay', color: '#D4A853' };
    return { level: 'Light', pct: 20, note: 'Light day — great time for errands, learning, and hobbies!', color: '#7ECEC1' };
  },

  generateMealPlan() {
    const meals = [
      { day: 'Monday', breakfast: '🥣 Oatmeal with fruits & nuts', lunch: '🍛 Dal rice with salad', dinner: '🥗 Chapati with paneer sabzi' },
      { day: 'Tuesday', breakfast: '🥞 Moong dal cheela', lunch: '🍝 Rajma rice', dinner: '🥘 Vegetable soup with bread' },
      { day: 'Wednesday', breakfast: '🍳 Poha with peanuts', lunch: '🍱 Curd rice with pickle', dinner: '🌮 Roti with mixed veg' },
      { day: 'Thursday', breakfast: '🥛 Smoothie bowl', lunch: '🍛 Chicken/Paneer curry with rice', dinner: '🥗 Light khichdi' },
      { day: 'Friday', breakfast: '🧇 Idli sambar', lunch: '🍱 Biryani with raita', dinner: '🥘 Palak roti' },
      { day: 'Saturday', breakfast: '🥐 Paratha with curd', lunch: '🍝 Pasta with vegetables', dinner: '🍕 Homemade pizza' },
      { day: 'Sunday', breakfast: '🍳 Eggs with toast', lunch: '🍛 Special meal (your choice!)', dinner: '🥗 Light soup & salad' }
    ];
    return meals;
  },

  rewriteEmail(text, tone) {
    if (!text.trim()) return 'Please enter an email draft first.';
    const words = text.split(' ');
    const len = words.length;

    const intros = {
      confident: 'I wanted to share my perspective on this.',
      assertive: 'I need to address this directly.',
      diplomatic: 'I appreciate the discussion, and I\'d like to offer my thoughts.',
      'friendly': 'Thanks for bringing this up! Here\'s where I stand.'
    };

    const closings = {
      confident: 'I\'m confident this approach will deliver the results we need. Let\'s move forward.',
      assertive: 'This is the direction I recommend. I\'m available to discuss if needed, but I believe this is the right path.',
      diplomatic: 'I believe this balanced approach serves everyone\'s interests. I welcome your thoughts.',
      'friendly': 'Would love to hear your take on this! Let\'s chat more if needed. 😊'
    };

    let rewritten = intros[tone] + '\n\n';

    const sentences = text.replace(/([.!?])\s+/g, '$1|').split('|').filter(s => s.trim());
    sentences.forEach(s => {
      let improved = s.trim()
        .replace(/i think/gi, 'I believe')
        .replace(/maybe we could/gi, 'I recommend we')
        .replace(/sorry but/gi, 'To be direct,')
        .replace(/i was wondering/gi, 'I\'d like to')
        .replace(/just wanted to/gi, 'I\'m writing to')
        .replace(/i feel like/gi, 'Based on my analysis,')
        .replace(/does that make sense/gi, 'Let me know if you have questions')
        .replace(/no worries/gi, 'Understood')
        .replace(/i hope this is okay/gi, 'I\'m confident in this direction');
      rewritten += improved + ' ';
    });

    rewritten += '\n\n' + closings[tone];
    return rewritten;
  },

  generatePitch(role, achievement) {
    if (!role) return 'Please enter your role.';
    return `Hi, I'm a ${role} who specializes in turning challenges into results. ${achievement ? 'Most recently, I ' + achievement + '.' : ''} I combine strategic thinking with hands-on execution to drive meaningful impact. I\'m passionate about creating value and would love to explore how I can contribute to your team's success.`;
  },

  negotiationScript(current, desired, reason) {
    if (!current || !desired) return 'Please fill in your salary details.';
    return `"Thank you for this opportunity to discuss my compensation. Over the past period, I've consistently delivered strong results${reason ? ' — specifically, ' + reason : ''}.\n\nBased on my contributions, market research, and the value I bring to the team, I'd like to discuss adjusting my compensation from ${current} to ${desired}.\n\nI'm committed to this role and want to ensure my compensation reflects the impact I'm making. I'm open to discussing this further and finding an arrangement that works for both of us.\n\nWhat are your thoughts?"`;
  },

  linkedinHeadlines(role, skills) {
    if (!role) return 'Enter your role first.';
    const sk = skills ? skills.split(',').map(s => s.trim()) : [];
    return [
      `${role} | ${sk.join(' • ')} | Driving results through innovation`,
      `Passionate ${role} helping teams achieve more with ${sk[0] || 'expertise'} & ${sk[1] || 'leadership'}`,
      `${role} → ${sk.join(' + ')} | Building the future, one project at a time`
    ].join('\n\n');
  },

  socialPost(topic, platform) {
    if (!topic) return 'Enter a topic first.';
    if (platform === 'linkedin') {
      return `🚀 Excited to share: ${topic}\n\nThis has been a journey of growth, learning, and pushing boundaries. Here are 3 key takeaways:\n\n1️⃣ Every challenge is a learning opportunity\n2️⃣ Consistency beats perfection\n3️⃣ Your network is your net worth\n\nWhat's your experience with this? Drop your thoughts below! 👇\n\n#Growth #Leadership #WomenInTech #CareerDevelopment`;
    }
    if (platform === 'twitter') {
      return `${topic} 🧵\n\nA thread on what I learned:\n\n1/ The biggest lesson: start before you're ready.\n2/ Consistency > intensity. Always.\n3/ Surround yourself with people who push you forward.\n\nWhat would you add? 💭`;
    }
    return `✨ ${topic}\n\nSometimes the best stories come from unexpected places. This experience taught me that growth happens outside your comfort zone.\n\nDouble-tap if you agree! 💜\n\n#Motivation #WomenWhoLead #GrowthMindset`;
  },

  leadershipLessons: [
    { topic: 'Building Executive Presence', content: 'Start meetings by stating your position first, then supporting data. This positions you as a decision-maker, not just a reporter.', action: '✅ Practice: In your next meeting, lead with your recommendation.' },
    { topic: 'The Power of Strategic Silence', content: 'After making a point, pause. Don\'t fill silence with qualifiers. Let your message land.', action: '✅ Practice: In your next conversation, make your point and count to 3 before speaking again.' },
    { topic: 'Owning Your Achievements', content: 'Replace "we got lucky" with "I strategically planned for this outcome." Own your wins without apology.', action: '✅ Practice: Write down 3 achievements this week using "I" statements.' },
    { topic: 'Decisive Communication', content: 'Replace "I think maybe we should..." with "I recommend we..." Confident language creates confident perception.', action: '✅ Practice: Rewrite your last 3 emails using decisive language.' },
    { topic: 'Setting Boundaries with Grace', content: 'Saying "I can\'t take this on right now, but here\'s when I can" is more powerful than an automatic yes.', action: '✅ Practice: Identify one thing you can say no to this week.' },
    { topic: 'The 2-Minute Confidence Ritual', content: 'Before any important meeting: stand tall for 2 minutes, take 3 deep breaths, and visualize success. Your body language shapes your mindset.', action: '✅ Practice: Do this before your next presentation or call.' }
  ],

  chat(msg) {
    const lower = msg.toLowerCase();

    if (lower.includes('task') || lower.includes('todo') || lower.includes('productivity')) {
      const pending = S.tasks.filter(t => !t.done);
      if (pending.length === 0) return 'You have no pending tasks! 🎉 Want to add some? Go to the Productivity section.';
      return `You have ${pending.length} pending tasks:\n\n${pending.map(t => `• ${t.text} (${t.priority} priority)`).join('\n')}\n\n💡 Tip: ${this.getEnergyTip(S.user.energy)}`;
    }

    if (lower.includes('schedule') || lower.includes('plan') || lower.includes('calendar')) {
      const wl = this.workloadLevel();
      return `Today's workload: ${wl.level}\n${wl.note}\n\nYou have ${S.events.length} events scheduled. Want me to auto-plan your day? Go to Smart Scheduler and click "AI Auto-Plan"!`;
    }

    if (lower.includes('budget') || lower.includes('money') || lower.includes('spend') || lower.includes('finance') || lower.includes('expense')) {
      const total = S.expenses.reduce((s, e) => s + e.amount, 0);
      const remaining = S.finance.income - total;
      if (S.finance.income === 0) return 'You haven\'t set your monthly income yet. Go to Finance → Set Income to get started with budgeting!';
      return `💰 Financial Summary:\n• Monthly Income: ₹${S.finance.income.toLocaleString()}\n• Spent: ₹${total.toLocaleString()}\n• Remaining: ₹${remaining.toLocaleString()}\n\n${total > S.finance.income * 0.8 ? '⚠️ You\'re spending over 80% of income. Review your expenses!' : '✅ Your spending is within budget. Keep it up!'}`;
    }

    if (lower.includes('mood') || lower.includes('feel') || lower.includes('stress') || lower.includes('wellness')) {
      const recent = S.moods.slice(-7);
      if (recent.length === 0) return 'You haven\'t logged any moods yet. Go to Wellness and tell me how you\'re feeling! It helps me give better advice.';
      const stressCount = recent.filter(m => m.mood === 'stressed' || m.mood === 'low').length;
      if (stressCount >= 3) return `I notice you\'ve been feeling low/stressed ${stressCount} out of the last ${recent.length} days. 💜\n\nHere are some suggestions:\n• Take more breaks between tasks\n• Try a 5-minute breathing exercise\n• Consider lighter workload today\n• Talk to someone you trust\n\nYour well-being matters most.`;
      return `Your recent mood trend looks ${stressCount === 0 ? 'great' : 'mostly positive'}! Keep logging daily for better insights. ${this.getCyclePhase().recs || ''}`;
    }

    if (lower.includes('cycle') || lower.includes('period')) {
      const phase = this.getCyclePhase();
      if (phase.phase === 'unknown') return 'Set your cycle dates in the Wellness section to get cycle-aware recommendations!';
      return `You\'re currently in: ${phase.text} (Day ${phase.day})\n\n${phase.recs}`;
    }

    if (lower.includes('grocery') || lower.includes('shopping') || lower.includes('buy')) {
      const pending = S.groceries.filter(g => !g.bought);
      if (pending.length === 0) return 'Your grocery list is empty! Add items in the Home section.';
      return `🛒 Shopping list (${pending.length} items):\n${pending.map(g => `• ${g.name} (${g.category})`).join('\n')}\n\n📍 Smart Geo-Reminders will notify you when you\'re near a matching store!`;
    }

    if (lower.includes('learn') || lower.includes('skill') || lower.includes('study') || lower.includes('teach')) {
      return `🎓 I'm your AI Instructor!\n\nYour learning style: ${S.user.learningStyle}\n\nI can teach you anything — just tell me what skill you want to learn in the Learning section. I'll create:\n• Personalized micro-lessons\n• Practice tasks\n• Real-world applications\n\nCurrently tracking ${S.skills.length} skills.`;
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return `${this.getGreeting()}! 👋 I'm your HER-OS AI.\n\nI can help with:\n• 📋 Tasks & productivity\n• 📅 Scheduling & planning\n• 💰 Finance & budgeting\n• 🎓 Learning & skills\n• 🏠 Home management\n• 💜 Wellness & mood\n• 👑 Leadership & communication\n• ✨ Personal branding\n\nJust ask me anything!`;
    }

    if (lower.includes('motivat') || lower.includes('inspir') || lower.includes('encourage')) {
      const quotes = [
        '"She believed she could, so she did." — R.S. Grey',
        '"The question isn\'t who\'s going to let me; it\'s who\'s going to stop me." — Ayn Rand',
        '"You are more powerful than you know; you are beautiful just as you are." — Melissa Etheridge',
        '"A woman with a voice is, by definition, a strong woman." — Melinda Gates',
        '"Success isn\'t about how much money you make; it\'s about the difference you make in people\'s lives." — Michelle Obama'
      ];
      return `💜 Here's something for you:\n\n${quotes[Math.floor(Math.random() * quotes.length)]}\n\nYou\'re doing amazing. Keep going! ✨`;
    }

    if (lower.includes('help') || lower.includes('what can you do')) {
      return `I'm HER-OS, your Life Operating System AI! Here's what I can help with:\n\n⚡ Productivity: "How are my tasks?" / "Auto-schedule my day"\n📅 Planning: "What\'s my schedule?" / "Plan my week"\n💰 Finance: "How\'s my budget?" / "Spending advice"\n🎓 Learning: "Teach me something" / "Learning progress"\n🏠 Home: "Grocery list" / "Meal plan"\n💜 Wellness: "How am I feeling?" / "Cycle phase"\n👑 Leadership: "Help me with emails"\n✨ Branding: "Help with LinkedIn"\n\nJust type naturally — I understand context! 🧠`;
    }

    return `I understand you're asking about "${msg}". Here are some things I can help with:\n\n• Type "tasks" to review your to-do list\n• Type "budget" for financial insights\n• Type "mood" for wellness check\n• Type "schedule" for your daily plan\n• Type "cycle" for cycle-phase recommendations\n\nI'm always learning to serve you better! 💜`;
  },

  instructorChat(msg, style) {
    const lower = msg.toLowerCase();
    const styleHints = {
      visual: 'I\'ll use diagrams, examples, and visual step-by-step guides since you learn best visually.',
      reading: 'I\'ll provide detailed written explanations with clear structure since you prefer reading/writing.',
      practical: 'I\'ll give you hands-on exercises and real-world tasks since you learn by doing.',
      auditory: 'I\'ll explain concepts conversationally, as if we\'re having a discussion.'
    };

    if (lower.includes('excel') || lower.includes('spreadsheet')) {
      return `Great choice! Let me create a personalized Excel learning path for you.\n\n${styleHints[style]}\n\n📚 Your Excel Learning Path:\n\n1️⃣ Week 1: Formulas (SUM, AVERAGE, IF)\n2️⃣ Week 2: VLOOKUP & HLOOKUP\n3️⃣ Week 3: Pivot Tables\n4️⃣ Week 4: Charts & Data Visualization\n\n📝 Practice Task:\nCreate a simple budget tracker using SUM and IF formulas. Track your expenses for 3 days.\n\n💡 Real-life application: Automate your monthly expense report at work!`;
    }

    if (lower.includes('python') || lower.includes('coding') || lower.includes('programming')) {
      return `Excellent! Python is a great skill to have.\n\n${styleHints[style]}\n\n📚 Your Python Learning Path:\n\n1️⃣ Week 1: Variables, strings, and basic operations\n2️⃣ Week 2: Lists, loops, and conditions\n3️⃣ Week 3: Functions and file handling\n4️⃣ Week 4: Mini-project — build a personal expense tracker!\n\n📝 Practice Task:\nWrite a program that asks for your name and prints a personalized greeting with today's date.\n\n💡 Real-life application: Automate repetitive tasks at work!`;
    }

    if (lower.includes('communication') || lower.includes('speak') || lower.includes('presentation')) {
      return `Communication skills are incredibly valuable!\n\n${styleHints[style]}\n\n📚 Your Communication Path:\n\n1️⃣ Week 1: Active listening techniques\n2️⃣ Week 2: Structuring your message (PREP method)\n3️⃣ Week 3: Body language & confidence\n4️⃣ Week 4: Handling difficult conversations\n\n📝 Practice Task:\nRecord yourself explaining your job in 60 seconds. Watch it back and note areas to improve.\n\n💡 Real-life application: Ace your next team presentation!`;
    }

    if (lower.includes('design') || lower.includes('ui') || lower.includes('graphic')) {
      return `Design thinking is a superpower!\n\n${styleHints[style]}\n\n📚 Your Design Path:\n\n1️⃣ Week 1: Color theory & typography basics\n2️⃣ Week 2: Layout principles & composition\n3️⃣ Week 3: Tools (Canva/Figma basics)\n4️⃣ Week 4: Create your personal brand kit\n\n📝 Practice Task:\nDesign a simple social media post for your LinkedIn using Canva. Use only 2 fonts and 3 colors.\n\n💡 Real-life application: Create professional presentations at work!`;
    }

    return `I'd love to teach you about "${msg}"!\n\n${styleHints[style]}\n\nTo get started, I'll create a 4-week micro-course for you:\n\n1️⃣ Week 1: Fundamentals & core concepts\n2️⃣ Week 2: Building blocks & practice\n3️⃣ Week 3: Advanced techniques\n4️⃣ Week 4: Real-world project\n\n📝 First Practice Task:\nResearch 3 real-world examples of "${msg}" being used successfully. Write a 1-paragraph summary of each.\n\n💡 Real-life application: Apply this skill in your daily work within 2 weeks!\n\nShall I go deeper into Week 1?`;
  }
};

// ==================== DASHBOARD ====================
const Dashboard = {
  render() {
    document.getElementById('greeting').textContent = AI.getGreeting();
    document.getElementById('userName').textContent = S.user.name || 'there';
    document.getElementById('aiBannerText').textContent = AI.getDashInsight();

    const done = S.tasks.filter(t => t.done).length;
    const pending = S.tasks.filter(t => !t.done).length;
    document.getElementById('dashTasksDone').textContent = done;
    document.getElementById('dashTasksPending').textContent = pending;

    const spent = S.expenses.reduce((s, e) => s + e.amount, 0);
    const remaining = S.finance.income - spent;
    document.getElementById('dashBudgetLeft').textContent = '₹' + remaining.toLocaleString();

    const moodToday = S.moods.find(m => m.date === new Date().toISOString().slice(0, 10));
    document.getElementById('dashWellness').textContent = moodToday ? { great: '😄', good: '😊', okay: '😐', low: '😔', stressed: '😰' }[moodToday.mood] : '--';

    const phase = AI.getCyclePhase();
    document.getElementById('cycleIndicator').querySelector('.cycle-text').textContent = phase.phase !== 'unknown' ? phase.text.split(' ').slice(1).join(' ') : 'Set cycle';

    document.getElementById('energyBadge').querySelector('.energy-text').textContent = S.user.energy.charAt(0).toUpperCase() + S.user.energy.slice(1);

    // Today's schedule
    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = S.tasks.filter(t => !t.done && t.scheduledTime).sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
    const todayEvents = S.events.filter(e => e.date === today).sort((a, b) => a.time.localeCompare(b.time));
    const schedItems = [...todayEvents.map(e => `<div class="sched-item"><div class="sched-time">${e.time}</div><div class="sched-bar ${e.type}"></div><div class="sched-info"><div class="sched-title">${esc(e.title)}</div><div class="sched-type">${e.type}</div></div></div>`),
      ...todayTasks.map(t => `<div class="sched-item"><div class="sched-time">${t.scheduledTime}</div><div class="sched-bar personal"></div><div class="sched-info"><div class="sched-title">${esc(t.text)}</div><div class="sched-type">task</div></div></div>`)
    ];
    document.getElementById('dashSchedule').innerHTML = schedItems.length ? schedItems.join('') : '<div class="empty-state">No events today. Add some or let AI plan!</div>';

    // Suggestions
    const sug = AI.getSuggestions();
    document.getElementById('dashSuggestions').innerHTML = sug.map(s => `<div class="suggestion-item"><span class="si-icon">${s.icon}</span><span class="si-text">${s.text}</span></div>`).join('');

    // Spending bars
    const cats = {};
    S.expenses.forEach(e => { cats[e.category] = (cats[e.category] || 0) + e.amount; });
    const maxCat = Math.max(...Object.values(cats), 1);
    const colors = ['#7ECEC1', '#E8526F', '#D4A853', '#7EB5D6', '#C5A3CF', '#F08A6D'];
    document.getElementById('spendingBars').innerHTML = Object.entries(cats).length > 0
      ? Object.entries(cats).map(([k, v], i) => `<div class="spending-bar-row"><div class="sb-label">${k}</div><div class="sb-bar"><div class="sb-fill" style="width:${(v/maxCat)*100}%;background:${colors[i % colors.length]}"></div></div><div class="sb-value">₹${v.toLocaleString()}</div></div>`).join('')
      : '<div class="empty-state"><div class="empty-text">Log expenses to see spending chart</div></div>';
  }
};

// ==================== PRODUCTIVITY ====================
const Productivity = {
  openAdd() {
    Modal.open('Add Task', `
      <label>Task</label>
      <input type="text" id="addTaskText" placeholder="What needs to be done?">
      <label>Priority</label>
      <select id="addTaskPriority"><option value="medium">Medium</option><option value="high">High</option><option value="low">Low</option></select>
      <label>Category</label>
      <select id="addTaskCat"><option value="work">Work</option><option value="personal">Personal</option><option value="errand">Errand</option><option value="learning">Learning</option></select>
      <label>Scheduled Time (optional)</label>
      <input type="time" id="addTaskTime">
      <button class="btn btn-primary" onclick="Productivity.add()">Add Task</button>
    `);
  },
  add() {
    const text = document.getElementById('addTaskText').value.trim();
    if (!text) return;
    S.tasks.push({
      id: Date.now(),
      text,
      priority: document.getElementById('addTaskPriority').value,
      category: document.getElementById('addTaskCat').value,
      scheduledTime: document.getElementById('addTaskTime').value || null,
      done: false,
      created: new Date().toISOString()
    });
    S.save();
    Modal.close();
    this.render();
    toast('✅ Task added!', 'success');
  },
  toggle(id) {
    const t = S.tasks.find(t => t.id === id);
    if (t) { t.done = !t.done; S.save(); this.render(); }
  },
  remove(id) {
    S.tasks = S.tasks.filter(t => t.id !== id);
    S.save();
    this.render();
  },
  setEnergy(level) {
    S.user.energy = level;
    S.save();
    document.querySelectorAll('.et-btn').forEach(b => b.classList.toggle('active', b.dataset.level === level));
    document.getElementById('energySuggestion').textContent = AI.getEnergyTip(level);
  },
  autoSchedule() {
    const msg = AI.autoScheduleTasks();
    toast('🧠 ' + msg, 'success');
    this.render();
  },
  startFocus(minutes = 25) {
    if (S.focusTimer) return;
    let remaining = minutes * 60;
    const bar = document.getElementById('focusTimerBar');
    bar.style.display = 'flex';
    const update = () => {
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      document.getElementById('focusTime').textContent = `${m}:${s.toString().padStart(2, '0')}`;
      document.getElementById('focusFill').style.width = ((1 - remaining / (minutes * 60)) * 100) + '%';
      if (remaining <= 0) { this.stopFocus(); toast('🎉 Focus block complete! Take a break.', 'success'); return; }
      remaining--;
    };
    update();
    S.focusTimer = setInterval(update, 1000);
  },
  stopFocus() {
    clearInterval(S.focusTimer);
    S.focusTimer = null;
    document.getElementById('focusTimerBar').style.display = 'none';
  },
  render() {
    const filter = document.getElementById('taskFilter')?.value || 'all';
    let tasks = [...S.tasks];
    if (filter === 'today') tasks = tasks.filter(t => t.created?.startsWith(new Date().toISOString().slice(0, 10)));
    if (filter === 'pending') tasks = tasks.filter(t => !t.done);
    if (filter === 'done') tasks = tasks.filter(t => t.done);

    tasks.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const p = { high: 0, medium: 1, low: 2 };
      return (p[a.priority] || 1) - (p[b.priority] || 1);
    });

    if (tasks.length === 0) {
      document.getElementById('taskList').innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">No tasks yet. Add your first task!</div></div>';
      return;
    }

    document.getElementById('taskList').innerHTML = tasks.map(t => `
      <div class="task-item ${t.done ? 'done' : ''}">
        <button class="ti-check ${t.done ? 'checked' : ''}" onclick="Productivity.toggle(${t.id})">✓</button>
        <div class="ti-body">
          <div class="ti-text">${esc(t.text)}</div>
          <div class="ti-meta">
            <span class="ti-priority ${t.priority}">${t.priority}</span>
            <span>${t.category}</span>
            ${t.scheduledTime ? `<span>⏰ ${t.scheduledTime}</span>` : ''}
          </div>
        </div>
        ${t.scheduledTime ? '' : `<button class="btn btn-sm" onclick="Productivity.startFocus()" title="Start focus block">▶</button>`}
        <button class="ti-delete" onclick="Productivity.remove(${t.id})">×</button>
      </div>
    `).join('');
  }
};

// ==================== SCHEDULER ====================
const Scheduler = {
  getDate() {
    const d = new Date();
    d.setDate(d.getDate() + S.schedulerOffset);
    return d;
  },
  openAdd() {
    const dt = this.getDate().toISOString().slice(0, 10);
    Modal.open('Add Event', `
      <label>Event Title</label>
      <input type="text" id="addEventTitle" placeholder="Meeting, errand, etc.">
      <label>Time</label>
      <input type="time" id="addEventTime" value="09:00">
      <label>Date</label>
      <input type="date" id="addEventDate" value="${dt}">
      <label>Type</label>
      <select id="addEventType"><option value="work">Work</option><option value="personal">Personal</option><option value="errand">Errand</option><option value="learning">Learning</option><option value="rest">Rest</option></select>
      <button class="btn btn-primary" onclick="Scheduler.add()">Add Event</button>
    `);
  },
  add() {
    const title = document.getElementById('addEventTitle').value.trim();
    if (!title) return;
    S.events.push({
      id: Date.now(),
      title,
      time: document.getElementById('addEventTime').value,
      date: document.getElementById('addEventDate').value,
      type: document.getElementById('addEventType').value
    });
    S.save();
    Modal.close();
    this.render();
    toast('📅 Event added!', 'success');
  },
  prevDay() { S.schedulerOffset--; this.render(); },
  nextDay() { S.schedulerOffset++; this.render(); },
  aiPlan() {
    const dt = this.getDate().toISOString().slice(0, 10);
    const existing = S.events.filter(e => e.date === dt);
    if (existing.length === 0) {
      const phase = AI.getCyclePhase();
      const templates = [
        { title: 'Morning routine & planning', time: '08:00', type: 'personal' },
        { title: 'Deep work / Focus block', time: '09:30', type: 'work' },
        { title: 'Quick break & stretch', time: '11:00', type: 'rest' },
        { title: 'Collaborative work / Meetings', time: '11:15', type: 'work' },
        { title: 'Lunch break', time: '13:00', type: 'rest' },
        { title: 'Afternoon tasks', time: '14:00', type: 'work' },
        { title: '10-min learning capsule', time: '15:30', type: 'learning' },
        { title: 'Wrap up & plan tomorrow', time: '17:00', type: 'personal' },
      ];
      if (phase.phase === 'menstrual') {
        templates[1].title = 'Light tasks (menstrual phase)';
        templates.splice(4, 0, { title: 'Extra rest — listen to your body', time: '12:30', type: 'rest' });
      }
      templates.forEach(t => {
        S.events.push({ id: Date.now() + Math.random(), ...t, date: dt });
      });
      S.save();
      toast('🧠 AI planned your day! Adjusted for your cycle phase.', 'success');
    } else {
      toast('Day already has events. Clear them first or add manually.', 'warning');
    }
    this.render();
  },
  render() {
    const d = this.getDate();
    const dt = d.toISOString().slice(0, 10);
    const opts = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById('schedulerDate').textContent = S.schedulerOffset === 0 ? 'Today' : d.toLocaleDateString('en-US', opts);

    const wl = AI.workloadLevel();
    document.getElementById('workloadLevel').textContent = wl.level;
    document.getElementById('workloadFill').style.width = wl.pct + '%';
    document.getElementById('workloadFill').style.background = wl.color;
    document.getElementById('workloadNote').textContent = wl.note;

    const events = S.events.filter(e => e.date === dt).sort((a, b) => a.time.localeCompare(b.time));
    if (events.length === 0) {
      document.getElementById('scheduleTimeline').innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-text">No events scheduled. Let AI plan your day!</div></div>';
      return;
    }
    document.getElementById('scheduleTimeline').innerHTML = events.map(e => `
      <div class="sched-item">
        <div class="sched-time">${e.time}</div>
        <div class="sched-bar ${e.type}"></div>
        <div class="sched-info">
          <div class="sched-title">${esc(e.title)}</div>
          <div class="sched-type">${e.type}</div>
        </div>
        <button class="ti-delete" onclick="Scheduler.remove(${JSON.stringify(e.id)})">×</button>
      </div>
    `).join('');
  },
  remove(id) {
    S.events = S.events.filter(e => e.id !== id);
    S.save();
    this.render();
  }
};

// ==================== LEARNING ====================
const Learning = {
  setStyle(s) { S.user.learningStyle = s; S.save(); },
  openAdd() {
    Modal.open('Add Skill to Learn', `
      <label>Skill Name</label>
      <input type="text" id="addSkillName" placeholder="e.g., Excel, Python, Public Speaking">
      <button class="btn btn-primary" onclick="Learning.addSkill()">Add Skill</button>
    `);
  },
  addSkill() {
    const name = document.getElementById('addSkillName').value.trim();
    if (!name) return;
    S.skills.push({ id: Date.now(), name, progress: 0, minutes: 0 });
    S.save();
    Modal.close();
    this.render();
    toast('🎓 Skill added! Start learning with AI Instructor below.', 'success');
  },
  sendMsg() {
    const input = document.getElementById('instructorInput');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    const container = document.getElementById('instructorMessages');
    container.innerHTML += `<div class="ic-msg user">${esc(msg)}</div>`;

    const response = AI.instructorChat(msg, S.user.learningStyle);
    setTimeout(() => {
      container.innerHTML += `<div class="ic-msg ai"><span class="ic-label">AI Instructor</span>${response.replace(/\n/g, '<br>')}</div>`;
      container.scrollTop = container.scrollHeight;
    }, 600);

    if (S.skills.length > 0) {
      S.skills[0].minutes += 10;
      S.skills[0].progress = Math.min(100, S.skills[0].progress + 5);
      S.save();
      this.render();
    }
  },
  render() {
    const total = S.skills.reduce((s, k) => s + k.minutes, 0);
    document.getElementById('lpMinutes').textContent = total;
    document.getElementById('lpSkills').textContent = S.skills.length;
    const streak = S.moods.length; // simplified streak
    document.getElementById('lpStreak').textContent = Math.min(streak, 30);

    if (S.skills.length === 0) {
      document.getElementById('skillPath').innerHTML = '<div class="empty-state"><div class="empty-icon">🎯</div><div class="empty-text">Tell AI what you want to learn!</div><button class="btn btn-primary" onclick="Learning.openAdd()">+ Add Skill to Learn</button></div>';
      return;
    }
    document.getElementById('skillPath').innerHTML = S.skills.map(s => `
      <div class="skill-card">
        <h4>📘 ${esc(s.name)}</h4>
        <div class="skill-progress-bar"><div class="skill-progress-fill" style="width:${s.progress}%"></div></div>
        <div class="skill-meta">${s.progress}% complete · ${s.minutes} min learned</div>
      </div>
    `).join('');
  }
};

// ==================== HOME ====================
const Home = {
  switchTab(tab, btn) {
    document.querySelectorAll('.home-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.htab').forEach(b => b.classList.remove('active'));
    document.getElementById('panel-' + tab).classList.add('active');
    if (btn) btn.classList.add('active');
  },
  openAddGrocery() {
    Modal.open('Add Grocery Item', `
      <label>Item Name</label>
      <input type="text" id="addGroceryName" placeholder="e.g., Milk, Bread, Rice">
      <label>Category</label>
      <select id="addGroceryCat"><option value="grocery">🥦 Grocery</option><option value="medical">💊 Medical</option><option value="household">🏠 Household</option><option value="kids">👶 Kids</option></select>
      <button class="btn btn-primary" onclick="Home.addGrocery()">Add Item</button>
    `);
  },
  addGrocery() {
    const name = document.getElementById('addGroceryName').value.trim();
    if (!name) return;
    S.groceries.push({ id: Date.now(), name, category: document.getElementById('addGroceryCat').value, bought: false });
    S.save();
    Modal.close();
    this.render();
    toast('🛒 Item added!', 'success');
  },
  toggleGrocery(id) {
    const g = S.groceries.find(g => g.id === id);
    if (g) { g.bought = !g.bought; S.save(); this.render(); }
  },
  removeGrocery(id) {
    S.groceries = S.groceries.filter(g => g.id !== id);
    S.save();
    this.render();
  },
  aiMealSuggest() {
    const needed = ['Milk', 'Eggs', 'Rice', 'Dal', 'Vegetables', 'Bread', 'Fruits', 'Curd'];
    const existing = S.groceries.map(g => g.name.toLowerCase());
    const toAdd = needed.filter(n => !existing.includes(n.toLowerCase()));
    toAdd.forEach(name => {
      S.groceries.push({ id: Date.now() + Math.random(), name, category: 'grocery', bought: false });
    });
    S.save();
    this.render();
    toast(`🧠 AI suggested ${toAdd.length} grocery items based on common meal ingredients!`, 'success');
  },
  generateMealPlan() {
    S.mealPlan = AI.generateMealPlan();
    S.save();
    this.render();
    toast('🍽️ AI generated your weekly meal plan!', 'success');
  },
  openAddFamily() {
    Modal.open('Add Family Event', `
      <label>Event</label>
      <input type="text" id="addFamilyEvent" placeholder="e.g., School parent meeting">
      <label>Date</label>
      <input type="date" id="addFamilyDate">
      <label>For</label>
      <input type="text" id="addFamilyFor" placeholder="e.g., Kid, Spouse, Self">
      <button class="btn btn-primary" onclick="Home.addFamily()">Add Event</button>
    `);
  },
  addFamily() {
    const event = document.getElementById('addFamilyEvent').value.trim();
    if (!event) return;
    S.familyEvents.push({ id: Date.now(), event, date: document.getElementById('addFamilyDate').value, who: document.getElementById('addFamilyFor').value });
    S.save();
    Modal.close();
    this.render();
    toast('👨‍👩‍👧 Family event added!', 'success');
  },
  openAddGeo() {
    Modal.open('Add Geo-Reminder', `
      <label>Store Name</label>
      <input type="text" id="addGeoStore" placeholder="e.g., Fresh Mart, Apollo Pharmacy">
      <label>Category</label>
      <select id="addGeoCat"><option value="grocery">🥦 Grocery</option><option value="medical">💊 Medical</option><option value="household">🏠 Household</option></select>
      <label>Items to buy</label>
      <input type="text" id="addGeoItems" placeholder="Milk, Eggs, Bread (comma separated)">
      <label><input type="checkbox" id="addGeoFavorite"> Always remind at this store</label>
      <button class="btn btn-primary" onclick="Home.addGeo()">Add Geo-Reminder</button>
    `);
  },
  addGeo() {
    const store = document.getElementById('addGeoStore').value.trim();
    if (!store) return;
    S.geoReminders.push({
      id: Date.now(),
      store,
      category: document.getElementById('addGeoCat').value,
      items: document.getElementById('addGeoItems').value.split(',').map(i => i.trim()).filter(Boolean),
      favorite: document.getElementById('addGeoFavorite').checked,
      dismissed: false
    });
    S.save();
    Modal.close();
    this.render();
    toast('📍 Geo-Reminder added!', 'success');
  },
  dismissGeo() { document.getElementById('geoPopup').style.display = 'none'; },
  snoozeGeo() { document.getElementById('geoPopup').style.display = 'none'; toast('📍 Will remind again later.', 'info'); },
  simulateGeo() {
    const active = S.geoReminders.filter(g => !g.dismissed && g.items.length > 0);
    if (active.length > 0) {
      const g = active[0];
      document.getElementById('geoPopupTitle').textContent = `You're near ${g.store}!`;
      document.getElementById('geoPopupBody').textContent = `Buy: ${g.items.join(', ')}`;
      document.getElementById('geoPopup').style.display = 'flex';
    }
  },
  render() {
    // Groceries
    const groceries = S.groceries;
    if (groceries.length === 0) {
      document.getElementById('groceryList').innerHTML = '<div class="empty-state"><div class="empty-icon">🛒</div><div class="empty-text">Your grocery list is empty</div></div>';
    } else {
      document.getElementById('groceryList').innerHTML = groceries.map(g => `
        <div class="grocery-item ${g.bought ? 'bought' : ''}">
          <button class="gi-check ${g.bought ? 'checked' : ''}" onclick="Home.toggleGrocery(${g.id})"></button>
          <span class="gi-name">${esc(g.name)}</span>
          <span class="gi-cat">${g.category}</span>
          <button class="gi-remove" onclick="Home.removeGrocery(${g.id})">×</button>
        </div>
      `).join('');
    }

    // Meals
    if (S.mealPlan.length === 0) {
      document.getElementById('mealPlan').innerHTML = '<div class="empty-state"><div class="empty-icon">🍽️</div><div class="empty-text">No meal plan yet. Let AI create one!</div></div>';
    } else {
      document.getElementById('mealPlan').innerHTML = S.mealPlan.map(m => `
        <div class="meal-day">
          <h4>${m.day}</h4>
          <div class="meal-item">🌅 Breakfast: ${m.breakfast}</div>
          <div class="meal-item">☀️ Lunch: ${m.lunch}</div>
          <div class="meal-item">🌙 Dinner: ${m.dinner}</div>
        </div>
      `).join('');
    }

    // Family
    if (S.familyEvents.length === 0) {
      document.getElementById('familySchedule').innerHTML = '<div class="empty-state"><div class="empty-icon">👨‍👩‍👧</div><div class="empty-text">No family events.</div></div>';
    } else {
      document.getElementById('familySchedule').innerHTML = S.familyEvents.map(f => `
        <div class="grocery-item"><span class="gi-name">${esc(f.event)}</span><span class="gi-cat">${f.date || 'No date'} · ${f.who}</span><button class="gi-remove" onclick="Home.removeFamily(${f.id})">×</button></div>
      `).join('');
    }

    // Geo
    document.getElementById('geoList').innerHTML = S.geoReminders.map(g => `
      <div class="geo-reminder-item">
        <span>📍</span>
        <span style="flex:1"><strong>${esc(g.store)}</strong> (${g.category}) ${g.favorite ? '⭐' : ''}<br><small>${g.items.join(', ')}</small></span>
        <button class="btn btn-sm" onclick="Home.simulateGeoFor(${g.id})">Test</button>
        <button class="gi-remove" onclick="Home.removeGeo(${g.id})">×</button>
      </div>
    `).join('');
  },
  removeFamily(id) { S.familyEvents = S.familyEvents.filter(f => f.id !== id); S.save(); this.render(); },
  removeGeo(id) { S.geoReminders = S.geoReminders.filter(g => g.id !== id); S.save(); this.render(); },
  simulateGeoFor(id) {
    const g = S.geoReminders.find(g => g.id === id);
    if (g) {
      document.getElementById('geoPopupTitle').textContent = `📍 You're near ${g.store}!`;
      document.getElementById('geoPopupBody').textContent = `Buy: ${g.items.join(', ')}`;
      document.getElementById('geoPopup').style.display = 'flex';
    }
  }
};

// ==================== FINANCE ====================
const Finance = {
  openAdd() {
    Modal.open('Log Expense', `
      <label>Amount (₹)</label>
      <input type="number" id="addExpAmount" placeholder="500">
      <label>Description</label>
      <input type="text" id="addExpDesc" placeholder="What did you spend on?">
      <label>Category</label>
      <select id="addExpCat"><option value="Food">🍽️ Food</option><option value="Transport">🚗 Transport</option><option value="Shopping">🛍️ Shopping</option><option value="Bills">📄 Bills</option><option value="Health">💊 Health</option><option value="Entertainment">🎬 Entertainment</option><option value="Education">📚 Education</option><option value="Other">📦 Other</option></select>
      <button class="btn btn-primary" onclick="Finance.add()">Log Expense</button>
    `);
  },
  add() {
    const amount = parseFloat(document.getElementById('addExpAmount').value);
    if (!amount || amount <= 0) return;
    S.expenses.push({
      id: Date.now(),
      amount,
      desc: document.getElementById('addExpDesc').value.trim() || 'Expense',
      category: document.getElementById('addExpCat').value,
      date: new Date().toISOString().slice(0, 10)
    });
    S.save();
    Modal.close();
    this.render();
    toast('💳 Expense logged!', 'success');
  },
  openIncome() {
    Modal.open('Set Income & Savings', `
      <label>Monthly Income (₹)</label>
      <input type="number" id="setIncome" value="${S.finance.income}" placeholder="50000">
      <label>Monthly Savings Goal (₹)</label>
      <input type="number" id="setSavings" value="${S.finance.savingsGoal}" placeholder="10000">
      <button class="btn btn-primary" onclick="Finance.setIncome()">Save</button>
    `);
  },
  setIncome() {
    S.finance.income = parseFloat(document.getElementById('setIncome').value) || 0;
    S.finance.savingsGoal = parseFloat(document.getElementById('setSavings').value) || 0;
    S.save();
    Modal.close();
    this.render();
    toast('💵 Income & savings updated!', 'success');
  },
  remove(id) {
    S.expenses = S.expenses.filter(e => e.id !== id);
    S.save();
    this.render();
  },
  aiAdvice() {
    const total = S.expenses.reduce((s, e) => s + e.amount, 0);
    const cats = {};
    S.expenses.forEach(e => { cats[e.category] = (cats[e.category] || 0) + e.amount; });
    const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];

    let tips = '<strong>🧠 AI Financial Analysis:</strong><br><br>';
    if (S.finance.income === 0) { tips += '⚠️ Set your monthly income first to get budgeting insights.'; }
    else {
      const pct = ((total / S.finance.income) * 100).toFixed(0);
      tips += `You\'ve spent ₹${total.toLocaleString()} (${pct}% of income) this month.<br><br>`;
      if (topCat) tips += `📊 Highest spending: <strong>${topCat[0]}</strong> at ₹${topCat[1].toLocaleString()}<br><br>`;
      if (total > S.finance.income * 0.8) tips += '🚨 <strong>Alert:</strong> You\'re over 80% spent. Cut back on non-essentials.<br>';
      if (total < S.finance.income * 0.5) tips += '✅ Great budgeting! You have room for savings or investments.<br>';
      tips += '<br>💡 <strong>Micro-investment tip:</strong> Even ₹500/month in a SIP can grow significantly over 5 years with compound interest.';
      if (S.finance.savingsGoal > 0) {
        const saveable = S.finance.income - total;
        tips += `<br><br>🎯 Savings goal: ₹${S.finance.savingsGoal.toLocaleString()} | Currently saveable: ₹${saveable.toLocaleString()} ${saveable >= S.finance.savingsGoal ? '✅ On track!' : '⚠️ Need to cut spending'}`;
      }
    }
    document.getElementById('finTipsBody').innerHTML = tips;
    document.getElementById('financeTips').style.display = 'block';
  },
  render() {
    const total = S.expenses.reduce((s, e) => s + e.amount, 0);
    const remaining = S.finance.income - total;
    document.getElementById('finIncome').textContent = '₹' + S.finance.income.toLocaleString();
    document.getElementById('finSpent').textContent = '₹' + total.toLocaleString();
    document.getElementById('finRemaining').textContent = '₹' + remaining.toLocaleString();
    document.getElementById('finSavings').textContent = '₹' + S.finance.savingsGoal.toLocaleString();

    const pct = S.finance.income > 0 ? Math.min(100, (total / S.finance.income) * 100) : 0;
    document.getElementById('budgetPercent').textContent = pct.toFixed(0) + '%';
    document.getElementById('budgetFill').style.width = pct + '%';
    if (pct > 80) document.getElementById('budgetFill').style.background = 'linear-gradient(90deg, #E8526F, #D4A853)';

    // Categories
    const cats = {};
    S.expenses.forEach(e => { cats[e.category] = (cats[e.category] || 0) + e.amount; });
    document.getElementById('expenseCategories').innerHTML = Object.entries(cats).map(([k, v]) => `<div class="exp-cat">${k}: ₹${v.toLocaleString()}</div>`).join('');

    // List
    if (S.expenses.length === 0) {
      document.getElementById('expenseList').innerHTML = '<div class="empty-state"><div class="empty-icon">💳</div><div class="empty-text">No expenses logged.</div></div>';
    } else {
      const icons = { Food: '🍽️', Transport: '🚗', Shopping: '🛍️', Bills: '📄', Health: '💊', Entertainment: '🎬', Education: '📚', Other: '📦' };
      document.getElementById('expenseList').innerHTML = S.expenses.slice().reverse().map(e => `
        <div class="expense-item">
          <span class="ei-icon">${icons[e.category] || '📦'}</span>
          <div class="ei-info"><div class="ei-name">${esc(e.desc)}</div><div class="ei-date">${e.date} · ${e.category}</div></div>
          <div class="ei-amount">-₹${e.amount.toLocaleString()}</div>
          <button class="ei-delete" onclick="Finance.remove(${e.id})">×</button>
        </div>
      `).join('');
    }
  }
};

// ==================== LEADERSHIP ====================
const Leadership = {
  rewriteEmail() {
    const text = document.getElementById('emailInput').value;
    const tone = document.getElementById('emailTone').value;
    const result = AI.rewriteEmail(text, tone);
    document.getElementById('emailResult').textContent = result;
    document.getElementById('emailOutput').style.display = 'block';
  },
  generatePitch() {
    const role = document.getElementById('pitchRole').value;
    const achievement = document.getElementById('pitchAchievement').value;
    const result = AI.generatePitch(role, achievement);
    document.getElementById('pitchResult').textContent = result;
    document.getElementById('pitchOutput').style.display = 'block';
  },
  negotiationScript() {
    const result = AI.negotiationScript(
      document.getElementById('negCurrentSalary').value,
      document.getElementById('negDesiredSalary').value,
      document.getElementById('negReason').value
    );
    document.getElementById('negResult').textContent = result;
    document.getElementById('negOutput').style.display = 'block';
  },
  nextLesson() {
    const lessons = AI.leadershipLessons;
    const idx = Math.floor(Math.random() * lessons.length);
    const l = lessons[idx];
    document.getElementById('microLesson').innerHTML = `
      <div class="ml-topic">${l.topic}</div>
      <div class="ml-content">${l.content}</div>
      <div class="ml-action">${l.action}</div>
    `;
  }
};

// ==================== BRANDING ====================
const Branding = {
  optimizeLinkedIn() {
    const result = AI.linkedinHeadlines(document.getElementById('linkedinRole').value, document.getElementById('linkedinSkills').value);
    document.getElementById('linkedinResult').textContent = result;
    document.getElementById('linkedinOutput').style.display = 'block';
  },
  generatePost() {
    const result = AI.socialPost(document.getElementById('postTopic').value, document.getElementById('postPlatform').value);
    document.getElementById('postResult').textContent = result;
    document.getElementById('postOutput').style.display = 'block';
  },
  openAddWin() {
    Modal.open('Log a Win', `
      <label>Achievement</label>
      <input type="text" id="addWinText" placeholder="What did you accomplish?">
      <label>Date</label>
      <input type="date" id="addWinDate" value="${new Date().toISOString().slice(0, 10)}">
      <button class="btn btn-primary" onclick="Branding.addWin()">Add Win 🏆</button>
    `);
  },
  addWin() {
    const text = document.getElementById('addWinText').value.trim();
    if (!text) return;
    S.wins.push({ id: Date.now(), text, date: document.getElementById('addWinDate').value });
    S.save();
    Modal.close();
    this.render();
    toast('🏆 Win logged! Keep building your success story.', 'success');
  },
  render() {
    if (S.wins.length === 0) {
      document.getElementById('successTimeline').innerHTML = '<div class="empty-state"><div class="empty-text">Start logging your achievements!</div></div>';
    } else {
      document.getElementById('successTimeline').innerHTML = S.wins.slice().reverse().map(w => `
        <div class="win-item">
          <div class="win-dot"></div>
          <div class="win-date">${w.date}</div>
          <div class="win-text">${esc(w.text)}</div>
        </div>
      `).join('');
    }
  }
};

// ==================== WELLNESS ====================
const Wellness = {
  logMood(mood, btn) {
    const today = new Date().toISOString().slice(0, 10);
    const existing = S.moods.findIndex(m => m.date === today);
    if (existing >= 0) S.moods[existing].mood = mood;
    else S.moods.push({ date: today, mood });
    S.save();
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    toast('💜 Mood logged!', 'success');
    this.render();
    this.updateWellnessScore();
  },
  openMood() {
    Router.go('wellness');
  },
  updateCycle() {
    S.cycle.startDate = document.getElementById('cycleStartDate').value;
    S.cycle.length = parseInt(document.getElementById('cycleLength').value) || 28;
    S.save();
    const phase = AI.getCyclePhase();
    document.getElementById('ctPhaseName').textContent = phase.text;
    document.getElementById('ctPhaseDay').textContent = phase.day ? `Day ${phase.day} of your cycle` : '';
    document.getElementById('ctRecommendations').innerHTML = phase.recs || '';
    document.getElementById('cycleIndicator').querySelector('.cycle-text').textContent = phase.phase !== 'unknown' ? phase.text.split(' ').slice(1).join(' ') : 'Set cycle';
  },
  updateWellnessScore() {
    let score = 50;
    const today = new Date().toISOString().slice(0, 10);
    const todayMood = S.moods.find(m => m.date === today);
    if (todayMood) {
      const moodScores = { great: 90, good: 75, okay: 50, low: 30, stressed: 20 };
      score = moodScores[todayMood.mood] || 50;
    }
    const lastSleep = S.sleepLog[S.sleepLog.length - 1];
    if (lastSleep) {
      if (lastSleep.hours >= 7 && lastSleep.hours <= 9) score += 10;
      if (lastSleep.quality === 'great') score += 5;
      if (lastSleep.quality === 'poor') score -= 10;
    }
    score = Math.max(0, Math.min(100, score));
    document.getElementById('wellScoreValue').textContent = score;
    const offset = 339.3 * (1 - score / 100);
    document.getElementById('wellScoreCircle').setAttribute('stroke-dashoffset', offset);
  },
  logSleep() {
    const hours = parseFloat(document.getElementById('sleepHours').value);
    if (!hours) return;
    S.sleepLog.push({
      date: new Date().toISOString().slice(0, 10),
      hours,
      quality: document.getElementById('sleepQuality').value
    });
    S.save();
    toast('😴 Sleep logged!', 'success');
    this.updateWellnessScore();
  },
  toggleBreaks() {
    const on = document.getElementById('breakToggle').checked;
    if (on) {
      S.breakTimer = setInterval(() => {
        const tips = [
          'Take 5 deep breaths. Inhale 4 seconds, hold 4, exhale 4.',
          'Drink a glass of water. Hydration boosts focus.',
          'Look at something 20 feet away for 20 seconds (20-20-20 rule).',
          'Stand up and stretch for 30 seconds.',
          'Close your eyes and relax your shoulders for 1 minute.'
        ];
        document.getElementById('breakTip').textContent = tips[Math.floor(Math.random() * tips.length)];
        document.getElementById('breakPopup').style.display = 'flex';
      }, 45 * 60 * 1000);
      toast('⏰ Break reminders enabled (every 45 min)', 'success');
    } else {
      clearInterval(S.breakTimer);
      S.breakTimer = null;
      toast('Break reminders disabled', 'info');
    }
  },
  dismissBreak() {
    document.getElementById('breakPopup').style.display = 'none';
  },
  render() {
    // Mood history
    if (S.moods.length === 0) {
      document.getElementById('moodHistory').innerHTML = '<div class="empty-state"><div class="empty-text">Log your mood daily to see patterns</div></div>';
    } else {
      const moodEmoji = { great: '😄', good: '😊', okay: '😐', low: '😔', stressed: '😰' };
      const moodColor = { great: 'rgba(126,206,193,0.2)', good: 'rgba(126,206,193,0.12)', okay: 'rgba(212,168,83,0.15)', low: 'rgba(232,82,111,0.12)', stressed: 'rgba(232,82,111,0.2)' };
      document.getElementById('moodHistory').innerHTML = S.moods.slice(-30).map(m => `<div class="mood-dot" style="background:${moodColor[m.mood]}" title="${m.date}: ${m.mood}">${moodEmoji[m.mood]}</div>`).join('');
    }

    // Highlight today's mood
    const today = new Date().toISOString().slice(0, 10);
    const todayMood = S.moods.find(m => m.date === today);
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.toggle('active', todayMood && b.dataset.mood === todayMood.mood));

    // Cycle
    if (S.cycle.startDate) {
      document.getElementById('cycleStartDate').value = S.cycle.startDate;
      document.getElementById('cycleLength').value = S.cycle.length;
      this.updateCycle();
    }

    this.updateWellnessScore();
  }
};

// ==================== AI CHAT ====================
const AIChat = {
  send() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    const container = document.getElementById('chatMessages');
    container.innerHTML += `<div class="chat-msg user"><div class="cm-avatar">👩</div><div class="cm-bubble"><div class="cm-text">${esc(msg)}</div></div></div>`;

    const apiKey = S.settings.apiKey;
    const provider = S.settings.apiProvider;

    if (apiKey && provider !== 'builtin') {
      this.callAPI(msg, container);
    } else {
      const response = AI.chat(msg);
      setTimeout(() => {
        container.innerHTML += `<div class="chat-msg ai"><div class="cm-avatar">🧠</div><div class="cm-bubble"><div class="cm-text">${response.replace(/\n/g, '<br>')}</div></div></div>`;
        container.scrollTop = container.scrollHeight;
      }, 500);
    }
    container.scrollTop = container.scrollHeight;
  },

  async callAPI(msg, container) {
    const provider = S.settings.apiProvider;
    let url, headers, body;

    const systemPrompt = `You are HER-OS, an AI Life Operating System for women. You help with productivity, scheduling, finance, wellness, learning, home management, leadership, and personal branding. Be warm, supportive, and actionable. Use emojis naturally. Keep responses concise but helpful. The user's data: Energy: ${S.user.energy}, Pending tasks: ${S.tasks.filter(t=>!t.done).length}, Budget remaining: ₹${S.finance.income - S.expenses.reduce((s,e)=>s+e.amount,0)}.`;

    if (provider === 'groq') {
      url = 'https://api.groq.com/openai/v1/chat/completions';
      headers = { 'Authorization': 'Bearer ' + S.settings.apiKey, 'Content-Type': 'application/json' };
      body = JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: msg }], max_tokens: 500 });
    } else {
      url = 'https://api.openai.com/v1/chat/completions';
      headers = { 'Authorization': 'Bearer ' + S.settings.apiKey, 'Content-Type': 'application/json' };
      body = JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: msg }], max_tokens: 500 });
    }

    try {
      const res = await fetch(url, { method: 'POST', headers, body });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t process that. Try again!';
      container.innerHTML += `<div class="chat-msg ai"><div class="cm-avatar">🧠</div><div class="cm-bubble"><div class="cm-text">${esc(text).replace(/\n/g, '<br>')}</div></div></div>`;
    } catch (e) {
      const fallback = AI.chat(msg);
      container.innerHTML += `<div class="chat-msg ai"><div class="cm-avatar">🧠</div><div class="cm-bubble"><div class="cm-text">${fallback.replace(/\n/g, '<br>')}</div></div></div>`;
    }
    container.scrollTop = container.scrollHeight;
  }
};

// ==================== SETTINGS ====================
const Settings = {
  save() {
    S.user.name = document.getElementById('settingName')?.value || S.user.name;
    S.settings.apiKey = document.getElementById('settingApiKey')?.value || '';
    S.settings.apiProvider = document.getElementById('settingApiProvider')?.value || 'builtin';
    S.settings.lang = document.getElementById('settingLang')?.value || 'en';
    S.save();
    toast('⚙️ Settings saved!', 'success');
  },
  toggleTheme() {
    const theme = document.getElementById('settingTheme').value;
    S.settings.theme = theme;
    document.body.setAttribute('data-theme', theme);
    S.save();
  },
  exportData() {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'heros-data.json';
    a.click();
    toast('📥 Data exported!', 'success');
  },
  clearData() {
    if (confirm('Are you sure? This will delete all your data.')) {
      localStorage.removeItem('heros_data');
      location.reload();
    }
  },
  load() {
    if (S.user.name) document.getElementById('settingName').value = S.user.name;
    if (S.settings.apiKey) document.getElementById('settingApiKey').value = S.settings.apiKey;
    if (S.settings.apiProvider) document.getElementById('settingApiProvider').value = S.settings.apiProvider;
    if (S.settings.theme) {
      document.getElementById('settingTheme').value = S.settings.theme;
      document.body.setAttribute('data-theme', S.settings.theme);
    }
  }
};

// ==================== HELPERS ====================
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function dateStr(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', function() {
  S.load();

  // Navigation
  document.querySelectorAll('.nav-item').forEach(n => {
    n.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.dataset.page;
      if (page) Router.go(page);
      document.getElementById('sidebar').classList.remove('open');
    });
  });

  // Mobile menu
  document.getElementById('mobileMenu').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Load settings
  Settings.load();

  // Render dashboard
  Dashboard.render();

  // Geo-reminder simulation (every 5 minutes)
  setInterval(function() {
    if (S.geoReminders.length > 0 && Math.random() > 0.7) {
      Home.simulateGeo();
    }
  }, 5 * 60 * 1000);
});
