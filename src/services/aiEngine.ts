import courseData from '../data/courseData.json';
import { useHerAIStore } from '../store/useHerAIStore';
import type { ChatTurn, InstructorTopicKey } from '../types/herai';

type CourseKey = keyof typeof courseData;

function S() {
  return useHerAIStore.getState();
}

/** Monthly salary + logged side income — use for budget % and remaining everywhere. */
function totalBudgetIncome(): number {
  const st = S();
  const side = (st.sideIncomes ?? []).reduce((s, e) => s + e.amount, 0);
  return (st.finance.income || 0) + side;
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getEnergyTip(level: string): string {
  const tips: Record<string, string[]> = {
    high: [
      'High energy detected — perfect for deep work!',
      "You're at peak energy. Tackle your hardest task now.",
      'Energy is high — start that creative project!',
      'Great energy! Focus on tasks that need maximum brainpower.',
    ],
    medium: [
      'Medium energy — good for meetings and collaborative work.',
      'Steady energy. Handle routine tasks and emails now.',
      'Moderate energy — mix easy and medium tasks.',
      'Good time for learning or skill practice.',
    ],
    low: [
      'Energy is low. Stick to simple tasks and take breaks.',
      'Low energy detected. Consider a short walk or snack.',
      'Rest if you can. Only handle urgent items.',
      'Low energy — perfect time for planning, not executing.',
    ],
  };
  const arr = tips[level] || tips.medium;
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function getCyclePhase() {
  const { cycle } = S();
  if (!cycle.startDate) return { phase: 'unknown', day: 0, text: 'Set your cycle dates', recs: '' };
  const start = new Date(cycle.startDate);
  const today = new Date();
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const day = ((diff % cycle.length) + cycle.length) % cycle.length + 1;
  const len = cycle.length;

  let phase: string;
  let text: string;
  let recs: string;
  if (day <= 5) {
    phase = 'menstrual';
    text = '🌑 Menstrual Phase';
    recs =
      'Rest & reflect. Schedule lighter tasks. Practice gentle self-care. Avoid high-pressure meetings if possible.';
  } else if (day <= Math.floor(len * 0.5)) {
    phase = 'follicular';
    text = '🌒 Follicular Phase';
    recs =
      'Rising energy! Great time to plan, brainstorm, and start new projects. Your creativity peaks now.';
  } else if (day <= Math.floor(len * 0.57)) {
    phase = 'ovulation';
    text = '🌕 Ovulation Phase';
    recs =
      'Peak energy & communication! Schedule presentations, networking, and leadership tasks. You\'re magnetic right now.';
  } else {
    phase = 'luteal';
    text = '🌘 Luteal Phase';
    recs =
      'Time to organize & complete. Focus on finishing tasks, deep work, and preparation. Expect energy to gradually decrease.';
  }
  return { phase, day, text, recs };
}

export function getDashInsight(): string {
  const st = S();
  const insights: string[] = [];
  const h = new Date().getHours();
  const pending = st.tasks.filter((t) => !t.done).length;
  const today = new Date().toISOString().slice(0, 10);
  const todayMood = st.moods.find((m) => m.date === today);

  if (h < 12 && st.user.energy === 'high')
    insights.push('Your energy peaks in the morning. Schedule your hardest task before lunch.');
  if (pending > 5)
    insights.push(`You have ${pending} pending tasks. Consider converting some into smaller microtasks.`);
  if (pending === 0 && st.tasks.length > 0)
    insights.push('All tasks complete! Great job. Consider learning something new today.');
  if (todayMood && todayMood.mood === 'stressed')
    insights.push(
      "You reported feeling stressed. I've adjusted suggestions to include more breaks."
    );
  if (st.expenses.length > 3) {
    const total = st.expenses.reduce((s, e) => s + e.amount, 0);
    const tin = totalBudgetIncome();
    if (tin > 0 && total > tin * 0.7)
      insights.push("⚠️ You've spent over 70% of your income. Consider reviewing expenses.");
  }

  const phase = getCyclePhase();
  if (phase.phase === 'menstrual')
    insights.push("You're in your menstrual phase. Schedule lighter tasks and prioritize rest.");
  if (phase.phase === 'ovulation')
    insights.push(
      'Ovulation phase — your communication skills peak now. Great time for presentations!'
    );

  if (insights.length === 0)
    insights.push('Add tasks, log expenses, and track your mood to get personalized AI insights!');
  return insights[Math.floor(Math.random() * insights.length)]!;
}

export function getSuggestions(): { icon: string; text: string }[] {
  const st = S();
  const suggestions: { icon: string; text: string }[] = [];
  const h = new Date().getHours();
  const pending = st.tasks.filter((t) => !t.done);

  if (st.user.energy === 'high' && pending.some((t) => t.priority === 'high')) {
    const t = pending.find((x) => x.priority === 'high')!;
    suggestions.push({
      icon: '🔥',
      text: `Energy is high — tackle "${t.text}" now`,
    });
  }
  if (h >= 14 && h <= 16)
    suggestions.push({ icon: '☕', text: 'Afternoon slump zone. Take a 5-minute break.' });
  const gCount = st.groceries.filter((g) => !g.bought).length;
  if (gCount > 0)
    suggestions.push({
      icon: '🛒',
      text: `${gCount} items on your grocery list. Shop on your way home?`,
    });
  if (st.skills.length > 0)
    suggestions.push({
      icon: '📚',
      text: 'Time for a 10-min learning capsule? Keep your streak alive!',
    });
  if (h >= 20)
    suggestions.push({
      icon: '🌙',
      text: "Evening wind-down. Review tomorrow's plan and prepare for rest.",
    });
  if (pending.length > 3)
    suggestions.push({
      icon: '✂️',
      text: 'Too many tasks? Let AI break them into smaller microtasks.',
    });

  if (suggestions.length === 0)
    suggestions.push({
      icon: '💡',
      text: 'Start adding tasks and data — AI will learn your patterns!',
    });
  return suggestions;
}

export function workloadLevel() {
  const st = S();
  const today = new Date().toISOString().slice(0, 10);
  const todayEvents = st.events.filter((e) => e.date === today && e.type === 'work');
  if (todayEvents.length >= 4)
    return {
      level: 'Heavy',
      pct: 85,
      note: 'Heavy workday — personal tasks shifted to evening/tomorrow',
      color: '#E8526F',
    };
  if (todayEvents.length >= 2)
    return {
      level: 'Moderate',
      pct: 50,
      note: 'Balanced day — personal tasks can stay',
      color: '#D4A853',
    };
  return {
    level: 'Light',
    pct: 20,
    note: 'Light day — great time for errands, learning, and hobbies!',
    color: '#7ECEC1',
  };
}

export function runAutoScheduleTasks(): string {
  const st = useHerAIStore.getState();
  const pending = st.tasks.filter((t) => !t.done && !t.scheduledTime);
  if (pending.length === 0) return 'All tasks are already scheduled! ✨';

  const hours = [9, 10, 11, 14, 15, 16];
  const highFirst = [...pending].sort((a, b) => {
    const p: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (p[a.priority] ?? 1) - (p[b.priority] ?? 1);
  });

  const next = st.tasks.map((t) => {
    const idx = highFirst.findIndex((x) => x.id === t.id);
    if (idx >= 0 && idx < hours.length) {
      return { ...t, scheduledTime: `${hours[idx]}:00` };
    }
    return t;
  });
  useHerAIStore.setState({ tasks: next });
  return `Scheduled ${Math.min(pending.length, hours.length)} tasks. High-priority tasks placed in morning peak hours.`;
}

export function generateMealPlan() {
  return [
    {
      day: 'Monday',
      breakfast: '🥣 Oatmeal with fruits & nuts',
      lunch: '🍛 Dal rice with salad',
      dinner: '🥗 Chapati with paneer sabzi',
    },
    {
      day: 'Tuesday',
      breakfast: '🥞 Moong dal cheela',
      lunch: '🍝 Rajma rice',
      dinner: '🥘 Vegetable soup with bread',
    },
    {
      day: 'Wednesday',
      breakfast: '🍳 Poha with peanuts',
      lunch: '🍱 Curd rice with pickle',
      dinner: '🌮 Roti with mixed veg',
    },
    {
      day: 'Thursday',
      breakfast: '🥛 Smoothie bowl',
      lunch: '🍛 Chicken/Paneer curry with rice',
      dinner: '🥗 Light khichdi',
    },
    {
      day: 'Friday',
      breakfast: '🧇 Idli sambar',
      lunch: '🍱 Biryani with raita',
      dinner: '🥘 Palak roti',
    },
    {
      day: 'Saturday',
      breakfast: '🥐 Paratha with curd',
      lunch: '🍝 Pasta with vegetables',
      dinner: '🍕 Homemade pizza',
    },
    {
      day: 'Sunday',
      breakfast: '🍳 Eggs with toast',
      lunch: '🍛 Special meal (your choice!)',
      dinner: '🥗 Light soup & salad',
    },
  ];
}

export const leadershipLessons = [
  {
    topic: 'Building Executive Presence',
    content:
      'Start meetings by stating your position first, then supporting data. This positions you as a decision-maker, not just a reporter.',
    action: '✅ Practice: In your next meeting, lead with your recommendation.',
  },
  {
    topic: 'The Power of Strategic Silence',
    content:
      "After making a point, pause. Don't fill silence with qualifiers. Let your message land.",
    action: '✅ Practice: In your next conversation, make your point and count to 3 before speaking again.',
  },
  {
    topic: 'Owning Your Achievements',
    content:
      'Replace "we got lucky" with "I strategically planned for this outcome." Own your wins without apology.',
    action: '✅ Practice: Write down 3 achievements this week using "I" statements.',
  },
];

export function rewriteEmail(text: string, tone: string): string {
  if (!text.trim()) return 'Please enter an email draft first.';
  const intros: Record<string, string> = {
    confident: 'I wanted to share my perspective on this.',
    assertive: 'I need to address this directly.',
    diplomatic: "I appreciate the discussion, and I'd like to offer my thoughts.",
    friendly: "Thanks for bringing this up! Here's where I stand.",
  };
  const closings: Record<string, string> = {
    confident: "I'm confident this approach will deliver the results we need. Let's move forward.",
    assertive:
      "This is the direction I recommend. I'm available to discuss if needed, but I believe this is the right path.",
    diplomatic:
      "I believe this balanced approach serves everyone's interests. I welcome your thoughts.",
    friendly: "Would love to hear your take on this! Let's chat more if needed. 😊",
  };

  let rewritten = (intros[tone] || intros.diplomatic) + '\n\n';
  const sentences = text.replace(/([.!?])\s+/g, '$1|').split('|').filter((s) => s.trim());
  sentences.forEach((s) => {
    let improved = s
      .trim()
      .replace(/i think/gi, 'I believe')
      .replace(/maybe we could/gi, 'I recommend we')
      .replace(/sorry but/gi, 'To be direct,')
      .replace(/i was wondering/gi, "I'd like to")
      .replace(/just wanted to/gi, "I'm writing to")
      .replace(/i feel like/gi, 'Based on my analysis,')
      .replace(/does that make sense/gi, 'Let me know if you have questions')
      .replace(/no worries/gi, 'Understood')
      .replace(/i hope this is okay/gi, "I'm confident in this direction");
    rewritten += improved + ' ';
  });
  rewritten += '\n\n' + (closings[tone] || closings.diplomatic);
  return rewritten;
}

export function generatePitch(role: string, achievement: string): string {
  if (!role) return 'Please enter your role.';
  return `Hi, I'm a ${role} who specializes in turning challenges into results. ${
    achievement ? 'Most recently, I ' + achievement + '.' : ''
  } I combine strategic thinking with hands-on execution to drive meaningful impact. I'm passionate about creating value and would love to explore how I can contribute to your team's success.`;
}

export function negotiationScript(current: string, desired: string, reason: string): string {
  if (!current || !desired) return 'Please fill in your salary details.';
  return `"Thank you for this opportunity to discuss my compensation. Over the past period, I've consistently delivered strong results${
    reason ? ' — specifically, ' + reason : ''
  }.\n\nBased on my contributions, market research, and the value I bring to the team, I'd like to discuss adjusting my compensation from ${current} to ${desired}.\n\nI'm committed to this role and want to ensure my compensation reflects the impact I'm making. I'm open to discussing this further and finding an arrangement that works for both of us.\n\nWhat are your thoughts?"`;
}

export function linkedinHeadlines(role: string, skills: string): string {
  if (!role) return 'Enter your role first.';
  const sk = skills ? skills.split(',').map((s) => s.trim()) : [];
  return [
    `${role} | ${sk.join(' • ')} | Driving results through innovation`,
    `Passionate ${role} helping teams achieve more with ${sk[0] || 'expertise'} & ${sk[1] || 'leadership'}`,
    `${role} → ${sk.join(' + ')} | Building the future, one project at a time`,
  ].join('\n\n');
}

export function socialPost(topic: string, platform: string): string {
  if (!topic) return 'Enter a topic first.';
  if (platform === 'linkedin') {
    return `🚀 Excited to share: ${topic}\n\nThis has been a journey of growth, learning, and pushing boundaries. Here are 3 key takeaways:\n\n1️⃣ Every challenge is a learning opportunity\n2️⃣ Consistency beats perfection\n3️⃣ Your network is your net worth\n\nWhat's your experience with this? Drop your thoughts below! 👇\n\n#Growth #Leadership #WomenInTech #CareerDevelopment`;
  }
  if (platform === 'twitter') {
    return `${topic} 🧵\n\nA thread on what I learned:\n\n1/ The biggest lesson: start before you're ready.\n2/ Consistency > intensity. Always.\n3/ Surround yourself with people who push you forward.\n\nWhat would you add? 💭`;
  }
  return `✨ ${topic}\n\nSometimes the best stories come from unexpected places. This experience taught me that growth happens outside your comfort zone.\n\nDouble-tap if you agree! 💜\n\n#Motivation #WomenWhoLead #GrowthMindset`;
}

function getApiKey(): string {
  return (import.meta.env.VITE_GROQ_API_KEY || '').trim() || S().settings.apiKey || '';
}

function getGroqModel(): string {
  return (import.meta.env.VITE_GROQ_MODEL || '').trim() || 'llama-3.3-70b-versatile';
}

function userContextString(): string {
  const st = S();
  const pending = st.tasks.filter((t) => !t.done);
  const totalSpent = st.expenses.reduce((s, e) => s + e.amount, 0);
  const tin = totalBudgetIncome();
  const phase = getCyclePhase();
  return `User context — Name: ${st.user.name || 'User'}, Energy: ${st.user.energy}, Pending tasks: ${
    pending.length
  }, Skills tracking: ${st.skills.length}, Budget: total income ₹${tin} (salary ₹${st.finance.income} + side ₹${tin - st.finance.income}) / spent ₹${totalSpent}, Cycle phase: ${
    phase.text || 'not set'
  }, Recent moods: ${st.moods.slice(-3).map((m) => m.mood).join(', ') || 'none logged'}.`;
}

export async function callLLM(
  systemPrompt: string,
  messages: ChatTurn[],
  fallbackFn: () => string | Promise<string>,
  maxTokens = 700
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) return fallbackFn();
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: getGroqModel(),
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });
    if (!res.ok) return fallbackFn();
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content || (await fallbackFn());
  } catch {
    return fallbackFn();
  }
}

function liveDataForQuery(msg: string): string {
  const lower = msg.toLowerCase();
  const st = S();
  const parts: string[] = [];

  if (
    lower.includes('task') ||
    lower.includes('todo') ||
    lower.includes('productivity') ||
    lower.includes('work')
  ) {
    const pending = st.tasks.filter((t) => !t.done);
    const done = st.tasks.filter((t) => t.done);
    parts.push(
      `Tasks — ${pending.length} pending, ${done.length} completed. Pending: ${
        pending.map((t) => `${t.text} (${t.priority})`).join(', ') || 'none'
      }`
    );
  }
  if (
    lower.includes('budget') ||
    lower.includes('money') ||
    lower.includes('spend') ||
    lower.includes('finance') ||
    lower.includes('expense')
  ) {
    const total = st.expenses.reduce((s, e) => s + e.amount, 0);
    const tin = totalBudgetIncome();
    const remaining = tin - total;
    const cats: Record<string, number> = {};
    st.expenses.forEach((e) => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    parts.push(
      `Finance — Total income: ₹${tin} (salary ₹${st.finance.income}), Spent: ₹${total}, Remaining: ₹${remaining}. By category: ${
        Object.entries(cats)
          .map(([k, v]) => `${k}: ₹${v}`)
          .join(', ') || 'no expenses logged'
      }`
    );
  }
  if (
    lower.includes('mood') ||
    lower.includes('feel') ||
    lower.includes('stress') ||
    lower.includes('wellness')
  ) {
    const recent = st.moods.slice(-7);
    parts.push(
      `Recent moods (last 7): ${recent.map((m) => `${m.date}: ${m.mood}`).join(', ') || 'none logged'}`
    );
  }
  if (lower.includes('schedule') || lower.includes('plan') || lower.includes('calendar')) {
    const today = new Date().toISOString().slice(0, 10);
    const todayEvents = st.events.filter((e) => e.date === today);
    parts.push(
      `Today's events: ${todayEvents.map((e) => `${e.time} - ${e.title}`).join(', ') || 'none scheduled'}`
    );
  }
  if (lower.includes('cycle') || lower.includes('period')) {
    const phase = getCyclePhase();
    parts.push(`Cycle: ${phase.text || 'not set'}, Day ${phase.day || '?'}. ${phase.recs || ''}`);
  }
  if (lower.includes('grocery') || lower.includes('shopping') || lower.includes('buy')) {
    const pending = st.groceries.filter((g) => !g.bought);
    parts.push(
      `Grocery list (${pending.length} items): ${pending.map((g) => g.name).join(', ') || 'empty'}`
    );
  }
  if (lower.includes('energy')) {
    parts.push(`Current energy level: ${st.user.energy}`);
  }
  return parts.join('\n');
}

export function chatRuleBased(msg: string): string {
  const st = S();
  const lower = msg.toLowerCase();

  if (lower.includes('task') || lower.includes('todo') || lower.includes('productivity')) {
    const pending = st.tasks.filter((t) => !t.done);
    if (pending.length === 0)
      return 'You have no pending tasks! 🎉 Want to add some? Go to the Productivity section.';
    return `You have ${pending.length} pending tasks:\n\n${pending
      .map((t) => `• ${t.text} (${t.priority} priority)`)
      .join('\n')}\n\n💡 Tip: ${getEnergyTip(st.user.energy)}`;
  }
  if (lower.includes('schedule') || lower.includes('plan') || lower.includes('calendar')) {
    const wl = workloadLevel();
    return `Today's workload: ${wl.level}\n${wl.note}\n\nYou have ${st.events.length} events scheduled. Want me to auto-plan your day? Go to Smart Scheduler and click "AI Auto-Plan"!`;
  }
  if (
    lower.includes('budget') ||
    lower.includes('money') ||
    lower.includes('spend') ||
    lower.includes('finance') ||
    lower.includes('expense')
  ) {
    const total = st.expenses.reduce((s, e) => s + e.amount, 0);
    const tin = totalBudgetIncome();
    const remaining = tin - total;
    const sideSum = tin - st.finance.income;
    if (tin === 0)
      return "You haven't set your monthly income (or added side earnings) yet. Go to Finance → Set Income or Add side earning to get started with budgeting!";
    return `💰 Financial Summary:\n• Total income: ₹${tin.toLocaleString()} (salary ₹${st.finance.income.toLocaleString()}${sideSum > 0 ? ` + side ₹${sideSum.toLocaleString()}` : ''})\n• Spent: ₹${total.toLocaleString()}\n• Remaining: ₹${remaining.toLocaleString()}\n\n${
      total > tin * 0.8
        ? "⚠️ You're spending over 80% of total income. Review your expenses!"
        : '✅ Your spending is within budget. Keep it up!'
    }`;
  }
  if (lower.includes('mood') || lower.includes('feel') || lower.includes('stress') || lower.includes('wellness')) {
    const recent = st.moods.slice(-7);
    if (recent.length === 0)
      return "You haven't logged any moods yet. Go to Wellness and tell me how you're feeling! It helps me give better advice.";
    const stressCount = recent.filter((m) => m.mood === 'stressed' || m.mood === 'low').length;
    if (stressCount >= 3)
      return `I notice you've been feeling low/stressed ${stressCount} out of the last ${recent.length} days. 💜\n\nHere are some suggestions:\n• Take more breaks between tasks\n• Try a 5-minute breathing exercise\n• Consider lighter workload today\n• Talk to someone you trust\n\nYour well-being matters most.`;
    const phase = getCyclePhase();
    return `Your recent mood trend looks ${
      stressCount === 0 ? 'great' : 'mostly positive'
    }! Keep logging daily for better insights. ${phase.recs || ''}`;
  }
  if (lower.includes('cycle') || lower.includes('period')) {
    const phase = getCyclePhase();
    if (phase.phase === 'unknown')
      return 'Set your cycle dates in the Wellness section to get cycle-aware recommendations!';
    return `You're currently in: ${phase.text} (Day ${phase.day})\n\n${phase.recs}`;
  }
  if (lower.includes('grocery') || lower.includes('shopping') || lower.includes('buy')) {
    const pending = st.groceries.filter((g) => !g.bought);
    if (pending.length === 0) return 'Your grocery list is empty! Add items in the Home section.';
    return `🛒 Shopping list (${pending.length} items):\n${pending
      .map((g) => `• ${g.name} (${g.category})`)
      .join(
        '\n'
      )}\n\n📍 Smart Geo-Reminders will notify you when you're near a matching store!`;
  }
  if (lower.includes('learn') || lower.includes('skill') || lower.includes('study') || lower.includes('teach')) {
    return `🎓 I'm your AI Instructor!\n\nYour learning style: ${
      st.user.learningStyle
    }\n\nI can teach you anything — just tell me what skill you want to learn in the Learning section. I'll create:\n• Personalized micro-lessons\n• Practice tasks\n• Real-world applications\n\nCurrently tracking ${st.skills.length} skills.`;
  }
  if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey')) {
    return `${getGreeting()}! 👋 I'm your HER-AI AI.\n\nI can help with:\n• 📋 Tasks & productivity\n• 📅 Scheduling & planning\n• 💰 Finance & budgeting\n• 🎓 Learning & skills\n• 🏠 Home management\n• 💜 Wellness & mood\n• 👑 Leadership & communication\n• ✨ Personal branding\n\nJust ask me anything!`;
  }
  if (lower.includes('motivat') || lower.includes('inspir') || lower.includes('encourage')) {
    const quotes = [
      '"She believed she could, so she did." — R.S. Grey',
      '"The question isn\'t who\'s going to let me; it\'s who\'s going to stop me." — Ayn Rand',
      '"You are more powerful than you know; you are beautiful just as you are." — Melissa Etheridge',
      '"A woman with a voice is, by definition, a strong woman." — Melinda Gates',
      '"Success isn\'t about how much money you make; it\'s about the difference you make in people\'s lives." — Michelle Obama',
    ];
    return `💜 Here's something for you:\n\n${
      quotes[Math.floor(Math.random() * quotes.length)]
    }\n\nYou're doing amazing. Keep going! ✨`;
  }
  if (lower.includes('help') || lower.includes('what can you do')) {
    return `I'm HER-AI, your Life Operating System AI! Here's what I can help with:\n\n⚡ Productivity: "How are my tasks?" / "Auto-schedule my day"\n📅 Planning: "What's my schedule?" / "Plan my week"\n💰 Finance: "How's my budget?" / "Spending advice"\n🎓 Learning: "Teach me something" / "Learning progress"\n🏠 Home: "Grocery list" / "Meal plan"\n💜 Wellness: "How am I feeling?" / "Cycle phase"\n👑 Leadership: "Help me with emails"\n✨ Branding: "Help with LinkedIn"\n\nJust type naturally — I understand context! 🧠`;
  }
  return `I understand you're asking about "${msg}". Here are some things I can help with:\n\n• Type "tasks" to review your to-do list\n• Type "budget" for financial insights\n• Type "mood" for wellness check\n• Type "schedule" for your daily plan\n• Type "cycle" for cycle-phase recommendations\n\nI'm always learning to serve you better! 💜`;
}

export async function chatLLM(msg: string): Promise<string> {
  const st = useHerAIStore.getState();
  const history = [...st.chatHistory, { role: 'user' as const, content: msg }].slice(-20) as ChatTurn[];

  let result: string;
  if (!getApiKey()) {
    result = chatRuleBased(msg);
  } else {
    const userContext = userContextString();
    const liveData = liveDataForQuery(msg);
    const systemPrompt = `You are HER-AI, a warm, supportive AI Life Operating System designed for women. You help with productivity, scheduling, finance, wellness, learning, home management, leadership, and personal branding. Be conversational, empathetic, and actionable like a knowledgeable best friend. Use emojis naturally but not excessively. Keep responses concise (2-4 paragraphs max). Personalize using the user's data when relevant.\n\n${userContext}${
      liveData ? '\n\nRelevant live data:\n' + liveData : ''
    }`;
    result = await callLLM(systemPrompt, history, () => chatRuleBased(msg));
  }

  const nextHistory = [...history, { role: 'assistant' as const, content: result }].slice(-20) as ChatTurn[];
  useHerAIStore.setState({ chatHistory: nextHistory });
  return result;
}

export function instructorChat(msg: string): string {
  const style = S().user.learningStyle;
  const lower = msg.toLowerCase();
  const styleHints: Record<string, string> = {
    visual: "I'll use diagrams, examples, and visual step-by-step guides since you learn best visually.",
    reading:
      "I'll provide detailed written explanations with clear structure since you prefer reading/writing.",
    practical: "I'll give you hands-on exercises and real-world tasks since you learn by doing.",
    auditory: "I'll explain concepts conversationally, as if we're having a discussion.",
  };

  const detectTopic = (text: string): CourseKey | null => {
    if (text.includes('excel') || text.includes('spreadsheet')) return 'excel';
    if (text.includes('python') || text.includes('coding') || text.includes('programming'))
      return 'python';
    if (
      text.includes('communication') ||
      text.includes('speak') ||
      text.includes('presentation') ||
      text.includes('public')
    )
      return 'communication';
    if (
      text.includes('design') ||
      text.includes('ui') ||
      text.includes('graphic') ||
      text.includes('figma') ||
      text.includes('canva')
    )
      return 'design';
    return null;
  };

  const topic = detectTopic(lower);
  const curTopic = S().instructorTopic as InstructorTopicKey;

  if (topic && topic !== curTopic) {
    useHerAIStore.setState({ instructorTopic: topic, instructorWeek: 0 });
    const course = courseData[topic];
    return `Great choice! Let me create a personalized ${course.name} learning path for you.\n\n${styleHints[style] || styleHints.visual}\n\n${course.overview}`;
  }

  const currentCourseKey = useHerAIStore.getState().instructorTopic as CourseKey | null;
  if (currentCourseKey && courseData[currentCourseKey]) {
    const currentCourse = courseData[currentCourseKey];
    let weekIdx = useHerAIStore.getState().instructorWeek;

    const weekMatch = lower.match(/week\s*(\d)/);
    if (weekMatch) {
      const weekNum = parseInt(weekMatch[1]!, 10) - 1;
      if (weekNum >= 0 && weekNum < currentCourse.weeks.length) {
        useHerAIStore.setState({ instructorWeek: weekNum });
        const w = currentCourse.weeks[weekNum]!;
        return `📘 ${w.title}\n\n${w.lesson}\n\nType "practice" for hands-on tasks, "quiz" to test yourself, or "next" for the next week!`;
      }
    }

    if (lower.includes('next') || lower.includes('continue')) {
      weekIdx = Math.min(weekIdx + 1, currentCourse.weeks.length - 1);
      useHerAIStore.setState({ instructorWeek: weekIdx });
      const w = currentCourse.weeks[weekIdx]!;
      return `📘 ${w.title}\n\n${w.lesson}\n\nType "practice" for hands-on tasks, "quiz" to test yourself, or "next" for the next week!`;
    }

    if (
      lower.includes('practice') ||
      lower.includes('exercise') ||
      lower.includes('task') ||
      lower.includes('try') ||
      lower.includes('hands')
    ) {
      const w = currentCourse.weeks[weekIdx]!;
      return w.practice;
    }
    if (lower.includes('quiz') || lower.includes('test') || lower.includes('question')) {
      const w = currentCourse.weeks[weekIdx]!;
      return w.quiz;
    }
    if (
      lower.includes('certificate') ||
      lower.includes('complete') ||
      lower.includes('done') ||
      lower.includes('finish')
    ) {
      const st = S();
      const skillObj = st.skills.find((s) =>
        s.name.toLowerCase().includes(currentCourse.name.toLowerCase())
      );
      return `🎓 COURSE COMPLETION CERTIFICATE\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n  Congratulations, ${
        st.user.name || 'Learner'
      }!\n\n  You have completed:\n  📚 ${currentCourse.name} — ${
        currentCourse.weeks.length
      }-Week Micro-Course\n\n  Weeks Covered:\n${currentCourse.weeks
        .map((w) => `  ✅ ${w.title}`)
        .join('\n')}\n\n  Learning Style: ${style}\n  ${
        skillObj ? `Time Invested: ${skillObj.minutes} minutes` : ''
      }  Completed via: AI HER-OS Learning Module\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🌟 Keep learning! Start a new topic by typing a subject name.`;
    }
    if (
      lower.includes('lesson') ||
      lower.includes('teach') ||
      lower.includes('learn') ||
      lower.includes('explain') ||
      lower.includes('start')
    ) {
      const w = currentCourse.weeks[weekIdx]!;
      return `📘 ${w.title}\n\n${w.lesson}\n\nType "practice" for hands-on tasks, "quiz" to test yourself, or "next" for the next week!`;
    }
    if (
      lower.includes('overview') ||
      lower.includes('syllabus') ||
      lower.includes('topics') ||
      lower.includes('all weeks')
    ) {
      return `📚 ${currentCourse.name} — Full Syllabus\n\n${currentCourse.weeks
        .map((w, i) => `${i === weekIdx ? '👉' : '  '} ${w.title}`)
        .join('\n')}\n\nYou're currently on: ${currentCourse.weeks[weekIdx]!.title}\n\nType "week 1", "week 2" etc. to jump, or "next" to continue.`;
    }

    const w = currentCourse.weeks[weekIdx]!;
    return `You're currently studying: ${currentCourse.name} — ${w.title}\n\nHere's what you can do:\n• Type "lesson" — revisit the current lesson\n• Type "practice" — get hands-on tasks\n• Type "quiz" — test your knowledge\n• Type "next" — move to the next week\n• Type "overview" — see full syllabus\n• Type "certificate" — get completion summary\n\nOr type a new topic name (Excel, Python, Communication, Design) to switch courses!`;
  }

  if (!curTopic) {
    return `Welcome to the AI Instructor! 🎓\n\n${styleHints[style] || styleHints.visual}\n\nI have detailed 4-week courses ready for:\n\n📊 Excel — Formulas, VLOOKUP, Pivot Tables, Charts\n💻 Python — Variables, Loops, Functions, Mini-Project\n🗣️ Communication — Listening, PREP method, Body Language, Difficult Conversations\n🎨 Design — Color Theory, Layout, Canva/Figma, Brand Kit\n\nEach week has:\n• 📖 Detailed lesson\n• 📝 Practice tasks\n• 🧠 Quiz\n\nType any topic name to start! (e.g., "Excel" or "Python")`;
  }

  return `I can teach you these courses:\n\n📊 Excel  |  💻 Python  |  🗣️ Communication  |  🎨 Design\n\nType a topic name to start, or type "next" to continue your current course.`;
}

export async function rewriteEmailLLM(text: string, tone: string): Promise<string> {
  const systemPrompt = `You are a professional communication coach for women in leadership. Rewrite the user's email draft in a "${tone}" tone. Remove weak language ("I think", "sorry", "just wanted to"). Make it confident, clear, and impactful. Keep the same core message. Return ONLY the rewritten email, no commentary.`;
  return callLLM(systemPrompt, [{ role: 'user' as const, content: text }], () =>
    rewriteEmail(text, tone)
  );
}

export async function generatePitchLLM(role: string, achievement: string): Promise<string> {
  const systemPrompt = `You are a career branding expert. Generate a compelling, natural-sounding elevator pitch (60-90 seconds when spoken). Make it confident, memorable, and authentic. Return ONLY the pitch text, no labels or commentary.`;
  const userMsg = `Role: ${role}${achievement ? '\nKey achievement: ' + achievement : ''}`;
  return callLLM(systemPrompt, [{ role: 'user' as const, content: userMsg }], () =>
    generatePitch(role, achievement)
  );
}

export async function negotiationScriptLLM(
  current: string,
  desired: string,
  reason: string
): Promise<string> {
  if (!current || !desired) return 'Please fill in your salary details.';
  const systemPrompt = `You are a salary negotiation coach for women. Create a natural, confident negotiation script. Include specific talking points, how to handle objections, and closing statements. Make it feel like a real conversation, not a template. Return ONLY the script.`;
  const userMsg = `Current compensation: ${current}\nDesired compensation: ${desired}${
    reason ? '\nKey justification: ' + reason : ''
  }`;
  return callLLM(systemPrompt, [{ role: 'user' as const, content: userMsg }], () =>
    negotiationScript(current, desired, reason)
  );
}

export async function linkedinHeadlinesLLM(role: string, skills: string): Promise<string> {
  if (!role) return 'Enter your role first.';
  const systemPrompt = `You are a LinkedIn branding specialist. Generate exactly 3 compelling, professional LinkedIn headlines. Each should be unique in style — one value-driven, one achievement-focused, one personality-forward. Separate them with blank lines. Return ONLY the 3 headlines, no numbering or labels.`;
  const userMsg = `Role: ${role}${skills ? '\nSkills: ' + skills : ''}`;
  return callLLM(systemPrompt, [{ role: 'user' as const, content: userMsg }], () =>
    linkedinHeadlines(role, skills)
  );
}

export async function socialPostLLM(topic: string, platform: string): Promise<string> {
  if (!topic) return 'Enter a topic first.';
  const systemPrompt = `You are a social media strategist. Create one engaging ${
    platform || 'general'
  } post about the given topic. Match the platform's tone and format (LinkedIn = professional storytelling, Twitter = concise thread hooks, Instagram = visual + relatable). Include relevant hashtags. Return ONLY the post content.`;
  return callLLM(systemPrompt, [{ role: 'user' as const, content: topic }], () =>
    socialPost(topic, platform)
  );
}
