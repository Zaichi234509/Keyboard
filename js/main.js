import { createKeyboardScene } from './keyboard3d.js';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= 3D stage ================= */
let kb = null;
try {
  kb = createKeyboardScene($('#kb3d'));
  $('#stage').classList.add('on');
} catch (err) {
  console.warn('WebGL unavailable, falling back to stills.', err);
  $('#stage').style.display = 'none';
  // fallback: show the hero render inside the empty scroll track
  const t = $('#stage-track');
  if (t) {
    t.style.height = 'auto';
    const f = document.createElement('div');
    f.style.cssText = 'padding:120px 24px;text-align:center';
    f.innerHTML = '<img src="assets/hero.jpg" alt="Hu Tao Fragrance in Thaw keyboard" style="max-width:1100px;width:100%">';
    t.prepend(f);
    $$('.cap').forEach(c => c.classList.add('on'));
    $('.stage-caption').style.cssText = 'position:relative;height:auto;padding:40px 6vw';
    $$('.cap').forEach(c => { c.style.position = 'relative'; c.style.margin = '0 0 60px'; c.style.maxWidth = '640px'; });
  }
}

/* ================= loader ================= */
addEventListener('load', () => {
  setTimeout(() => $('#loader').classList.add('done'), 620);
});
setTimeout(() => $('#loader').classList.add('done'), 3200); // safety net

/* ================= scroll driver ================= */
const track    = $('#stage-track');
const nav      = $('#nav');
const rail     = $('#rail');
const hint     = document.createElement('div');
hint.className = 'scroll-hint';
hint.innerHTML = '<i></i>Scroll';
document.body.appendChild(hint);

const caps = $$('.cap');
let sy = 0, ticking = false;

function onScroll() {
  sy = scrollY;
  if (!ticking) { requestAnimationFrame(update); ticking = true; }
}

function update() {
  ticking = false;
  const vh = innerHeight;

  // nav + rail
  nav.classList.toggle('solid', sy > 60);
  const docH = document.documentElement.scrollHeight - vh;
  rail.style.width = (docH > 0 ? (sy / docH) * 100 : 0) + '%';
  hint.style.opacity = sy > 120 ? 0 : 1;

  // 3D stage progress across the sticky track
  if (kb && track) {
    const top = track.offsetTop;
    const len = track.offsetHeight - vh;
    const p = clamp((sy - top + vh * 0.92) / (len + vh * 0.92));
    kb.setProgress(p);

    const r = track.getBoundingClientRect();
    const visible = r.bottom > -vh * 0.5 && r.top < vh * 1.5;
    kb.setVisible(visible);
    $('#stage').style.opacity = visible || sy < vh * 1.2 ? 1 : 0;

    // captions keyed to stage progress
    const bands = [[0.02, 0.24], [0.28, 0.48], [0.52, 0.70], [0.74, 0.97]];
    caps.forEach((c, i) => {
      const [a, b] = bands[i];
      c.classList.toggle('on', p >= a && p <= b);
    });
  }

  // parallax layers
  $$('[data-par]').forEach(el => {
    const k = parseFloat(el.dataset.par);
    el.style.transform = `translate3d(0,${sy * k}px,0)`;
  });

  // per-image parallax inside figures
  $$('[data-par-img]').forEach(img => {
    const f = img.parentElement.getBoundingClientRect();
    if (f.bottom < -200 || f.top > vh + 200) return;
    const k = parseFloat(img.dataset.parImg);
    const rel = (f.top + f.height / 2 - vh / 2) / vh;
    img.style.transform = `scale(1.16) translate3d(0,${(-rel * k * 100).toFixed(2)}px,0)`;
  });
}

addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { kb && kb.resize(); update(); });
update();

/* ================= reveal on scroll ================= */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    // animate switch stat bars once revealed
    $$('.fl', e.target).forEach(fl => { fl.style.width = fl.dataset.w + '%'; });
    io.unobserve(e.target);
  });
}, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
$$('.rv').forEach(el => io.observe(el));

/* ================= petals canvas ================= */
(function petals() {
  if (reduced) return;
  const cv = $('#petals'), ctx = cv.getContext('2d');
  let w, h, parts = [];

  function size() {
    w = cv.width = innerWidth * devicePixelRatio;
    h = cv.height = innerHeight * devicePixelRatio;
    cv.style.width = innerWidth + 'px';
    cv.style.height = innerHeight + 'px';
    const n = innerWidth < 700 ? 26 : 54;
    parts = Array.from({ length: n }, () => spawn(true));
  }
  function spawn(init) {
    return {
      x: Math.random() * w,
      y: init ? Math.random() * h : -30 * devicePixelRatio,
      s: (4 + Math.random() * 9) * devicePixelRatio,
      vy: (0.25 + Math.random() * 0.75) * devicePixelRatio,
      vx: (Math.random() - 0.5) * 0.5 * devicePixelRatio,
      a: Math.random() * 6.28,
      va: (Math.random() - 0.5) * 0.035,
      o: 0.16 + Math.random() * 0.45,
      c: ['#A5202F', '#7C1B26', '#D9762F', '#EDE3CB'][(Math.random() * 4) | 0],
    };
  }
  size();
  addEventListener('resize', size);

  let t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    t += 0.01;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.y += p.vy;
      p.x += p.vx + Math.sin(t + i) * 0.35 * devicePixelRatio;
      p.a += p.va;
      if (p.y > h + 40) parts[i] = spawn(false);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.globalAlpha = p.o;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.s, p.s * 0.5, 0, 0, 6.283);
      ctx.fill();
      ctx.restore();
    }
  })();
})();

/* ================= keycap tester ================= */
(function tester() {
  const row = $('#kbrow'), out = $('#readout');
  if (!row) return;
  const defs = [
    ['H', 'crimson'], ['U', 'cream'], ['T', 'cream'], ['A', 'cream'], ['O', 'cream'],
    ['↑', 'olive'], ['↓', 'olive'], ['␣', 'plum', true],
  ];
  const bg = {
    cream: ['#EDE3CB', '#4A3226'],
    plum: ['#5C2B36', '#E9D9BF'],
    olive: ['#9B9268', '#2C2720'],
    crimson: ['#A5202F', '#F2DFC6'],
  };
  const sounds = ['thock', 'clack', 'thock', 'tok', 'clack', 'thock'];
  const map = {};

  defs.forEach(([label, c, wide]) => {
    const b = document.createElement('button');
    b.className = 'kc' + (wide ? ' wide' : '');
    b.textContent = label;
    b.style.background = bg[c][0];
    b.style.color = bg[c][1];
    b.setAttribute('aria-label', 'Keycap ' + label);
    row.appendChild(b);
    map[label.toLowerCase()] = b;
    b.addEventListener('pointerdown', () => press(b, label));
  });

  let buf = '';
  function press(el, label) {
    el.classList.add('down');
    setTimeout(() => el.classList.remove('down'), 110);
    kb && kb.pressRandom();
    buf = (buf + label).slice(-14);
    out.innerHTML = buf + ' <span style="opacity:.45;font-size:13px;letter-spacing:.3em">· ' +
      sounds[(Math.random() * sounds.length) | 0] + '</span>';
  }

  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    let k = e.key.toLowerCase();
    if (k === ' ') k = '␣';
    if (k === 'arrowup') k = '↑';
    if (k === 'arrowdown') k = '↓';
    const el = map[k];
    if (el) { e.preventDefault(); press(el, el.textContent); }
    else kb && kb.pressRandom();
  });
})();

/* ================= CTA ================= */
$('#cta')?.addEventListener('click', (e) => {
  e.preventDefault();
  const b = e.currentTarget;
  const old = b.textContent;
  b.textContent = 'Reserved · See you at the parlour';
  b.style.background = '#2E1218';
  b.style.borderColor = '#2E1218';
  setTimeout(() => { b.textContent = old; b.style.background = ''; b.style.borderColor = ''; }, 2600);
});

/* ================= smooth anchors ================= */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    scrollTo({ top: t.offsetTop - 60, behavior: reduced ? 'auto' : 'smooth' });
  });
});
