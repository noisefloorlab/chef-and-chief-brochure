// Chef & Chief — shared chrome (nav, footer, mobile menu, tweaks, scroll fx, lightbox)
(function () {
  // ── Scroll reveal ────────────────────────────────────
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ── Nav scroll state ────────────────────────────────
  const nav = document.querySelector('.nav');
  if (nav && !nav.classList.contains('is-solid')) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── Mobile menu ─────────────────────────────────────
  const burger = document.querySelector('.nav__burger');
  const drawer = document.querySelector('.mobile-menu');
  if (burger && drawer) {
    burger.addEventListener('click', () => drawer.classList.add('is-open'));
    drawer.querySelector('.mobile-menu__close')?.addEventListener('click', () => drawer.classList.remove('is-open'));
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => drawer.classList.remove('is-open')));
  }

  // ── Lightbox (gallery) ───────────────────────────────
  const lb = document.querySelector('.lightbox');
  const lbImg = lb?.querySelector('img');
  const tiles = document.querySelectorAll('[data-lb-src]');
  let idx = 0;
  const srcs = [...tiles].map(t => t.dataset.lbSrc);
  const open = (i) => { idx = (i + srcs.length) % srcs.length; lbImg.src = srcs[idx]; lb.classList.add('is-open'); };
  tiles.forEach((t, i) => t.addEventListener('click', () => open(i)));
  lb?.querySelector('.lightbox__close')?.addEventListener('click', () => lb.classList.remove('is-open'));
  lb?.querySelector('.lightbox__prev')?.addEventListener('click', (e) => { e.stopPropagation(); open(idx - 1); });
  lb?.querySelector('.lightbox__next')?.addEventListener('click', (e) => { e.stopPropagation(); open(idx + 1); });
  lb?.addEventListener('click', (e) => { if (e.target === lb) lb.classList.remove('is-open'); });
  document.addEventListener('keydown', (e) => {
    if (!lb?.classList.contains('is-open')) return;
    if (e.key === 'Escape') lb.classList.remove('is-open');
    if (e.key === 'ArrowLeft') open(idx - 1);
    if (e.key === 'ArrowRight') open(idx + 1);
  });

  // ── Tweaks (edit-mode protocol) ──────────────────────
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "dark",
    "accent": "#A07848",
    "type": "jost",
    "serif": "cormorant"
  }/*EDITMODE-END*/;
  const state = { ...TWEAK_DEFAULTS };
  const panel = document.querySelector('.tweaks');

  const apply = () => {
    document.body.classList.toggle('is-light', state.theme === 'light');
    document.documentElement.style.setProperty('--cc-bronze', state.accent);
    document.documentElement.style.setProperty('--cc-bronze-light', state.accent === '#A07848' ? '#C09A6A' : state.accent);
    const fontMap = {
      jost: "'Jost', sans-serif",
      brandon: "'Brandon Grotesque', 'Jost', sans-serif",
      lato: "'Lato', 'Jost', sans-serif",
      outfit: "'Outfit', sans-serif",
      manrope: "'Manrope', sans-serif",
      italiana: "'Italiana', 'Jost', sans-serif",
    };
    const serifMap = {
      cormorant: "'Cormorant Garamond', serif",
      playfair:  "'Playfair Display', serif",
      garamond:  "'EB Garamond', serif",
      fraunces:  "'Fraunces', serif",
      minion:    "'Minion Pro', 'EB Garamond', serif",
    };
    document.documentElement.style.setProperty('--font-primary', fontMap[state.type] || fontMap.jost);
    document.documentElement.style.setProperty('--font-serif',   serifMap[state.serif] || serifMap.cormorant);
    // Sync active classes
    panel?.querySelectorAll('[data-tweak]').forEach(b => {
      const k = b.dataset.tweak, v = b.dataset.val;
      b.classList.toggle('is-active', String(state[k]) === String(v));
    });
  };

  panel?.querySelectorAll('[data-tweak]').forEach(b => {
    b.addEventListener('click', () => {
      const k = b.dataset.tweak, v = b.dataset.val;
      state[k] = v;
      apply();
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
    });
  });
  panel?.querySelector('.tweaks__close')?.addEventListener('click', () => {
    panel.classList.remove('is-open');
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  });

  // edit-mode protocol
  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.type === '__activate_edit_mode') panel?.classList.add('is-open');
    if (d.type === '__deactivate_edit_mode') panel?.classList.remove('is-open');
  });
  window.parent.postMessage({ type: '__edit_mode_available' }, '*');

  apply();
})();
