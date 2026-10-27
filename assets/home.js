// Home: perfume hero slider.
(function () {
  const PERFUMES = [
    { id: 'fanm', name: 'Fanm', type: 'Eau de Parfum', c1: '#B02A30', c2: '#5A0C11', word: '#F7D9CB', ink: 'light',
      tags: ['Luminous', 'Floral', 'Commanding'], desc: 'For her. Coco de Mer, jasmine & gardenia on warm amber.', sizes: [75, 10], botk: 1, boxk: .82 },
    { id: 'oud', name: 'Oud', title: 'Coco De Mer Oud', type: 'Parfum', c1: '#3B3026', c2: '#0F0C0A', word: '#D9B77A', ink: 'light',
      tags: ['Enigmatic', 'Smouldering', 'Sacred'], desc: 'For him & her. Oud, leather & rose over cashmere wood.', sizes: [75, 10], botk: 1, boxk: .82 },
    { id: 'lodas', name: 'Lodas', type: 'Eau de Parfum', c1: '#D6A63C', c2: '#7A5512', word: '#FFF2CF', ink: 'dark',
      tags: ['Effervescent', 'Verdant', 'Wanderlust'], desc: 'For him & her. Yuzu, pink pepper & magnolia on amber.', sizes: [75, 10], botk: 1, boxk: .82 },
    { id: 'zonm', name: 'Zonm', type: 'Eau de Parfum', c1: '#2B4BC0', c2: '#0B1650', word: '#D9E3FF', ink: 'light',
      tags: ['Seductive', 'Marine', 'Intriguing'], desc: 'For him. Cardamom, black pepper & rose on oak musk.', sizes: [75, 10], botk: 1, boxk: .82 },
    { id: 'sovaz', name: 'Sovaz', type: 'Eau de Parfum', c1: '#EE9846', c2: '#A9461A', word: '#FFF0DC', ink: 'dark',
      tags: ['Provocative', 'Fresh', 'Unruly'], desc: 'For him & her. Grapefruit, mint & ginger on vetiver.', sizes: [50, 10], botk: .82, boxk: .7 },
  ];
  const DURATION = 6000;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hero = document.querySelector('[data-hero]');
  const slidesEl = hero.querySelector('[data-slides]');
  const bgA = hero.querySelector('[data-bg-a]');
  const bgB = hero.querySelector('[data-bg-b]');
  const tagsEl = hero.querySelector('[data-tags]');
  const card = hero.querySelector('[data-card]');
  const picker = hero.querySelector('[data-picker]');
  const bar = hero.querySelector('[data-progress]');
  const header = document.querySelector('[data-header]');

  // Build slides
  const slides = PERFUMES.map((p, idx) => {
    const src = idx === 0 ? 'src' : 'data-src'; // only the first perfume loads immediately
    const s = document.createElement('div');
    s.className = 'slide no-anim';
    s.dataset.pos = 'right';
    s.style.setProperty('--botk', p.botk);
    s.style.setProperty('--boxk', p.boxk);
    s.style.setProperty('--boxx', p.id === 'sovaz' ? -.37 : -.42);
    s.style.setProperty('--word', p.word);
    s.innerHTML =
      `<div class="layer name" aria-hidden="true"><div class="px">${p.name}</div></div>` +
      `<div class="layer box"><div class="px"><img ${src}="assets/img/${p.id}-box.png" alt="${p.name} box"></div></div>` +
      `<div class="layer bottle"><div class="px"><div class="float"><img ${src}="assets/img/${p.id}-bottle.png" alt="${p.title || p.name} bottle"></div></div></div>`;
    slidesEl.appendChild(s);
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = p.name;
    b.addEventListener('click', () => go(PERFUMES.indexOf(p)));
    picker.appendChild(b);
    return s;
  });
  const pickBtns = [...picker.children];

  let current = -1, bgFlip = false, paused = false, raf = 0, first = true;

  function paintBackground(p) {
    const grad = `linear-gradient(135deg, ${p.c1} 0%, ${p.c2} 100%)`;
    const show = bgFlip ? bgA : bgB, hide = bgFlip ? bgB : bgA;
    show.style.background = grad; show.style.opacity = 1; hide.style.opacity = 0;
    bgFlip = !bgFlip;
  }

  function paintDetails(p) {
    hero.style.setProperty('--word', p.word); hero.style.setProperty('--c2', p.c2);
    header.dataset.ink = p.ink;
    tagsEl.innerHTML = p.tags.map((t) => `<li>${t}</li>`).join('');
    card.classList.add('swap');
    setTimeout(() => {
      card.querySelector('[data-name]').textContent = `${p.title || p.name} · ${p.type}`;
      card.querySelector('[data-desc]').textContent = p.desc;
      card.querySelector('[data-sizes]').innerHTML = p.sizes.map((s) => `<div><b>${s}</b><span>ml</span></div>`).join('');
      const th = card.querySelector('[data-thumb]');
      th.src = `assets/img/${p.id}-bottle.png`; th.alt = `${p.name} bottle`;
      card.classList.remove('swap');
    }, first ? 0 : 320);
    first = false;
    pickBtns.forEach((b, i) => b.setAttribute('aria-current', String(PERFUMES[i] === p)));
  }

  function go(next, dir) {
    next = (next + PERFUMES.length) % PERFUMES.length;
    if (next === current) return;
    dir = dir || (next > current ? 1 : -1);
    const incoming = slides[next], outgoing = slides[current];
    incoming.querySelectorAll('img[data-src]').forEach((i) => { i.src = i.dataset.src; i.removeAttribute('data-src'); });
    // park incoming on the side it enters from, without animating
    incoming.classList.add('no-anim');
    incoming.dataset.pos = dir > 0 ? 'right' : 'left';
    incoming.offsetWidth; // reflow
    incoming.classList.remove('no-anim');
    incoming.dataset.pos = 'active';
    if (outgoing) outgoing.dataset.pos = dir > 0 ? 'left' : 'right';
    current = next;
    paintBackground(PERFUMES[next]);
    paintDetails(PERFUMES[next]);
    restartTimer();
  }

  // Autoplay with progress bar; pauses on hover, focus or hidden tab
  function restartTimer() {
    if (reduced) return;
    cancelAnimationFrame(raf);
    let elapsed = 0, last = performance.now();
    const tick = (now) => {
      if (!paused) elapsed += now - last;
      last = now;
      const t = Math.min(1, elapsed / DURATION);
      bar.style.transform = `scaleX(${t})`;
      if (t >= 1) { go(current + 1, 1); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  const pause = (v) => { paused = v; };
  card.addEventListener('mouseenter', () => pause(true));
  card.addEventListener('mouseleave', () => pause(false));
  hero.addEventListener('focusin', () => pause(true));
  hero.addEventListener('focusout', () => pause(false));
  document.addEventListener('visibilitychange', () => pause(document.hidden));

  hero.querySelector('[data-next]').addEventListener('click', () => go(current + 1, 1));
  hero.querySelector('[data-prev]').addEventListener('click', () => go(current - 1, -1));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(current + 1, 1);
    if (e.key === 'ArrowLeft') go(current - 1, -1);
  });

  // Swipe on touch screens
  let x0 = null;
  hero.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    x0 = null;
  });

  // Mouse parallax: layers drift and the bottle tilts toward the pointer
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5) * 2);
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5) * 2);
    });
    hero.addEventListener('pointerleave', () => { hero.style.setProperty('--mx', 0); hero.style.setProperty('--my', 0); });
  }

  go(0, 1);
})();

// Load the other perfumes' images once the first one is on screen
addEventListener('load', () => document.querySelectorAll('.slide img[data-src]').forEach((i) => { i.src = i.dataset.src; i.removeAttribute('data-src'); }));
