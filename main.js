/* ═══════════════════════════════════════════════════════════════
   Supremum Education — main.js
   Premium interaction & animation system
   ─────────────────────────────────────────────────────────────
   Sections:
   1. Setup & reduced-motion gate
   2. Page load fade-in
   3. Scroll progress bar
   4. Nav scroll + mobile menu
   5. Scroll-reveal (IntersectionObserver)
   6. Animated counters
   7. Hero parallax
   8. Magnetic button effect
   9. FAQ smooth open/close
═══════════════════════════════════════════════════════════════ */

/* ── 1. SETUP ── */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 2. PAGE LOAD FADE-IN ── */
// Body starts invisible (set in CSS), fades in once JS is ready
document.documentElement.classList.add('js-ready');

/* ── 3. SCROLL PROGRESS BAR ── */
const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
  const updateProgress = () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.body.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? scrollTop / docHeight : 0;
    progressBar.style.transform = `scaleX(${pct})`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
}

/* ── 4. NAV: SCROLL BEHAVIOUR + MOBILE MENU ── */
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
    const isOpen = hamburger.classList.toggle('open');
    navLinks.classList.toggle('mobile-open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });
  // Close menu when a link is tapped
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('mobile-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ── 5. SCROLL-REVEAL (IntersectionObserver) ── */
// Supports .reveal, stagger via .d1–.d5, and group-stagger on parent[data-stagger]
if (!reducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -52px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Auto-stagger direct children of [data-stagger] containers
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    Array.from(parent.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.08}s`;
    });
  });
} else {
  // Immediately show everything for reduced-motion users
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

/* ── 6. ANIMATED COUNTERS ── */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function runCounter(el, target, duration) {
  if (reducedMotion) { el.textContent = target; return; }
  const startTime = performance.now();
  const tick = (now) => {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent  = Math.floor(easeOutCubic(progress) * target);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      runCounter(el, target, 1600);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

/* ── 7. HERO PARALLAX ── */
if (!reducedMotion) {
  const heroContent   = document.querySelector('.hero-content');
  const heroParticles = document.querySelector('.hero-particles');

  if (heroContent) {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroContent.style.transform   = `translateY(${y * 0.12}px)`;
        if (heroParticles) {
          heroParticles.style.transform = `translateY(${y * 0.06}px)`;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}

/* ── 8. MAGNETIC BUTTON EFFECT (subtle) ── */
if (!reducedMotion) {
  document.querySelectorAll('.btn-gold, .btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r  = btn.getBoundingClientRect();
      const x  = (e.clientX - r.left - r.width  / 2) * 0.18;
      const y  = (e.clientY - r.top  - r.height / 2) * 0.18;
      btn.style.transform = `translate(${x}px, ${y - 2}px) scale(1.03)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ── 9. FAQ — SMOOTH HEIGHT ANIMATION ── */
document.querySelectorAll('details.faq-item').forEach(details => {
  const summary = details.querySelector('summary');
  const content = details.querySelector('.faq-a');
  if (!summary || !content) return;

  // Wrap content height so we can animate it
  content.style.overflow = 'hidden';
  content.style.transition = 'max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease';
  content.style.maxHeight  = '0px';
  content.style.opacity    = '0';

  summary.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = details.open;

    if (!isOpen) {
      details.open = true;
      // Measure natural height
      content.style.maxHeight = content.scrollHeight + 'px';
      content.style.opacity   = '1';
    } else {
      content.style.maxHeight = '0px';
      content.style.opacity   = '0';
      content.addEventListener('transitionend', () => {
        if (content.style.maxHeight === '0px') details.open = false;
      }, { once: true });
    }
  });
});
