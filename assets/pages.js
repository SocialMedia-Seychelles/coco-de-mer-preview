// Inner pages: scroll reveals, stockist dropdown, story chapters + detail panels, timeline line.
(function () {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal: anything with .reveal / .reveal-x / .tl-item / .screen / .island gets .in when visible
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .reveal-x, .tl-item, .screen, .island').forEach((el) => io.observe(el));

  // Dropdown (Find a stockist)
  document.querySelectorAll('[data-dropdown]').forEach((dd) => {
    const btn = dd.querySelector('button');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dd.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    dd.querySelectorAll('.dropdown-menu a').forEach((a) => a.addEventListener('click', () => dd.classList.remove('open')));
    document.addEventListener('click', () => { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') dd.classList.remove('open'); });
  });

  // Our Story chapters
  const wrap = document.querySelector('[data-chapters]');
  if (wrap) {
    const chapters = [...wrap.querySelectorAll('.chapter')];
    const num = wrap.querySelector('[data-num]');
    let i = 0, timer;
    const show = (n) => {
      i = (n + chapters.length) % chapters.length;
      chapters.forEach((c, k) => c.classList.toggle('active', k === i));
      num.textContent = String(i + 1).padStart(2, '0');
      clearTimeout(timer);
      if (!reduced) timer = setTimeout(() => show(i + 1), 7000);
    };
    wrap.querySelector('[data-next]').addEventListener('click', () => show(i + 1));
    wrap.querySelector('[data-prev]').addEventListener('click', () => show(i - 1));
    show(0);

    // Detail panels
    const panel = document.querySelector('[data-detail]');
    const fill = (c) => {
      const cb = c.querySelector('.bg'); panel.querySelector('.bg').style.backgroundImage = cb.style.backgroundImage || (cb.dataset.bg ? `url(${cb.dataset.bg})` : '');
      panel.querySelector('[data-d-kicker]').textContent = 'Our story · ' + String(chapters.indexOf(c) + 1).padStart(2, '0');
      panel.querySelector('[data-d-title]').textContent = c.dataset.title;
      panel.querySelector('[data-d-text]').innerHTML = c.querySelector('template.text').innerHTML;
      panel.querySelector('[data-d-facts]').innerHTML = c.querySelector('template.facts').innerHTML;
    };
    const close = () => { panel.classList.remove('open'); show(i); };
    const open = (c) => { clearTimeout(timer); fill(c); panel.classList.add('open'); panel.querySelector('.detail-close').focus(); };
    chapters.forEach((c) => c.querySelector('.discover').addEventListener('click', () => open(c)));
    document.querySelectorAll('[data-open-chapter]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault(); open(chapters[+a.dataset.openChapter]);
    }));
    panel.querySelector('.detail-close').addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });
  }

  // Timeline: gold line draws down as you scroll
  const tl = document.querySelector('.tl');
  if (tl) {
    const line = tl.querySelector('.tl-fill');
    const update = () => {
      const r = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      line.style.height = (p * 100) + '%';
    };
    addEventListener('scroll', update, { passive: true });
    update();
  }

  // Subtle parallax on full-screen backgrounds
  if (!reduced) {
    const bgs = [...document.querySelectorAll('.screen > .bg, .stories > .bg')];
    const move = () => bgs.forEach((b) => {
      const r = b.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      b.style.backgroundPosition = `center ${50 + (r.top / innerHeight) * -12}%`;
    });
    addEventListener('scroll', move, { passive: true });
    move();
  }
})();

// Video lightbox: any [data-video] link plays the file in an overlay
(function () {
  const links = document.querySelectorAll('[data-video]');
  if (!links.length) return;
  const box = document.createElement('div');
  box.className = 'video-box'; box.hidden = true;
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Video');
  box.innerHTML = '<button class="video-close" aria-label="Close video">×</button><video controls playsinline></video>';
  document.body.appendChild(box);
  const video = box.querySelector('video');
  const close = () => { video.pause(); video.removeAttribute('src'); video.load(); box.hidden = true; document.body.style.overflow = ''; };
  links.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    video.src = a.dataset.video; if (a.dataset.poster) video.poster = a.dataset.poster;
    box.hidden = false; document.body.style.overflow = 'hidden';
    video.play().catch(() => {});
    box.querySelector('.video-close').focus();
  }));
  box.querySelector('.video-close').addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) close(); });
})();

// Deferred backgrounds: load just before they scroll into view.
// Story chapters are off-screen slides, so load those once the page has finished loading.
(function () {
  const set = (el) => { if (el.dataset.bg) { el.style.backgroundImage = `url(${el.dataset.bg})`; el.removeAttribute('data-bg'); } };
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { set(e.target); io.unobserve(e.target); } }), { rootMargin: '900px 0px' });
  document.querySelectorAll('[data-bg]').forEach((el) => (el.closest('.chapter') ? null : io.observe(el)));
  addEventListener('load', () => document.querySelectorAll('.chapter [data-bg]').forEach(set));
})();
