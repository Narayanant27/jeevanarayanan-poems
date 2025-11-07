// utils.js
async function fetchJSON(url) {
  const noCacheUrl = `${url}?v=${Date.now()}`; // ⬅️ forces fresh load every time
  const res = await fetch(noCacheUrl);
  if (!res.ok) throw new Error("Failed to fetch " + url);
  return res.json();
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadFromStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

/* Theme management: toggle between light and dark and persist choice */
function applyTheme(theme){
  try{
    document.documentElement.setAttribute('data-theme', theme);
    saveToStorage('theme', theme);
    // update toggle button icon if exists
    const btn = document.getElementById('themeToggle');
    if(btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }catch(e){ /* ignore for non-DOM contexts */ }
}

function initTheme(){
  // priority: saved preference -> system preference -> light
  const saved = loadFromStorage('theme');
  if(saved){ applyTheme(saved); return saved; }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const chosen = prefersDark ? 'dark' : 'light';
  applyTheme(chosen);
  return chosen;
}

// Attach toggle handler if button present. This runs when utils.js is loaded.
document.addEventListener('DOMContentLoaded', ()=>{
  // set header height variable so CSS sticky/fixed offsets remain accurate
  updateHeaderHeight();
  // keep header height updated on resize
  window.addEventListener('resize', updateHeaderHeight);

  // initialize theme based on saved or system
  initTheme();

  const btn = document.getElementById('themeToggle');
  if(btn){
    btn.addEventListener('click', ()=>{
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }
  // initialize font selection
  initFont();
  // font selector wiring
  const fontSelect = document.getElementById('fontSelect');
  if(fontSelect){
    fontSelect.value = loadFromStorage('font') || 'noto-sans';
    fontSelect.addEventListener('change', (e)=>{
      applyFont(e.target.value);
    });
  }

  // set footer year if element exists
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Back to top button wiring
  const backBtn = document.getElementById('backToTop');
  if(backBtn){
    // show when scrolled down
    const toggle = ()=>{
      const show = window.scrollY > 200;
      backBtn.classList.toggle('hidden', !show);
    };
    // initial
    toggle();
    window.addEventListener('scroll', toggle, {passive:true});
    backBtn.addEventListener('click', ()=>{
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // hide after click
      backBtn.classList.add('hidden');
    });
  }
});

// Measure header height and set CSS variable --header-height
function updateHeaderHeight(){
  try{
    const h = document.querySelector('header') ? document.querySelector('header').offsetHeight : 92;
    document.documentElement.style.setProperty('--header-height', h + 'px');
  }catch(e){ /* ignore */ }
}

/* Font management: apply and persist user font choice */
function applyFont(key){
  const map = {
    'noto-sans': "'Noto Sans Tamil', Inter, system-ui, -apple-system, sans-serif",
    'noto-serif': "'Noto Serif Tamil', Georgia, 'Times New Roman', serif",
    'baloo': "'Baloo 2', 'Noto Sans Tamil', Inter, system-ui, -apple-system, sans-serif"
  };
  const font = map[key] || map['noto-sans'];
  try{
    document.documentElement.style.setProperty('--ui-font', font);
    saveToStorage('font', key);
  }catch(e){}
}

function initFont(){
  const saved = loadFromStorage('font') || 'noto-sans';
  applyFont(saved);
  return saved;
}
