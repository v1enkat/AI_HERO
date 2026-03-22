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
