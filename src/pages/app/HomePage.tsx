import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useHerAIStore } from '../../store/useHerAIStore';
import { generateMealPlan } from '../../services/aiEngine';

export function HomePage() {
  const { toast } = useToast();
  const groceries = useHerAIStore((s) => s.groceries);
  const mealPlan = useHerAIStore((s) => s.mealPlan);
  const familyEvents = useHerAIStore((s) => s.familyEvents);
  const geoReminders = useHerAIStore((s) => s.geoReminders);
  const addGrocery = useHerAIStore((s) => s.addGrocery);
  const toggleGrocery = useHerAIStore((s) => s.toggleGrocery);
  const removeGrocery = useHerAIStore((s) => s.removeGrocery);
  const setMealPlan = useHerAIStore((s) => s.setMealPlan);
  const addFamilyEvent = useHerAIStore((s) => s.addFamilyEvent);
  const removeFamilyEvent = useHerAIStore((s) => s.removeFamilyEvent);
  const addGeoReminder = useHerAIStore((s) => s.addGeoReminder);
  const removeGeoReminder = useHerAIStore((s) => s.removeGeoReminder);

  const [tab, setTab] = useState<'grocery' | 'meal' | 'family' | 'geo'>('grocery');
  const [gModal, setGModal] = useState(false);
  const [fModal, setFModal] = useState(false);
  const [geoModal, setGeoModal] = useState(false);

  const [gName, setGName] = useState('');
  const [gCat, setGCat] = useState('grocery');
  const [fEvent, setFEvent] = useState('');
  const [fDate, setFDate] = useState('');
  const [fWho, setFWho] = useState('');
  const [geoStore, setGeoStore] = useState('');
  const [geoCat, setGeoCat] = useState('grocery');
  const [geoItems, setGeoItems] = useState('');
  const [geoFav, setGeoFav] = useState(false);

  const [geoPopup, setGeoPopup] = useState<{ title: string; body: string } | null>(null);

  const aiGrocery = () => {
    const needed = ['Milk', 'Eggs', 'Rice', 'Dal', 'Vegetables', 'Bread', 'Fruits', 'Curd'];
    const existing = groceries.map((g) => g.name.toLowerCase());
    const toAdd = needed.filter((n) => !existing.includes(n.toLowerCase()));
    toAdd.forEach((name) => addGrocery({ name, category: 'grocery' }));
    toast(`🧠 AI suggested ${toAdd.length} grocery items!`, 'success');
  };

  const genMeals = () => {
    setMealPlan(generateMealPlan());
    toast('🍽️ AI generated your weekly meal plan!', 'success');
  };

  const submitGrocery = () => {
    const n = gName.trim();
    if (!n) return;
    addGrocery({ name: n, category: gCat });
    setGModal(false);
    setGName('');
    toast('🛒 Item added!', 'success');
  };

  const submitFamily = () => {
    const e = fEvent.trim();
    if (!e) return;
    addFamilyEvent({ event: e, date: fDate, who: fWho });
    setFModal(false);
    setFEvent('');
    toast('👨‍👩‍👧 Family event added!', 'success');
  };

  const submitGeo = () => {
    const s = geoStore.trim();
    if (!s) return;
    addGeoReminder({
      store: s,
      category: geoCat,
      items: geoItems.split(',').map((i) => i.trim()).filter(Boolean),
      favorite: geoFav,
    });
    setGeoModal(false);
    setGeoStore('');
    setGeoItems('');
    toast('📍 Geo-Reminder added!', 'success');
  };

  const simulateGeo = (id: number) => {
    const g = geoReminders.find((x) => x.id === id);
    if (g) setGeoPopup({ title: `📍 You're near ${g.store}!`, body: `Buy: ${g.items.join(', ')}` });
  };

  return (
    <section className="page active">
      <div className="page-header">
        <h1 className="page-title">🏠 Home & Family</h1>
        <p className="page-sub">Groceries, meals, family calendar, geo-reminders</p>
      </div>

      <div className="home-tabs">
        {(
          [
            ['grocery', '🛒 Groceries'],
            ['meal', '🍽️ Meal Plan'],
            ['family', '👨‍👩‍👧 Family'],
            ['geo', '📍 Geo'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            className={'htab' + (tab === k ? ' active' : '')}
            onClick={() => setTab(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'grocery' && (
        <div className="home-panel active">
          <div className="toolbar">
            <button type="button" className="btn btn-primary" onClick={() => setGModal(true)}>
              + Add Item
            </button>
            <button type="button" className="btn btn-ghost" onClick={aiGrocery}>
              🧠 AI suggest staples
            </button>
          </div>
          <div className="grocery-list">
            {groceries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛒</div>
                <div className="empty-text">Your grocery list is empty</div>
              </div>
            ) : (
              groceries.map((g) => (
                <div key={g.id} className={'grocery-item' + (g.bought ? ' bought' : '')}>
                  <button
                    type="button"
                    className={'gi-check' + (g.bought ? ' checked' : '')}
                    onClick={() => toggleGrocery(g.id)}
                  />
                  <span className="gi-name">{g.name}</span>
                  <span className="gi-cat">{g.category}</span>
                  <button type="button" className="gi-remove" onClick={() => removeGrocery(g.id)}>
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'meal' && (
        <div className="home-panel active">
          <div className="toolbar">
            <button type="button" className="btn btn-primary" onClick={genMeals}>
              🧠 Generate meal plan
            </button>
          </div>
          <div id="mealPlan">
            {mealPlan.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <div className="empty-text">No meal plan yet. Let AI create one!</div>
              </div>
            ) : (
              mealPlan.map((m) => (
                <div key={m.day} className="meal-day">
                  <h4>{m.day}</h4>
                  <div className="meal-item">🌅 Breakfast: {m.breakfast}</div>
                  <div className="meal-item">☀️ Lunch: {m.lunch}</div>
                  <div className="meal-item">🌙 Dinner: {m.dinner}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'family' && (
        <div className="home-panel active">
          <div className="toolbar">
            <button type="button" className="btn btn-primary" onClick={() => setFModal(true)}>
              + Family event
            </button>
          </div>
          <div id="familySchedule">
            {familyEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👨‍👩‍👧</div>
                <div className="empty-text">No family events.</div>
              </div>
            ) : (
              familyEvents.map((f) => (
                <div key={f.id} className="grocery-item">
                  <span className="gi-name">{f.event}</span>
                  <span className="gi-cat">
                    {f.date || 'No date'} · {f.who}
                  </span>
                  <button type="button" className="gi-remove" onClick={() => removeFamilyEvent(f.id)}>
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'geo' && (
        <div className="home-panel active">
          <div className="toolbar">
            <button type="button" className="btn btn-primary" onClick={() => setGeoModal(true)}>
              + Geo-reminder
            </button>
          </div>
          <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1rem' }}>
            Add a store and items. Use <strong>Test</strong> to preview the reminder popup (full geolocation
            uses your browser when you allow location).
          </p>
          <div id="geoList">
            {geoReminders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📍</div>
                <div className="empty-text">No geo-reminders yet.</div>
              </div>
            ) : (
              geoReminders.map((g) => (
                <div key={g.id} className="geo-reminder-item">
                  <span>📍</span>
                  <span style={{ flex: 1 }}>
                    <strong>{g.store}</strong> ({g.category}) {g.favorite ? '⭐' : ''}
                    <br />
                    <small>{g.items.join(', ')}</small>
                  </span>
                  <button type="button" className="btn btn-sm" onClick={() => simulateGeo(g.id)}>
                    Test
                  </button>
                  <button type="button" className="gi-remove" onClick={() => removeGeoReminder(g.id)}>
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <Modal open={gModal} title="Add Grocery Item" onClose={() => setGModal(false)}>
        <label htmlFor="gn">Item Name</label>
        <input id="gn" value={gName} onChange={(e) => setGName(e.target.value)} placeholder="Milk" />
        <label htmlFor="gc">Category</label>
        <select id="gc" value={gCat} onChange={(e) => setGCat(e.target.value)}>
          <option value="grocery">🥦 Grocery</option>
          <option value="medical">💊 Medical</option>
          <option value="household">🏠 Household</option>
          <option value="kids">👶 Kids</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={submitGrocery}>
          Add Item
        </button>
      </Modal>

      <Modal open={fModal} title="Add Family Event" onClose={() => setFModal(false)}>
        <label htmlFor="fe">Event</label>
        <input id="fe" value={fEvent} onChange={(e) => setFEvent(e.target.value)} />
        <label htmlFor="fd">Date</label>
        <input id="fd" type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
        <label htmlFor="fw">For</label>
        <input id="fw" value={fWho} onChange={(e) => setFWho(e.target.value)} placeholder="Self, kid…" />
        <button type="button" className="btn btn-primary" onClick={submitFamily}>
          Add Event
        </button>
      </Modal>

      <Modal open={geoModal} title="Add Geo-Reminder" onClose={() => setGeoModal(false)}>
        <label htmlFor="gs">Store Name</label>
        <input id="gs" value={geoStore} onChange={(e) => setGeoStore(e.target.value)} />
        <label htmlFor="gsc">Category</label>
        <select id="gsc" value={geoCat} onChange={(e) => setGeoCat(e.target.value)}>
          <option value="grocery">🥦 Grocery</option>
          <option value="medical">💊 Medical</option>
          <option value="household">🏠 Household</option>
        </select>
        <label htmlFor="gi">Items to buy</label>
        <input
          id="gi"
          value={geoItems}
          onChange={(e) => setGeoItems(e.target.value)}
          placeholder="Milk, Eggs"
        />
        <label>
          <input
            type="checkbox"
            checked={geoFav}
            onChange={(e) => setGeoFav(e.target.checked)}
          />{' '}
          Favorite store
        </label>
        <button type="button" className="btn btn-primary" onClick={submitGeo}>
          Add Geo-Reminder
        </button>
      </Modal>

      {geoPopup && (
        <Modal open title={geoPopup.title} onClose={() => setGeoPopup(null)}>
          <p>{geoPopup.body}</p>
          <button type="button" className="btn btn-primary" onClick={() => setGeoPopup(null)}>
            OK
          </button>
        </Modal>
      )}
    </section>
  );
}
