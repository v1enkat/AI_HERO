const AIChat = {
  async send() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    const container = document.getElementById('chatMessages');
    container.innerHTML += `<div class="chat-msg user"><div class="cm-avatar">👩</div><div class="cm-bubble"><div class="cm-text">${esc(msg)}</div></div></div>`;
    container.scrollTop = container.scrollHeight;

    const thinkingId = 'thinking-' + Date.now();
    container.innerHTML += `<div class="chat-msg ai" id="${thinkingId}"><div class="cm-avatar">🧠</div><div class="cm-bubble"><div class="cm-text typing-indicator"><span></span><span></span><span></span></div></div></div>`;
    container.scrollTop = container.scrollHeight;

    try {
      const response = await AI.chatLLM(msg);
      const thinkingEl = document.getElementById(thinkingId);
      if (thinkingEl) {
        thinkingEl.querySelector('.cm-text').innerHTML = response.replace(/\n/g, '<br>');
        thinkingEl.querySelector('.cm-text').classList.remove('typing-indicator');
      }
    } catch (e) {
      const thinkingEl = document.getElementById(thinkingId);
      if (thinkingEl) {
        thinkingEl.querySelector('.cm-text').innerHTML = '⚠️ Could not reach the AI service. Please check your API key in Settings.';
        thinkingEl.querySelector('.cm-text').classList.remove('typing-indicator');
      }
    }
    container.scrollTop = container.scrollHeight;
  }
};
