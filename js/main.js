'use strict';
/* ====== CONFIG — edit these ====== */
const CONFIG = {
  email: 'fm6452465@gmail.com',
  whatsapp: '201024665271', // country code + number, no "+" or spaces
  formEndpoint: '',         // '' = NOT connected to a backend (WhatsApp fallback). Set a Formspree/Web3Forms URL to send real submissions.
  socials: []               // e.g. { label: 'LinkedIn', url: 'https://linkedin.com/company/your-page' }
};
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------- Navigation ---------- */
const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
const setMenu = open => { menu.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', String(open)); };
const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 30);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('click', e => { if (!nav.contains(e.target)) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
matchMedia('(min-width: 992px)').addEventListener('change', () => setMenu(false));

const links = $$('#menu a[href^="#"]:not(.btn)');
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  links.forEach(l => {
    const on = l.getAttribute('href') === '#' + e.target.id;
    l.classList.toggle('is-active', on);
    on ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current');
  });
}), { rootMargin: '-45% 0px -50% 0px' });
['home', 'services', 'projects', 'about', 'process', 'why', 'contact'].forEach(id => { const s = document.getElementById(id); s && spy.observe(s); });

/* ---------- Config-driven content ---------- */
$$('[data-email]').forEach(a => { a.href = 'mailto:' + CONFIG.email; a.textContent = CONFIG.email; });
const waLink = $('#waLink'); if (waLink) waLink.href = 'https://wa.me/' + CONFIG.whatsapp;
const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();
const socialsEl = $('#socials');
if (socialsEl) {
  CONFIG.socials.forEach((s, i) => {
    const a = Object.assign(document.createElement('a'), { href: s.url, textContent: s.label, target: '_blank', rel: 'noopener noreferrer' });
    if (i) socialsEl.append(' · ');
    socialsEl.append(a);
  });
}

/* ---------- Copy email ---------- */
const copyBtn = $('#copyEmail');
if (copyBtn) {
  copyBtn.setAttribute('aria-live', 'polite');
  copyBtn.addEventListener('click', async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(CONFIG.email); ok = true; }
    catch {
      const r = document.createRange(); r.selectNodeContents($('.ct [data-email]'));
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      try { ok = document.execCommand('copy'); } catch { /* ignore */ }
    }
    copyBtn.textContent = ok ? 'Copied' : 'Select the address and copy it';
    setTimeout(() => copyBtn.textContent = 'Copy email', 2400);
  });
}

/* ---------- "Learn More" pre-selects the service in the form ---------- */
$$('.more[data-service]').forEach(a => a.addEventListener('click', () => {
  const sel = $('#service'); if ([...sel.options].some(o => o.value === a.dataset.service)) { sel.value = a.dataset.service; sel.closest('.fld').classList.remove('is-bad'); }
}));

/* ---------- Contact form ---------- */
const form = $('#form'), statusBox = $('#status'), note = $('#formNote'), submitBtn = form ? $('button[type=submit]', form) : null;
const live = Boolean(CONFIG.formEndpoint);
if (note) {
  note.textContent = live
    ? 'Your message is sent to FS CODING by email through a form service.'
    : 'This form is not connected to a server. It does not store or email your message; it opens WhatsApp with your details pre-filled, and you send the message from there.';
  note.classList.toggle('is-live', live);
}
if (submitBtn) submitBtn.textContent = live ? 'Send message' : 'Send via WhatsApp';

const rules = {
  name: v => v.trim().length >= 2 || 'Enter your name.',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter a valid email address.',
  service: v => !!v || 'Choose a service.',
  budget: v => !!v || 'Choose a budget range.',
  message: v => v.trim().length >= 20 || 'Describe your project in at least 20 characters.'
};
const fields = $$('input,select,textarea', form);
fields.forEach(el => { const e = $('.err', el.closest('.fld')); e.id = 'err-' + el.name; el.setAttribute('aria-describedby', e.id); });
const check = el => {
  const r = rules[el.name](el.value), box = el.closest('.fld');
  box.classList.toggle('is-bad', r !== true);
  $('.err', box).textContent = r === true ? '' : r;
  el.setAttribute('aria-invalid', String(r !== true));
  return r === true;
};
fields.forEach(el => {
  el.addEventListener('blur', () => check(el));
  el.addEventListener('input', () => { if (el.closest('.fld').classList.contains('is-bad')) check(el); });
});
const show = (type, msg, linkUrl) => {
  statusBox.className = 'status ' + type; statusBox.textContent = msg;
  if (linkUrl) { statusBox.append(' ', Object.assign(document.createElement('a'), { href: linkUrl, textContent: 'Open WhatsApp', target: '_blank', rel: 'noopener noreferrer', style: 'text-decoration:underline' })); }
};
form.addEventListener('submit', async e => {
  e.preventDefault();
  const bad = fields.filter(el => !check(el));
  if (bad.length) { show('no', 'Please fix the highlighted fields.'); bad[0].focus(); return; }
  const d = Object.fromEntries(new FormData(form));
  if (!live) {
    const url = `https://wa.me/${CONFIG.whatsapp}?text=` + encodeURIComponent(`Hello FS CODING,\nName: ${d.name}\nEmail: ${d.email}\nService: ${d.service}\nBudget: ${d.budget}\n\n${d.message}`);
    const w = window.open(url, '_blank'); if (w) w.opener = null;
    show(w ? 'ok' : 'no', w ? 'WhatsApp opened with your message. Nothing has been sent yet: press send in WhatsApp to reach us.' : 'Your browser blocked the WhatsApp window. Nothing has been sent.', w ? null : url);
    return;
  }
  submitBtn.disabled = true; form.setAttribute('aria-busy', 'true');
  try {
    const res = await fetch(CONFIG.formEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    show('ok', 'Message sent. We will reply to ' + d.email + '.'); form.reset();
  } catch {
    show('no', 'Your message could not be sent. Try again, or email ' + CONFIG.email + '.');
  } finally { submitBtn.disabled = false; form.removeAttribute('aria-busy'); }
});

/* ---------- Straight Moving Portfolio Showcase Controls & Modal ---------- */
const PROJECTS_DATA = {
  pulsehealth: {
    title: 'PulseHealth Telemedicine & Clinical Portal',
    badge: 'Healthcare SaaS',
    url: 'pulsehealth.fscoding.dev',
    service: 'Web Applications',
    desc: 'An end-to-end clinical telehealth platform designed for high concurrency, responsive doctor scheduling, HIPAA compliance, and encrypted real-time consultation rooms.',
    features: [
      'Encrypted WebRTC high-definition video consultations with in-call chat',
      'Intelligent doctor-patient calendar scheduling with automated reminders',
      'Electronic Health Records (EHR) management with audit-logged access',
      'Live patient vital monitoring dashboard (Heart Rate, Blood Pressure, O2 Saturation)'
    ],
    tech: ['React 19', 'Next.js', 'TypeScript', 'WebSockets', 'Tailwind CSS', 'PostgreSQL']
  },
  novastore: {
    title: 'NovaStore Headless E-Commerce Suite',
    badge: 'Headless Commerce',
    url: 'novastore.fscoding.dev',
    service: 'E-commerce',
    desc: 'An ultra-fast headless storefront built for maximum conversion speed, featuring dynamic edge caching, instant faceted search, and seamless Stripe checkout integration.',
    features: [
      'Sub-50ms product search and multi-attribute filtering using Redis',
      'Animated cart drawer with real-time inventory validation',
      'Stripe Checkout and multi-currency localized payment methods',
      'Mobile-first responsive design optimized for Google Core Web Vitals'
    ],
    tech: ['Next.js', 'Stripe API', 'Tailwind CSS', 'Redis', 'Node.js', 'Zustand']
  },
  nexusbi: {
    title: 'NexusBI Real-Time Telemetry Dashboard',
    badge: 'Enterprise SaaS',
    url: 'nexusbi.fscoding.dev',
    service: 'Web Applications',
    desc: 'A business intelligence and analytics suite offering live telemetry monitoring, recurring revenue cohort tracking, anomaly detection, and interactive visual reporting.',
    features: [
      'Interactive D3.js and Chart visualization graphs with dark/light themes',
      'Live MRR, Churn rate, and CAC financial forecasting telemetry',
      'Custom user permission matrix and exportable CSV/PDF reports',
      'Automated Slack and webhook anomaly notification trigger system'
    ],
    tech: ['Vue 3', 'D3.js', 'FastAPI', 'PostgreSQL', 'Docker', 'Tailwind CSS']
  },
  apexfin: {
    title: 'ApexFin Global Banking & Treasury App',
    badge: 'FinTech & Web3',
    url: 'apexfin.fscoding.dev',
    service: 'Web Applications',
    desc: 'A next-generation enterprise treasury and borderless banking platform equipped with virtual card issuance, automated vendor payouts, and bank-grade cryptographic security.',
    features: [
      'Instant multi-currency exchange across 24 world currencies and stablecoins',
      'Virtual and physical debit card provisioning with granular spending limits',
      'Biometric authentication and automated anti-fraud transaction screening',
      'Real-time transaction activity feed with instant push alerts'
    ],
    tech: ['React', 'Node.js', 'WebSockets', 'PostgreSQL', 'Tailwind CSS', 'Redis']
  },
  aurastudio: {
    title: 'AuraStudio Interactive Web Experience',
    badge: 'Creative Web & 3D',
    url: 'aurastudio.fscoding.dev',
    service: 'Web Development',
    desc: 'An award-winning creative agency digital showcase designed with experimental WebGL 3D physics, kinetic typography, and fluid GSAP-driven narrative animations.',
    features: [
      'Custom WebGL vertex shader geometries and interactive 3D particle orb',
      'Smooth scroll damping and responsive horizontal layout transitions',
      'Audio-reactive visual mode with subtle ambient soundscapes',
      'Full accessibility support respecting prefers-reduced-motion'
    ],
    tech: ['Three.js', 'GSAP 3', 'WebGL', 'CSS3 Shaders', 'HTML5 Canvas']
  },
  cloudops: {
    title: 'CloudOps Infrastructure & Cluster Hub',
    badge: 'DevOps & Cloud',
    url: 'cloudops.fscoding.dev',
    service: 'Custom Software',
    desc: 'An operations management console that monitors Kubernetes clusters, manages CI/CD pipelines, and gives engineering teams real-time distributed log visualization.',
    features: [
      'Real-time pod container health check and automatic pod restart triggers',
      'Streaming terminal console logs with syntax-highlighted search',
      'CPU, Memory, and Latency cluster gauges with threshold warnings',
      'GitHub Actions and GitLab CI automated deployment pipeline hooks'
    ],
    tech: ['Go', 'Kubernetes API', 'GraphQL', 'Docker', 'Tailwind CSS', 'WebSockets']
  }
};

const initPortfolio = () => {
  const marquee = $('#portfolioMarquee');
  const track = $('#portfolioTrack');
  const toggleBtn = $('#trackToggle');
  const prevBtn = $('#trackPrev');
  const nextBtn = $('#trackNext');
  const filterBtns = $$('.p-filter');
  const cards = $$('.p-card');
  const modal = $('#projectModal');
  const modalBackdrop = $('#modalBackdrop');
  const modalClose = $('#modalClose');
  const modalBody = $('#modalBody');

  if (!track || !marquee) return;

  // Toggle pause/play
  let isPaused = false;
  const updateToggleState = paused => {
    isPaused = paused;
    track.classList.toggle('is-paused', isPaused);
    if (toggleBtn) {
      const pauseIcon = $('.icon-pause', toggleBtn);
      const playIcon = $('.icon-play', toggleBtn);
      if (pauseIcon) pauseIcon.style.display = isPaused ? 'none' : 'block';
      if (playIcon) playIcon.style.display = isPaused ? 'block' : 'none';
      toggleBtn.setAttribute('aria-label', isPaused ? 'Resume auto scroll' : 'Pause auto scroll');
    }
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => updateToggleState(!isPaused));
  }

  // Keyboard controls on marquee
  marquee.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      updateToggleState(!isPaused);
    }
  });

  // Prev / Next manual nudge
  const nudgeTrack = dir => {
    updateToggleState(true);
    const scrollAmount = dir * (window.innerWidth < 768 ? 320 : 400);
    marquee.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (prevBtn) prevBtn.addEventListener('click', () => nudgeTrack(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => nudgeTrack(1));

  // Category Filtering
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const cat = btn.dataset.filter;
      cards.forEach(card => {
        const match = cat === 'all' || card.dataset.category === cat;
        card.classList.toggle('is-dimmed', !match);
      });
    });
  });

  // Quick View Modal
  const openModal = projectId => {
    const data = PROJECTS_DATA[projectId];
    if (!data || !modal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="modal-header">
        <span class="badge">${data.badge}</span>
        <h2 id="modalTitle">${data.title}</h2>
        <div class="modal-url">&bull; ${data.url}</div>
      </div>
      <div class="modal-body">
        <p>${data.desc}</p>
        <div class="modal-features">
          <h4>Key Capabilities &amp; Architecture</h4>
          <ul>
            ${data.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
        <div class="modal-tech">
          <h4>Tech Stack &amp; Tools</h4>
          <div class="modal-tech-pills">
            ${data.tech.map(t => `<span>${t}</span>`).join('')}
          </div>
        </div>
        <div class="modal-actions">
          <a href="#contact" class="btn btn--p modal-cta" data-service="${data.service}">Build a Similar Solution</a>
          <button type="button" class="btn btn--g modal-dismiss">Close Preview</button>
        </div>
      </div>
    `;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Connect modal CTA to auto-fill contact form
    const cta = $('.modal-cta', modalBody);
    if (cta) {
      cta.addEventListener('click', () => {
        closeModal();
        const sel = $('#service');
        if (sel && [...sel.options].some(o => o.value === data.service)) {
          sel.value = data.service;
          sel.closest('.fld')?.classList.remove('is-bad');
        }
      });
    }

    const dismissBtn = $('.modal-dismiss', modalBody);
    if (dismissBtn) dismissBtn.addEventListener('click', closeModal);
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Attach quick view trigger to buttons and cards
  document.addEventListener('click', e => {
    const qvBtn = e.target.closest('[data-quickview]');
    if (qvBtn) {
      e.preventDefault();
      openModal(qvBtn.dataset.quickview);
      return;
    }
    const card = e.target.closest('.p-card');
    if (card && !e.target.closest('.p-card__link')) {
      if (card.dataset.project) {
        openModal(card.dataset.project);
      }
    }
  });
};

initPortfolio();