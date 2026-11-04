// Shared behaviour: menu hover highlight, full-screen menu, footer year.
(function () {
  const menu = document.querySelector('.menu');
  const glow = document.querySelector('.menu-glow');
  if (menu && glow) {
    menu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('mouseenter', () => {
        glow.style.width = a.offsetWidth + 'px';
        glow.style.transform = `translateX(${a.offsetLeft - 4}px)`;
        glow.style.left = '4px';
        glow.style.opacity = 1;
      });
    });
    menu.addEventListener('mouseleave', () => { glow.style.opacity = 0; });
  }

  const overlay = document.querySelector('[data-menu]');
  const openBtn = document.querySelector('[data-menu-open]');
  const closeBtn = document.querySelector('[data-menu-close]');
  const close = () => { overlay.hidden = true; openBtn.setAttribute('aria-expanded', 'false'); openBtn.focus(); };
  if (overlay && openBtn) {
    openBtn.addEventListener('click', () => {
      overlay.hidden = false; openBtn.setAttribute('aria-expanded', 'true'); closeBtn.focus();
    });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) close(); });
  }

  // Perfumes picker: opens on hover (mouse) or tap, lists the five scents
  const perfBtn = document.querySelector('[data-perf-open]');
  const panel = document.querySelector('[data-perf-panel]');
  if (perfBtn && panel) {
    let t = 0;
    const show = (v) => { clearTimeout(t); panel.hidden = !v; perfBtn.setAttribute('aria-expanded', String(v)); };
    const later = () => { clearTimeout(t); t = setTimeout(() => show(false), 220); };
    const hover = matchMedia('(hover: hover)').matches;
    // with a mouse the hover already opened it, so a click keeps it open; on touch a tap toggles
    perfBtn.addEventListener('click', (e) => { e.preventDefault(); show(hover || panel.hidden); });
    if (hover) {
      [perfBtn, panel].forEach((el) => { el.addEventListener('mouseenter', () => show(true)); el.addEventListener('mouseleave', later); });
    }
    panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => show(false)));
    document.addEventListener('click', (e) => { if (!panel.hidden && !panel.contains(e.target) && !perfBtn.contains(e.target)) show(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { show(false); perfBtn.focus(); } });
  }
  // Links in the full-screen menu close it (they may only change the perfume on the home page)
  if (overlay) overlay.querySelectorAll('nav a').forEach((a) => a.addEventListener('click', () => { overlay.hidden = true; openBtn.setAttribute('aria-expanded', 'false'); }));

  // Header gets a backing once the page scrolls (styled on phones and tablets only)
  const header = document.querySelector('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', scrollY > 40);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
