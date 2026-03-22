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
