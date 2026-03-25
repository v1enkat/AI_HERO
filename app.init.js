document.addEventListener('DOMContentLoaded', function() {
  S.load();

  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');

  document.querySelectorAll('.nav-item').forEach(n => {
    n.addEventListener('click', function(e) {
      if (!this.dataset.page) return;
      e.preventDefault();
      const page = this.dataset.page;
      if (page) Router.go(page);
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  });

  document.getElementById('mobileMenu').addEventListener('click', function() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  });

  overlay.addEventListener('click', function() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
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
