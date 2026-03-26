import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { useHerAIStore } from '../../store/useHerAIStore';
import { calendarDateKey } from '../../utils/calendarDate';

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
  const sideIncomes = useHerAIStore((s) => s.sideIncomes);
  const finance = useHerAIStore((s) => s.finance);
  const addExpense = useHerAIStore((s) => s.addExpense);
  const removeExpense = useHerAIStore((s) => s.removeExpense);
  const addSideIncome = useHerAIStore((s) => s.addSideIncome);
  const removeSideIncome = useHerAIStore((s) => s.removeSideIncome);
  const setFinance = useHerAIStore((s) => s.setFinance);

  const [expModal, setExpModal] = useState(false);
  const [sideModal, setSideModal] = useState(false);
  const [incModal, setIncModal] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [tipsHtml, setTipsHtml] = useState('');

  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('Food');
  const [sideAmount, setSideAmount] = useState('');
  const [sideDesc, setSideDesc] = useState('');
  const [incomeIn, setIncomeIn] = useState(String(finance.income || ''));
  const [savingsIn, setSavingsIn] = useState(String(finance.savingsGoal || ''));

  const monthlyIncome = finance.income || 0;
  const sideIncomeTotal = sideIncomes.reduce((s, e) => s + e.amount, 0);
  const totalIncome = monthlyIncome + sideIncomeTotal;
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = totalIncome - totalSpent;
  const pct = totalIncome > 0 ? Math.min(100, (totalSpent / totalIncome) * 100) : 0;

  const cats: Record<string, number> = {};
  expenses.forEach((e) => {
    cats[e.category] = (cats[e.category] || 0) + e.amount;
  });

  const aiAdvice = () => {
    let tips = '<strong>🧠 AI Financial Analysis:</strong><br><br>';
    if (totalIncome === 0) {
      tips +=
        '⚠️ Set your monthly income and/or add side earnings first to get budgeting insights.';
    } else {
      const p = ((totalSpent / totalIncome) * 100).toFixed(0);
      tips += `You've spent ₹${totalSpent.toLocaleString()} (${p}% of <strong>total income</strong> ₹${totalIncome.toLocaleString()}) this period.<br><br>`;
      if (sideIncomeTotal > 0) {
        tips += `📥 Side / extra income: ₹${sideIncomeTotal.toLocaleString()} (on top of salary ₹${monthlyIncome.toLocaleString()})<br><br>`;
      }
      const top = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
      if (top) tips += `📊 Highest spending: <strong>${top[0]}</strong> at ₹${top[1].toLocaleString()}<br><br>`;
      if (totalSpent > totalIncome * 0.8)
        tips += "🚨 <strong>Alert:</strong> You're over 80% spent vs total income. Cut back on non-essentials.<br>";
      if (totalSpent < totalIncome * 0.5)
        tips += '✅ Great budgeting! You have room for savings or investments.<br>';
      tips +=
        '<br>💡 <strong>Micro-investment tip:</strong> Even ₹500/month in a SIP can compound meaningfully over years.';
      if (finance.savingsGoal > 0) {
        const saveable = totalIncome - totalSpent;
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
      date: calendarDateKey(),
    });
    setExpModal(false);
    setAmount('');
    setDesc('');
  };

  const submitSideIncome = () => {
    const a = parseFloat(sideAmount);
    if (!a || a <= 0) return;
    addSideIncome({
      amount: a,
      desc: sideDesc.trim() || 'Side income',
      date: calendarDateKey(),
    });
    setSideModal(false);
    setSideAmount('');
    setSideDesc('');
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
        <button type="button" className="btn btn-primary" onClick={() => setSideModal(true)}>
          + Add side earning
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
          <div className="fs-label">Monthly income (salary)</div>
          <div className="fs-value">₹{monthlyIncome.toLocaleString()}</div>
        </div>
        <div className="fs-card side-income">
          <div className="fs-label">Side / extra earned</div>
          <div className="fs-value">₹{sideIncomeTotal.toLocaleString()}</div>
        </div>
        <div className="fs-card total-income">
          <div className="fs-label">Total income</div>
          <div className="fs-value">₹{totalIncome.toLocaleString()}</div>
          <div className="fs-hint">Salary + side earnings — used for budget</div>
        </div>
        <div className="fs-card spent">
          <div className="fs-label">Spent (all logged)</div>
          <div className="fs-value">₹{totalSpent.toLocaleString()}</div>
        </div>
        <div className="fs-card remaining">
          <div className="fs-label">Remaining</div>
          <div className="fs-value">₹{remaining.toLocaleString()}</div>
        </div>
        <div className="fs-card savings">
          <div className="fs-label">Savings goal</div>
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

      {sideIncomes.length > 0 && (
        <div className="side-income-section">
          <h3 className="sis-title">Side earnings</h3>
          <div className="side-income-list">
            {[...sideIncomes].reverse().map((e) => (
              <div key={e.id} className="side-income-item">
                <span className="sii-icon">📥</span>
                <div className="sii-info">
                  <div className="sii-name">{e.desc}</div>
                  <div className="sii-date">{e.date}</div>
                </div>
                <div className="sii-amount">+₹{e.amount.toLocaleString()}</div>
                <button type="button" className="sii-delete" onClick={() => removeSideIncome(e.id)} aria-label="Remove">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <Modal open={sideModal} title="Add side earning" onClose={() => setSideModal(false)}>
        <p className="muted small" style={{ marginBottom: '0.75rem' }}>
          Extra money on top of your monthly salary (freelance, gift, refund, etc.). This increases your total income
          for remaining balance and budget %.
        </p>
        <label htmlFor="sa">Amount (₹)</label>
        <input id="sa" type="number" min={0} step="0.01" value={sideAmount} onChange={(e) => setSideAmount(e.target.value)} />
        <label htmlFor="sd">Description (where it came from)</label>
        <input
          id="sd"
          placeholder="e.g. Freelance project, birthday gift, sold item…"
          value={sideDesc}
          onChange={(e) => setSideDesc(e.target.value)}
        />
        <button type="button" className="btn btn-primary" onClick={submitSideIncome}>
          Add to total income
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
