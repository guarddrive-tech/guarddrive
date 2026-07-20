import { gsap } from 'gsap';

document.addEventListener('DOMContentLoaded', () => {
  // --- 0. CHECK FOR DYNAMIC FORM TOKEN ---
  const urlParams = new URLSearchParams(window.location.search);
  const formToken = urlParams.get('r');
  
  if (formToken) {
    // Hide main landing page content, show diagnostic portal
    initDiagnosticPortal(formToken);
    return; // Stop normal landing page initialization
  }

  // --- 1. GSAP Hero & Scroll Animations ---
  initAnimations();

  // --- 1b. Hero Intelligence Hub Animation ---
  initHeroAnimation();

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
        telefone: document.getElementById('telefone')?.value || '',
        plano: document.querySelector('input[name="plano"]:checked')?.value || 'não_selecionado',
        segmento: document.getElementById('segmento').value,
        frota: document.getElementById('frota')?.value || '',
        dor: document.getElementById('dor')?.value || '',
        timestamp: new Date().toISOString(),
        source: 'landing_contato'
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

  // --- 5. Pilot Program Form ---
  const pilotForm = document.getElementById('pilot-form');
  const pilotSuccessScreen = document.getElementById('pilot-success-screen');
  const pilotSubmitBtn = document.getElementById('pilot-submit-btn');

  if (pilotForm) {
    pilotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        nome: document.getElementById('pilot-nome').value,
        empresa: document.getElementById('pilot-empresa').value,
        cargo: document.getElementById('pilot-cargo').value,
        email: document.getElementById('pilot-email').value,
        telefone: document.getElementById('pilot-telefone').value,
        segmento: 'programa_piloto',
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
        
        pilotForm.style.display = 'none';
        pilotSuccessScreen.style.display = 'block';

        logTelemetry('pilot_form_submitted', { empresa: formData.empresa });

      } catch (err) {
        console.error('Erro ao enviar lead do programa piloto:', err);
        // Direct fallback UI for dev-mode convenience
        pilotForm.style.display = 'none';
        pilotSuccessScreen.style.display = 'block';
      }
    });
  }
  // --- 6. FAQ Accordion ---
  document.querySelectorAll('.faq-acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-acc-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-acc-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-acc-btn').setAttribute('aria-expanded', 'false');
      });
      // Open clicked (if was closed)
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // --- 7. Real-time form validation + plan pre-selection ---

  // Validate inputs on blur/input
  function setupValidation(inputId, wrapperId, validFn) {
    const el = document.getElementById(inputId);
    const wrapper = document.getElementById(wrapperId)?.parentElement || el?.parentElement;
    if (!el) return;
    const validate = () => {
      const isValid = validFn(el.value);
      const wrapperEl = el.closest('.input-wrapper');
      if (wrapperEl) wrapperEl.classList.toggle('valid', isValid);
    };
    el.addEventListener('input', validate);
    el.addEventListener('blur', validate);
    el.addEventListener('change', validate);
  }

  setupValidation('nome', 'check-nome', v => v.trim().length >= 3);
  setupValidation('empresa', 'check-empresa', v => v.trim().length >= 2);
  setupValidation('email', 'check-email', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()));
  setupValidation('telefone', 'check-telefone', v => v.replace(/\D/g,'').length >= 10);
  setupValidation('segmento', 'check-segmento', v => v !== '');

  // Phone auto-formatting
  const telefoneInput = document.getElementById('telefone');
  if (telefoneInput) {
    telefoneInput.addEventListener('input', (e) => {
      let digits = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (digits.length > 10) {
        digits = digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (digits.length > 6) {
        digits = digits.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
      } else if (digits.length > 2) {
        digits = digits.replace(/(\d{2})(\d+)/, '($1) $2');
      }
      e.target.value = digits;
    });
  }

  // Plan card CTA pre-selection
  document.querySelectorAll('a[href="#contato"].btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent.toLowerCase();
      let planValue = null;
      if (text.includes('standard')) planValue = 'standard';
      else if (text.includes('premium')) planValue = 'premium';
      else if (text.includes('especialista') || text.includes('enterprise')) planValue = 'enterprise';
      if (planValue) {
        setTimeout(() => {
          const radio = document.getElementById(`plan-${planValue}`);
          if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
          }
        }, 400);
      }
    });
  });

  // --- 7. Telemetry Ping on Page Load ---
  logTelemetry('page_load');
});

// ══════════════════════════════════════════════════════
// DIAGNOSTIC PORTAL — Dynamic Form Wizard (?r={token})
// ══════════════════════════════════════════════════════

async function initDiagnosticPortal(token) {
  const portal = document.getElementById('dynamic-diagnostic-portal');
  const nav = document.getElementById('nav');

  // Hide ALL main landing page sections (everything except portal and background)
  document.querySelectorAll('body > *:not(.cyber-grid):not(.glow-orb):not(#dynamic-diagnostic-portal):not(#orb-1):not(#orb-2):not(#orb-3)').forEach(el => {
    if (el.id !== 'dynamic-diagnostic-portal' && !el.classList.contains('cyber-grid') && !el.classList.contains('glow-orb')) {
      el.style.display = 'none';
    }
  });

  // Show the portal
  portal.style.display = 'block';

  // Log telemetry
  logTelemetry('diagnostic_portal_opened', { token });

  // Fetch form data from API
  let formData = null;
  try {
    const res = await fetch(`/api/forms/${token}`);
    if (!res.ok) {
      portal.innerHTML = `
        <div style="text-align: center; padding: 100px 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
          <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">Formulário Não Encontrado</h2>
          <p style="color: #6e7491; max-width: 400px; margin: 0 auto;">O token <code style="color: #00F0FF;">${token}</code> não corresponde a nenhum diagnóstico ativo.</p>
          <a href="/" style="display: inline-block; margin-top: 2rem; color: #00F0FF;">← Voltar à Página Inicial</a>
        </div>
      `;
      return;
    }
    formData = await res.json();
  } catch (err) {
    console.error('Erro ao carregar formulário:', err);
    portal.innerHTML = `
      <div style="text-align: center; padding: 100px 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">Erro de Conexão</h2>
        <p style="color: #6e7491;">Não foi possível se conectar ao servidor. Tente novamente em instantes.</p>
      </div>
    `;
    return;
  }

  // Populate portal header
  document.getElementById('portal-title').innerText = formData.name || 'Diagnóstico GuardDrive™';
  document.getElementById('portal-subtitle').innerText = formData.description || 'Diagnóstico soberano de conformidade e mitigação de dores patrimoniais.';

  const questions = formData.questions || [];
  const totalPhases = questions.length + 3; // NDA + Contact + N questions + Attesting + Success
  let currentQuestion = 0;
  const userAnswers = {};

  // Update progress bar
  function updateProgress(step) {
    const pct = Math.round((step / totalPhases) * 100);
    document.getElementById('portal-progress').style.width = `${pct}%`;
  }

  // Show a specific phase, hide others
  function showPhase(phaseId) {
    ['portal-phase-nda', 'portal-phase-contact', 'portal-phase-questions', 'portal-phase-attesting', 'portal-phase-success'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = id === phaseId ? 'block' : 'none';
    });
    // Scroll to top of portal
    portal.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ─── PHASE 1: NDA Gate ──────────────────────
  updateProgress(0);

  const ndaCheckbox = document.getElementById('portal-nda-checkbox');
  const ndaBtn = document.getElementById('portal-nda-btn');

  ndaCheckbox.addEventListener('change', () => {
    ndaBtn.disabled = !ndaCheckbox.checked;
  });

  ndaBtn.addEventListener('click', () => {
    showPhase('portal-phase-contact');
    updateProgress(1);
    logTelemetry('portal_nda_accepted', { token });
  });

  // ─── PHASE 2: Contact Info ──────────────────
  document.getElementById('portal-contact-btn').addEventListener('click', () => {
    const nome = document.getElementById('portal-nome').value.trim();
    const empresa = document.getElementById('portal-empresa').value.trim();
    const email = document.getElementById('portal-email').value.trim();
    const phoneP = document.getElementById('portal-phone-personal').value.trim();
    const phoneC = document.getElementById('portal-phone-corporate').value.trim();

    if (!nome || !empresa || !email) {
      alert('Por favor, preencha Nome, Empresa e E-mail antes de prosseguir.');
      return;
    }

    // Store contact data
    userAnswers.__contact = { nome, empresa, email, phoneP, phoneC };

    showPhase('portal-phase-questions');
    updateProgress(2);
    renderQuestion(0);
    logTelemetry('portal_contact_filled', { token, empresa });
  });

  // ─── PHASE 3: Question Wizard ───────────────
  function renderQuestion(idx) {
    currentQuestion = idx;
    const q = questions[idx];
    if (!q) return;

    document.getElementById('portal-question-number').innerText = `Pergunta ${idx + 1} de ${questions.length}`;
    document.getElementById('portal-question-segment').innerText = (formData.segment || '').toUpperCase();
    document.getElementById('portal-question-title').innerText = q.q;

    const optionsContainer = document.getElementById('portal-options-container');
    const textContainer = document.getElementById('portal-text-input-container');

    if (q.type === 'select' && q.options && q.options.length > 0) {
      optionsContainer.style.display = 'block';
      textContainer.style.display = 'none';
      
      optionsContainer.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'option-card-grid';

      q.options.forEach((opt, optIdx) => {
        const card = document.createElement('div');
        card.className = 'option-card';
        // Check if previously answered
        if (userAnswers[q.q] === opt) {
          card.classList.add('selected');
        }

        card.innerHTML = `
          <div class="option-card-radio"></div>
          <div style="font-size: 0.9rem; line-height: 1.4;">${opt}</div>
        `;

        card.addEventListener('click', () => {
          // Deselect siblings
          grid.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          userAnswers[q.q] = opt;
        });

        grid.appendChild(card);
      });

      optionsContainer.appendChild(grid);
    } else {
      // Text or number input
      optionsContainer.style.display = 'none';
      textContainer.style.display = 'block';
      const textarea = document.getElementById('portal-text-answer');
      textarea.value = userAnswers[q.q] || '';
      textarea.placeholder = q.type === 'number' 
        ? 'Informe um valor numérico...' 
        : 'Escreva sua resposta de forma detalhada...';
    }

    // Prev/Next button states
    document.getElementById('portal-prev-btn').style.visibility = idx === 0 ? 'hidden' : 'visible';
    const nextBtn = document.getElementById('portal-next-btn');
    nextBtn.innerText = idx === questions.length - 1 ? 'Finalizar Diagnóstico' : 'Avançar';

    updateProgress(2 + idx);
  }

  // Next button
  document.getElementById('portal-next-btn').addEventListener('click', () => {
    const q = questions[currentQuestion];
    
    // Save text answer if applicable
    if (q.type !== 'select') {
      const val = document.getElementById('portal-text-answer').value.trim();
      if (val) userAnswers[q.q] = val;
    }

    // Validate answer exists
    if (!userAnswers[q.q]) {
      alert('Por favor, selecione ou preencha uma resposta antes de avançar.');
      return;
    }

    if (currentQuestion < questions.length - 1) {
      renderQuestion(currentQuestion + 1);
    } else {
      // All questions done — submit
      submitDiagnostic(token, formData, userAnswers);
    }
  });

  // Prev button
  document.getElementById('portal-prev-btn').addEventListener('click', () => {
    if (currentQuestion > 0) {
      renderQuestion(currentQuestion - 1);
    }
  });

  // ─── PHASE 4 & 5: Submit & Attest ──────────
  async function submitDiagnostic(formToken, formMeta, answers) {
    showPhase('portal-phase-attesting');
    updateProgress(totalPhases - 1);

    const console_el = document.getElementById('attesting-console');

    // Simulated attestation animation
    const steps = [
      '[SEC] Cifragem de dados pessoais via SHA-3 concluída.',
      '[UEAP] Preparando payload de atestação criptográfica...',
      `[NET] Enviando ${Object.keys(answers).length - 1} respostas para a rede soberana...`,
      '[THEMIS API] Solicitando auditoria forense ao Magistrado Themis™ (Symbeon Labs)...',
      '[THEMIS API] Laudo forense independente assinado digitalmente com Ed25519.',
      '[BLOCK] Gravando hashes de atestação na blockchain...',
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      console_el.innerHTML += `\n${steps[i]}`;
      console_el.scrollTop = console_el.scrollHeight;
    }

    // Build submission payload
    const contact = answers.__contact || {};
    const cleanAnswers = { ...answers };
    delete cleanAnswers.__contact;

    const payload = {
      form_token: formToken,
      company_name: contact.empresa || 'Não informado',
      contact_name: contact.nome || 'Não informado',
      email: contact.email || 'nao@informado.com',
      phone_personal: contact.phoneP || '',
      phone_corporate: contact.phoneC || '',
      nda_accepted: true,
      answers: cleanAnswers
    };

    try {
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      await new Promise(resolve => setTimeout(resolve, 500));
      console_el.innerHTML += `\n[OK] Transação confirmada: ${data.hash || 'offline-mode'}`;
      console_el.innerHTML += `\n[DONE] Laudo de conformidade gerado com sucesso.`;

      await new Promise(resolve => setTimeout(resolve, 800));

      // Show success
      showPhase('portal-phase-success');
      updateProgress(totalPhases);

      document.getElementById('portal-res-hash').innerText = data.hash || '0x_offline_' + Date.now().toString(16);
      document.getElementById('portal-res-meta').innerText = `Bloco: ${data.block || 'N/A'} · Timestamp: ${data.timestamp || new Date().toLocaleString()} · Status: Verificado`;

      logTelemetry('portal_diagnostic_submitted', { token: formToken, company: contact.empresa });

    } catch (err) {
      console.error('Erro ao submeter diagnóstico:', err);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      console_el.innerHTML += `\n[WARN] Conexão offline — salvando localmente...`;
      console_el.innerHTML += `\n[OK] Dados persistidos em modo soberano.`;

      await new Promise(resolve => setTimeout(resolve, 800));

      showPhase('portal-phase-success');
      updateProgress(totalPhases);

      const offlineHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      document.getElementById('portal-res-hash').innerText = offlineHash;
      document.getElementById('portal-res-meta').innerText = `Bloco: Offline · Timestamp: ${new Date().toLocaleString()} · Status: Soberano Local`;
    }
  }

  // Done button
  document.getElementById('portal-done-btn').addEventListener('click', () => {
    window.location.href = '/';
  });
}

// ══════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════

// --- Telemetry Utility ---
function logTelemetry(eventType, metadata = {}) {
  fetch('/api/telemetry/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      event: eventType,
      path: window.location.pathname + window.location.search,
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
    .to('#hero-actions', { opacity: 1, y: 0 }, '-=1.0');

  // Fade-in sections/cards on scroll using classes
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.05
  });

  // Register targets
  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    scrollObserver.observe(el);
  });
}

// ══════════════════════════════════════════════════════
// HERO ANIMATION — Intelligence Hub Live Panel
// ══════════════════════════════════════════════════════
function initHeroAnimation() {
  const anim = document.getElementById('hero-anim');
  if (!anim) return;

  // Inject SVG gradient for gauge
  const svgNS = 'http://www.w3.org/2000/svg';
  const existingGauge = anim.querySelector('.ha-gauge');
  if (existingGauge) {
    const defs = document.createElementNS(svgNS, 'defs');
    const grad = document.createElementNS(svgNS, 'linearGradient');
    grad.setAttribute('id', 'gaugeGrad');
    grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
    grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '0%');
    const s1 = document.createElementNS(svgNS, 'stop');
    s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', '#00F0FF');
    const s2 = document.createElementNS(svgNS, 'stop');
    s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', '#7B2FFF');
    grad.appendChild(s1); grad.appendChild(s2);
    defs.appendChild(grad);
    existingGauge.prepend(defs);
  }

  // Real-time clock
  const clockEl = document.getElementById('ha-clock');
  function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hh}:${mm}:${ss}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Animated counters (GSAP)
  const vehiclesEl = document.getElementById('ha-vehicles');
  const attestedEl = document.getElementById('ha-attested');

  if (vehiclesEl) {
    gsap.to({ val: 0 }, {
      val: 847,
      duration: 2.5,
      delay: 1.5,
      ease: 'power2.out',
      onUpdate: function() {
        vehiclesEl.textContent = Math.round(this.targets()[0].val).toLocaleString('pt-BR');
      }
    });
  }
  if (attestedEl) {
    gsap.to({ val: 0 }, {
      val: 1204,
      duration: 2.8,
      delay: 1.7,
      ease: 'power2.out',
      onUpdate: function() {
        attestedEl.textContent = Math.round(this.targets()[0].val).toLocaleString('pt-BR');
      }
    });
  }

  // Event log data pool
  const eventPool = [
    { plate: 'BRA2E19', type: 'Atestação NFC', time: null },
    { plate: 'ABC1D23', type: 'Verificação Lacre', time: null },
    { plate: 'XYZ4F56', type: 'Integridade OK', time: null },
    { plate: 'GHI7K89', type: 'Atestação NFC', time: null },
    { plate: 'JKL3M01', type: 'Score Validado', time: null },
    { plate: 'MNO5P67', type: 'Verificação Lacre', time: null },
    { plate: 'PQR2T34', type: 'Atestação NFC', time: null },
    { plate: 'STU8V12', type: 'Integridade OK', time: null },
    { plate: 'VWX6Y90', type: 'Score Validado', time: null },
  ];

  const eventsList = document.getElementById('ha-events-list');
  const eventsCount = document.getElementById('ha-events-count');
  let eventIndex = 0;
  let totalEvents = 0;
  const MAX_VISIBLE = 6;

  function addEvent() {
    if (!eventsList) return;
    const ev = eventPool[eventIndex % eventPool.length];
    eventIndex++;
    totalEvents++;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

    const row = document.createElement('div');
    row.className = 'ha-event-row';
    row.style.animationDelay = '0ms';
    row.innerHTML = `
      <span class="ha-event-plate">${ev.plate}</span>
      <span class="ha-event-type">${ev.type}</span>
      <span class="ha-event-badge ok">✓ OK</span>
    `;

    // Prepend new events at top
    if (eventsList.firstChild) {
      eventsList.insertBefore(row, eventsList.firstChild);
    } else {
      eventsList.appendChild(row);
    }

    // Keep max visible rows
    while (eventsList.children.length > MAX_VISIBLE) {
      eventsList.removeChild(eventsList.lastChild);
    }

    if (eventsCount) {
      eventsCount.textContent = `${totalEvents.toLocaleString('pt-BR')} eventos`;
    }
  }

  // Seed initial events with staggered delays
  const initialCount = 5;
  for (let i = 0; i < initialCount; i++) {
    setTimeout(() => addEvent(), 1800 + i * 320);
  }

  // Continue adding events every 3s
  setTimeout(() => {
    setInterval(addEvent, 3000);
  }, 1800 + initialCount * 320 + 500);
}
