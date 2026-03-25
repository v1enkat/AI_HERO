import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { useHerAIStore } from '../../store/useHerAIStore';

const catIcons: Record<string, string> = {
  Food: '🍽️',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '📄',
  Health: '💊',
  Entertainment: '🎬',
  Education: '📚',
  Other: '📦',
};

export function FinancePage() {
  const expenses = useHerAIStore((s) => s.expenses);
  const finance = useHerAIStore((s) => s.finance);
  const addExpense = useHerAIStore((s) => s.addExpense);
  const removeExpense = useHerAIStore((s) => s.removeExpense);
  const setFinance = useHerAIStore((s) => s.setFinance);

  const [expModal, setExpModal] = useState(false);
  const [incModal, setIncModal] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [tipsHtml, setTipsHtml] = useState('');

  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('Food');
  const [incomeIn, setIncomeIn] = useState(String(finance.income || ''));
  const [savingsIn, setSavingsIn] = useState(String(finance.savingsGoal || ''));

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = finance.income - total;
  const pct = finance.income > 0 ? Math.min(100, (total / finance.income) * 100) : 0;

  const cats: Record<string, number> = {};
  expenses.forEach((e) => {
    cats[e.category] = (cats[e.category] || 0) + e.amount;
  });

  const aiAdvice = () => {
    let tips = '<strong>🧠 AI Financial Analysis:</strong><br><br>';
    if (finance.income === 0) {
      tips += '⚠️ Set your monthly income first to get budgeting insights.';
    } else {
      const p = ((total / finance.income) * 100).toFixed(0);
      tips += `You've spent ₹${total.toLocaleString()} (${p}% of income) this month.<br><br>`;
      const top = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
      if (top) tips += `📊 Highest spending: <strong>${top[0]}</strong> at ₹${top[1].toLocaleString()}<br><br>`;
      if (total > finance.income * 0.8)
        tips += "🚨 <strong>Alert:</strong> You're over 80% spent. Cut back on non-essentials.<br>";
      if (total < finance.income * 0.5)
        tips += '✅ Great budgeting! You have room for savings or investments.<br>';
      tips +=
        '<br>💡 <strong>Micro-investment tip:</strong> Even ₹500/month in a SIP can compound meaningfully over years.';
      if (finance.savingsGoal > 0) {
        const saveable = finance.income - total;
        tips += `<br><br>🎯 Savings goal: ₹${finance.savingsGoal.toLocaleString()} | Saveable: ₹${saveable.toLocaleString()} ${
          saveable >= finance.savingsGoal ? '✅ On track!' : '⚠️ Tighten spending'
        }`;
      }
    }
    setTipsHtml(tips);
    setTipsOpen(true);
  };

  const submitExpense = () => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return;
    addExpense({
      amount: a,
      desc: desc.trim() || 'Expense',
      category: cat,
      date: new Date().toISOString().slice(0, 10),
    });
    setExpModal(false);
    setAmount('');
    setDesc('');
  };

  const submitIncome = () => {
    setFinance({
      income: parseFloat(incomeIn) || 0,
      savingsGoal: parseFloat(savingsIn) || 0,
    });
    setIncModal(false);
  };

  const fillStyle =
    pct > 80
      ? { width: `${pct}%`, background: 'linear-gradient(90deg, #E8526F, #D4A853)' }
      : { width: `${pct}%` };

  return (
    <section className="page active">
      <div className="page-header">
        <h1 className="page-title">💰 Money Mentor</h1>
        <p className="page-sub">AI-powered budgeting & financial awareness</p>
      </div>

      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={() => setExpModal(true)}>
          + Log Expense
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setIncModal(true)}>
          💵 Set Income
        </button>
        <button type="button" className="btn btn-ghost" onClick={aiAdvice}>
          🧠 AI Money Advice
        </button>
      </div>

      <div className="finance-stats">
        <div className="fs-card income">
          <div className="fs-label">Monthly Income</div>
          <div className="fs-value">₹{finance.income.toLocaleString()}</div>
        </div>
        <div className="fs-card spent">
          <div className="fs-label">Spent This Month</div>
          <div className="fs-value">₹{total.toLocaleString()}</div>
        </div>
        <div className="fs-card remaining">
          <div className="fs-label">Remaining</div>
          <div className="fs-value">₹{remaining.toLocaleString()}</div>
        </div>
        <div className="fs-card savings">
          <div className="fs-label">Savings Goal</div>
          <div className="fs-value">₹{finance.savingsGoal.toLocaleString()}</div>
        </div>
      </div>

      <div className="budget-visual" id="budgetVisual">
        <div className="bv-header">
          <span>Budget Usage</span>
          <span id="budgetPercent">{pct.toFixed(0)}%</span>
        </div>
        <div className="bv-bar">
          <div className="bv-fill" id="budgetFill" style={fillStyle} />
        </div>
      </div>

      <div className="expense-categories" id="expenseCategories">
        {Object.entries(cats).map(([k, v]) => (
          <div key={k} className="exp-cat">
            {k}: ₹{v.toLocaleString()}
          </div>
        ))}
      </div>

      <div className="expense-list" id="expenseList">
        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <div className="empty-text">No expenses logged. Start tracking your spending!</div>
          </div>
        ) : (
          [...expenses].reverse().map((e) => (
            <div key={e.id} className="expense-item">
              <span className="ei-icon">{catIcons[e.category] ?? '📦'}</span>
              <div className="ei-info">
                <div className="ei-name">{e.desc}</div>
                <div className="ei-date">
                  {e.date} · {e.category}
                </div>
              </div>
              <div className="ei-amount">-₹{e.amount.toLocaleString()}</div>
              <button type="button" className="ei-delete" onClick={() => removeExpense(e.id)}>
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {tipsOpen && (
        <div className="ai-tips-card" id="financeTips">
          <div className="ait-header">🧠 AI Money Insights</div>
          <div className="ait-body" id="finTipsBody" dangerouslySetInnerHTML={{ __html: tipsHtml }} />
          <button type="button" className="btn btn-ghost" onClick={() => setTipsOpen(false)}>
            Close
          </button>
        </div>
      )}

      <Modal open={expModal} title="Log Expense" onClose={() => setExpModal(false)}>
        <label htmlFor="ea">Amount (₹)</label>
        <input id="ea" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <label htmlFor="ed">Description</label>
        <input id="ed" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <label htmlFor="ec">Category</label>
        <select id="ec" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="Food">🍽️ Food</option>
          <option value="Transport">🚗 Transport</option>
          <option value="Shopping">🛍️ Shopping</option>
          <option value="Bills">📄 Bills</option>
          <option value="Health">💊 Health</option>
          <option value="Entertainment">🎬 Entertainment</option>
          <option value="Education">📚 Education</option>
          <option value="Other">📦 Other</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={submitExpense}>
          Log Expense
        </button>
      </Modal>

      <Modal open={incModal} title="Set Income & Savings" onClose={() => setIncModal(false)}>
        <label htmlFor="inc">Monthly Income (₹)</label>
        <input id="inc" type="number" value={incomeIn} onChange={(e) => setIncomeIn(e.target.value)} />
        <label htmlFor="sav">Monthly Savings Goal (₹)</label>
        <input id="sav" type="number" value={savingsIn} onChange={(e) => setSavingsIn(e.target.value)} />
        <button type="button" className="btn btn-primary" onClick={submitIncome}>
          Save
        </button>
      </Modal>
    </section>
  );
}
