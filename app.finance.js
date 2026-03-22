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

    const cats = {};
    S.expenses.forEach(e => { cats[e.category] = (cats[e.category] || 0) + e.amount; });
    document.getElementById('expenseCategories').innerHTML = Object.entries(cats).map(([k, v]) => `<div class="exp-cat">${k}: ₹${v.toLocaleString()}</div>`).join('');

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
