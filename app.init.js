document.addEventListener('DOMContentLoaded', function() {
  S.load();

  document.querySelectorAll('.nav-item').forEach(n => {
    n.addEventListener('click', function(e) {
      if (!this.dataset.page) return;
      e.preventDefault();
      const page = this.dataset.page;
      if (page) Router.go(page);
      document.getElementById('sidebar').classList.remove('open');
    });
  });

  document.getElementById('mobileMenu').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
  });

  Settings.load();

  Dashboard.render();

  if (S.geoReminders.length > 0) {
    Home.checkGeoLocation();
  }
  setInterval(function() {
    if (S.geoReminders.length > 0) {
      Home.checkGeoLocation();
    }
  }, 3 * 60 * 1000);
});
