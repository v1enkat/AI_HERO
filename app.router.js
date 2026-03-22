const Router = {
  go(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const el = document.getElementById('page-' + page);
    if (el) el.classList.add('active');
    const nav = document.querySelector(`[data-page="${page}"]`);
    if (nav) nav.classList.add('active');
    this.refresh(page);
  },
  refresh(page) {
    if (page === 'dashboard') Dashboard.render();
    if (page === 'productivity') Productivity.render();
    if (page === 'scheduler') Scheduler.render();
    if (page === 'learning') Learning.render();
    if (page === 'home') Home.render();
    if (page === 'finance') Finance.render();
    if (page === 'wellness') Wellness.render();
    if (page === 'branding') Branding.render();
  }
};
