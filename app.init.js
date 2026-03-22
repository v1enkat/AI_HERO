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

  setInterval(function() {
    if (S.geoReminders.length > 0 && Math.random() > 0.7) {
      Home.simulateGeo();
    }
  }, 5 * 60 * 1000);
});
