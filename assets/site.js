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
