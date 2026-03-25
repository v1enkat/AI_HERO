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
  snoozeGeo() {
    document.getElementById('geoPopup').style.display = 'none';
    this._snoozedUntil = Date.now() + 30 * 60 * 1000;
    toast('📍 Will remind again in 30 minutes.', 'info');
  },
  _lastGeoCheck: null,
  _snoozedUntil: 0,
  checkGeoLocation() {
    if (this._snoozedUntil && Date.now() < this._snoozedUntil) return;
    const active = S.geoReminders.filter(g => !g.dismissed && g.items.length > 0);
    if (active.length === 0) return;

    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        this._lastGeoCheck = { lat: latitude, lng: longitude, time: Date.now() };

        const locationEl = document.getElementById('geoLocationStatus');
        if (locationEl) locationEl.textContent = `📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18&addressdetails=1`)
          .then(r => r.json())
          .then(data => {
            const address = (data.display_name || '').toLowerCase();
            const nearby = data.address || {};
            const placeWords = [address, nearby.shop || '', nearby.amenity || '', nearby.building || '', nearby.road || ''].join(' ').toLowerCase();

            for (const g of active) {
              const storeLower = g.store.toLowerCase();
              const categoryKeywords = {
                grocery: ['grocery', 'supermarket', 'market', 'mart', 'store', 'shop', 'kirana', 'bazaar', 'fresh'],
                medical: ['pharmacy', 'medical', 'chemist', 'drug', 'apollo', 'medplus', 'health'],
                household: ['hardware', 'home', 'household', 'general store', 'department']
              };
              const keywords = categoryKeywords[g.category] || [];
              const isNearMatch = placeWords.includes(storeLower) || keywords.some(kw => placeWords.includes(kw));

              if (isNearMatch) {
                document.getElementById('geoPopupTitle').textContent = `📍 You're near ${g.store}!`;
                document.getElementById('geoPopupBody').textContent = `Buy: ${g.items.join(', ')}`;
                document.getElementById('geoPopup').style.display = 'flex';
                return;
              }
            }
          })
          .catch(err => console.warn('Geo lookup failed:', err));
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        const locationEl = document.getElementById('geoLocationStatus');
        if (locationEl) locationEl.textContent = `⚠️ Location access denied — enable in browser settings`;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  },
  simulateGeoFor(id) {
    const g = S.geoReminders.find(g => g.id === id);
    if (g) {
      document.getElementById('geoPopupTitle').textContent = `📍 You're near ${g.store}!`;
      document.getElementById('geoPopupBody').textContent = `Buy: ${g.items.join(', ')}`;
      document.getElementById('geoPopup').style.display = 'flex';
    }
  },
  render() {
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

    if (S.familyEvents.length === 0) {
      document.getElementById('familySchedule').innerHTML = '<div class="empty-state"><div class="empty-icon">👨‍👩‍👧</div><div class="empty-text">No family events.</div></div>';
    } else {
      document.getElementById('familySchedule').innerHTML = S.familyEvents.map(f => `
        <div class="grocery-item"><span class="gi-name">${esc(f.event)}</span><span class="gi-cat">${f.date || 'No date'} · ${f.who}</span><button class="gi-remove" onclick="Home.removeFamily(${f.id})">×</button></div>
      `).join('');
    }

    const geoStatusText = this._lastGeoCheck
      ? `📍 Location: ${this._lastGeoCheck.lat.toFixed(4)}, ${this._lastGeoCheck.lng.toFixed(4)}`
      : '📍 Waiting for location...';
    document.getElementById('geoList').innerHTML = `
      <div id="geoLocationStatus" style="font-size:0.8rem;color:var(--text-light);margin-bottom:0.5rem;">${geoStatusText}</div>
    ` + (S.geoReminders.length === 0
      ? '<div class="empty-state"><div class="empty-icon">📍</div><div class="empty-text">No geo-reminders. Add a store to get notified when nearby!</div></div>'
      : S.geoReminders.map(g => `
        <div class="geo-reminder-item">
          <span>📍</span>
          <span style="flex:1"><strong>${esc(g.store)}</strong> (${g.category}) ${g.favorite ? '⭐' : ''}<br><small>${g.items.join(', ')}</small></span>
          <button class="btn btn-sm" onclick="Home.simulateGeoFor(${g.id})">Test</button>
          <button class="gi-remove" onclick="Home.removeGeo(${g.id})">×</button>
        </div>
      `).join(''));
  },
  removeFamily(id) { S.familyEvents = S.familyEvents.filter(f => f.id !== id); S.save(); this.render(); },
  removeGeo(id) { S.geoReminders = S.geoReminders.filter(g => g.id !== id); S.save(); this.render(); }
};
