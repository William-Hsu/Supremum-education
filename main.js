/* ═══════════════════════════════════════════════════════════════
   Supremum Education — main.js
   Premium SaaS micro-interaction system
   ─────────────────────────────────────────────────────────────
    1.  Setup & reduced-motion gate
    2.  Page load fade-in
    3.  Scroll progress bar
    4.  Nav scroll + mobile menu
    5.  Scroll-reveal (IntersectionObserver)
    6.  Animated counters
    7.  Hero parallax
    8.  Magnetic CTA button
    9.  FAQ smooth accordion
   10.  Text scramble (eyebrow)
   11.  Hero mouse spotlight
   12.  Service card gradient follow
   13.  3D card tilt
   14.  Animated underline on hero em
═══════════════════════════════════════════════════════════════ */

/* ── 1. SETUP ── */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js-ready');

/* ── 2. PAGE LOAD ── */
// handled by CSS animation on body

/* ── 3. SCROLL PROGRESS BAR ── */
const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    progressBar.style.transform = `scaleX(${Math.min(pct, 1)})`;
  }, { passive: true });
}

/* ── 4. NAV: SCROLL + MOBILE MENU ── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');

if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('mobile-open', open);
    hamburger.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('mobile-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }));
}

/* ── 5. SCROLL REVEAL ── */
if (!reducedMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -52px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

/* ── 6. ANIMATED COUNTERS ── */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    if (reducedMotion) { el.textContent = target; counterIO.unobserve(el); return; }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 1600, 1);
      el.textContent = Math.floor(easeOutCubic(t) * target);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
    counterIO.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => counterIO.observe(el));

/* ── 7. HERO PARALLAX ── */
if (!reducedMotion) {
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight * 1.2)
        heroContent.style.transform = `translateY(${window.scrollY * 0.1}px)`;
    }, { passive: true });
  }
}

/* ── 8. MAGNETIC CTA BUTTON ── */
if (!reducedMotion) {
  document.querySelectorAll('.btn-primary, .btn-gold').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.2;
      const y = (e.clientY - r.top  - r.height / 2) * 0.2;
      btn.style.transform = `translate(${x}px, ${y - 1}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ── 9. FAQ ACCORDION ── */
document.querySelectorAll('details.faq-item').forEach(details => {
  const summary = details.querySelector('summary');
  const content = details.querySelector('.faq-a');
  if (!summary || !content) return;
  content.style.cssText = 'overflow:hidden;transition:max-height 0.4s cubic-bezier(0.16,1,0.3,1),opacity 0.3s ease;max-height:0;opacity:0;';
  summary.addEventListener('click', (e) => {
    e.preventDefault();
    if (!details.open) {
      details.open = true;
      content.style.maxHeight = content.scrollHeight + 'px';
      content.style.opacity = '1';
    } else {
      content.style.maxHeight = '0';
      content.style.opacity = '0';
      content.addEventListener('transitionend', () => { if (!content.style.maxHeight || content.style.maxHeight === '0px') details.open = false; }, { once: true });
    }
  });
});

/* ── 10. TEXT SCRAMBLE (eyebrow) ── */
function scramble(el) {
  if (reducedMotion || !el) return;
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const final = el.textContent;
  const STEPS = 16;
  let step = 0;
  el.dataset.scrambling = '1';
  const id = setInterval(() => {
    el.textContent = final.split('').map((ch, i) => {
      if (ch === ' ') return ' ';
      if (i < (step / STEPS) * final.length) return ch;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
    if (++step > STEPS) { el.textContent = final; clearInterval(id); delete el.dataset.scrambling; }
  }, 40);
}

// Trigger scramble when eyebrow enters view
const eyebrow = document.querySelector('.eyebrow');
if (eyebrow) {
  const scrambleIO = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { scramble(eyebrow); scrambleIO.unobserve(eyebrow); }
  }, { threshold: 0.8 });
  scrambleIO.observe(eyebrow);
  // Re-trigger on hover
  eyebrow.addEventListener('mouseenter', () => {
    if (!eyebrow.dataset.scrambling) scramble(eyebrow);
  });
}

/* ── 11. HERO MOUSE SPOTLIGHT ── */
if (!reducedMotion) {
  const hero = document.getElementById('home');
  if (hero) {
    hero.style.setProperty('--mx', '60%');
    hero.style.setProperty('--my', '40%');
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
      hero.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  }
}

/* ── 12. SERVICE CARD GRADIENT FOLLOW ── */
if (!reducedMotion) {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--gy', `${((e.clientY - r.top)  / r.height) * 100}%`);
    });
  });
}

/* ── 13. 3D CARD TILT ── */
if (!reducedMotion) {
  function addTilt(selector, intensity = 4) {
    document.querySelectorAll(selector).forEach(card => {
      card.style.willChange = 'transform';
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.15s ease, box-shadow 0.3s ease';
      });
      card.addEventListener('mousemove', (e) => {
        const r  = card.getBoundingClientRect();
        const x  = (e.clientX - r.left)  / r.width  - 0.5;
        const y  = (e.clientY - r.top)   / r.height - 0.5;
        card.style.transform = `perspective(1200px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s ease';
        card.style.transform = '';
      });
    });
  }
  addTilt('.testi-card', 3);
  addTilt('.approach-card', 3);
  addTilt('.p-card', 2);
  addTilt('.r-card', 2);
}

/* ── 14. ANIMATED UNDERLINE on hero em ── */
// Triggered after hero h1 animation completes (~1.1s delay)
if (!reducedMotion) {
  const heroEm = document.querySelector('.hero-h1 em');
  if (heroEm) {
    setTimeout(() => { heroEm.classList.add('underline-drawn'); }, 1100);
  }
}
