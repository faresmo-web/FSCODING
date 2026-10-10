'use strict';
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const $$ = s => [...document.querySelectorAll(s)];

  /* Pointer-follow glow on service blocks (a hover response, no GSAP needed) */
  $$('.svc__it').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); }));

  /* Particles: one rAF loop, paused off-screen, fewer on small screens */
  const cv = document.getElementById('particles');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d'); let w, h, ps = [], run = false, raf = 0, t;
    const size = () => { w = cv.width = cv.offsetWidth; h = cv.height = cv.offsetHeight; ps = Array.from({ length: w < 768 ? 30 : 70 }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + .4, v: Math.random() * .3 + .1 })); };
    const tick = () => {
      raf = 0; if (!run) return; ctx.clearRect(0, 0, w, h); ctx.fillStyle = 'rgba(0,212,255,.55)';
      ps.forEach(p => { p.y -= p.v; if (p.y < 0) { p.y = h; p.x = Math.random() * w; } ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3); ctx.fill(); });
      raf = requestAnimationFrame(tick);
    };
    size(); addEventListener('resize', () => { clearTimeout(t); t = setTimeout(size, 150); });
    new IntersectionObserver(([e]) => { run = e.isIntersecting; if (run && !raf) raf = requestAnimationFrame(tick); }).observe(cv);
  }

  const g = window.gsap;
  if (reduce || !g) return; // content is fully visible without animation
  const st = window.ScrollTrigger; if (st) g.registerPlugin(st);
  const CLEAR = 'transform,opacity,transition'; // hand transforms back to CSS hover rules after each tween

  g.from('[data-hero]', { y: 40, opacity: 0, duration: .9, stagger: .12, ease: 'power3.out', clearProps: CLEAR });

  if (st) {
    $$('[data-reveal]').forEach(el => g.from(el, {
      y: 36, opacity: 0, duration: .8, ease: 'power3.out', clearProps: CLEAR,
      onStart: () => { el.style.transition = 'none'; },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    }));
    // Parallax only where there is room for it (not on phones/tablets)
    g.matchMedia().add('(min-width: 992px)', () => {
      $$('[data-parallax]').forEach(el => g.fromTo(el, { y: 30 }, { y: -30, ease: 'none', scrollTrigger: { trigger: el, scrub: true } }));
    });
    const steps = document.getElementById('steps');
    if (steps) {
      steps.style.setProperty('--p', 0);
      st.create({ trigger: steps, start: 'top 75%', end: 'bottom 60%', onUpdate: s => steps.style.setProperty('--p', s.progress) });
    }
  }

  if (!fine) return;
  $$('[data-magnetic]').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); g.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .3 }); });
    b.addEventListener('pointerleave', () => g.to(b, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1,.5)' }));
  });
  const cur = document.getElementById('cur'); if (!cur) return;
  addEventListener('pointermove', e => { cur.style.display = 'block'; g.to(cur, { x: e.clientX, y: e.clientY, duration: .15 }); });
  $$('a,button,select').forEach(el => { el.addEventListener('pointerenter', () => cur.classList.add('is-grow')); el.addEventListener('pointerleave', () => cur.classList.remove('is-grow')); });
})();