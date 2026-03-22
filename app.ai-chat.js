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
