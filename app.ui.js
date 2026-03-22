const Modal = {
  open(title, html) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modal').classList.add('open');
    document.getElementById('modalOverlay').classList.add('open');
  },
  close() {
    document.getElementById('modal').classList.remove('open');
    document.getElementById('modalOverlay').classList.remove('open');
  }
};

function toast(msg, type = 'info') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.innerHTML = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function dateStr(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
