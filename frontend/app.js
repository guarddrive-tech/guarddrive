import { gsap } from 'gsap';

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. GSAP Hero & Scroll Animations ---
  initAnimations();

  // --- 2. Navigation Scroll Effect ---
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Mobile Menu
  const burger = document.getElementById('nav-burger');
  const navLinks = document.querySelector('.nav-links');
  if (burger) {
    burger.addEventListener('click', () => {
      navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '64px';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = 'rgba(3, 3, 5, 0.95)';
      navLinks.style.padding = '2rem';
      navLinks.style.borderBottom = '1px solid var(--clr-border)';
    });
  }

  // --- 3. NDA & Modal Flow ---
  const ndaBanner = document.getElementById('nda-banner');
  const ndaAcceptBtn = document.getElementById('nda-accept-btn');
  const ndaModal = document.getElementById('nda-modal');
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel');
  const modalConfirm = document.getElementById('modal-confirm');
  const ndaCheckbox = document.getElementById('nda-checkbox');
  const contactForm = document.getElementById('contact-form');

  if (ndaAcceptBtn) {
    ndaAcceptBtn.addEventListener('click', () => {
      ndaModal.style.display = 'flex';
    });
  }

  const closeModal = () => {
    ndaModal.style.display = 'none';
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalCancel) modalCancel.addEventListener('click', closeModal);

  if (ndaCheckbox && modalConfirm) {
    ndaCheckbox.addEventListener('change', (e) => {
      modalConfirm.disabled = !e.target.checked;
    });
  }

  if (modalConfirm) {
    modalConfirm.addEventListener('click', () => {
      closeModal();
      ndaBanner.style.display = 'none';
      contactForm.style.display = 'flex';
      
      // Trigger telemetry event for NDA Acceptance
      logTelemetry('nda_accepted');
      
      // Fetch insights dynamically now that NDA is signed
      fetchInsights();

      // Smooth scroll to form
      contactForm.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // --- 4. Form Submission & Blockchain Attestation Simulation ---
  const form = document.getElementById('contact-form');
  const successScreen = document.getElementById('success-screen');
  const attestHash = document.getElementById('attest-hash');
  const attestMeta = document.getElementById('attest-meta');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        nome: document.getElementById('nome').value,
        empresa: document.getElementById('empresa').value,
        email: document.getElementById('email').value,
        segmento: document.getElementById('segmento').value,
        frota: document.getElementById('frota').value,
        dor: document.getElementById('dor').value,
        timestamp: new Date().toISOString()
      };

      try {
        // Send lead data to backend
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        form.style.display = 'none';
        successScreen.style.display = 'block';

        // Generate dynamic hash simulation
        if (data.hash) {
          attestHash.innerText = data.hash;
          attestMeta.innerText = `Bloco: ${data.block} · Timestamp: ${data.timestamp} · Status: Verificado`;
        } else {
          // Fallback static-like hash
          const mockHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
          attestHash.innerText = mockHash;
          attestMeta.innerText = `Bloco: 194852 · Timestamp: ${new Date().toLocaleString()} · Status: Local Safe`;
        }

        logTelemetry('lead_submitted', { segmento: formData.segmento });

      } catch (err) {
        console.error('Erro ao enviar lead:', err);
        // Direct fallback UI for dev-mode convenience
        form.style.display = 'none';
        successScreen.style.display = 'block';
        const mockHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
        attestHash.innerText = mockHash;
        attestMeta.innerText = `Bloco: 194852 · Timestamp: ${new Date().toLocaleString()} · Status: Fallback Offline Safe`;
      }
    });
  }

  // --- 5. Telemetry Ping on Page Load ---
  logTelemetry('page_load');
});

// --- Telemetry Utility ---
function logTelemetry(eventType, metadata = {}) {
  fetch('/api/telemetry/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      event: eventType,
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
      metadata: metadata
    })
  }).catch(() => {
    // Silently catch errors in offline/independent dev mode
    console.log(`[Telemetry Offline] Event: ${eventType}`, metadata);
  });
}

// --- Fetch Commercial & Governance Insights ---
async function fetchInsights() {
  try {
    const response = await fetch('/api/insights');
    if (!response.ok) throw new Error('Não autorizado');
    const data = await response.json();
    console.log('Insights carregados do ecossistema:', data);
    
    // Dynamically inject some custom insights card or details if present
    // E.g., showing a badge with market Pain points or ROI directly mapped from Adriano's directives
  } catch (err) {
    console.warn('Insights não puderam ser carregados:', err.message);
  }
}

// --- GSAP Timeline Config ---
function initAnimations() {
  // Hero section staggering entry
  const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

  tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8 }, 0.2)
    .to('#hl1', { opacity: 1, y: 0 }, '-=0.6')
    .to('#hl2', { opacity: 1, y: 0 }, '-=1.0')
    .to('#hero-sub', { opacity: 1, y: 0 }, '-=1.0')
    .to('#hero-actions', { opacity: 1, y: 0 }, '-=1.0')
    .to('#hero-stats', { opacity: 1, y: 0 }, '-=0.8');

  // Fade-in sections/cards on scroll
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('sol-card')) {
          gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
        } else if (entry.target.classList.contains('pain-card')) {
          gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
        } else if (entry.target.classList.contains('comparison-card')) {
          gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
        } else if (entry.target.classList.contains('arch-layer')) {
          gsap.to(entry.target, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' });
        } else {
          // General reveals
          gsap.to(entry.target, { opacity: 1, y: 0, duration: 1 });
        }
        scrollObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Register targets
  document.querySelectorAll('.sol-card, .pain-card, .comparison-card, .arch-layer, .section-label, .section-title').forEach(el => {
    scrollObserver.observe(el);
  });
}
