const nav = document.querySelector('.nav');
const navBurger = document.getElementById('nav-burger');
const navLinks = document.getElementById('nav-links');

const updateNav = () => nav?.classList.toggle('scrolled', window.scrollY > 80);
updateNav();
window.addEventListener('scroll', updateNav, { passive: true });

navBurger?.addEventListener('click', () => {
  const isOpen = navLinks?.classList.toggle('open');
  navBurger.classList.toggle('open', Boolean(isOpen));
  navBurger.setAttribute('aria-expanded', String(Boolean(isOpen)));
  navBurger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});

navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  navBurger?.classList.remove('open');
  navBurger?.setAttribute('aria-expanded', 'false');
}));

const revealElements = document.querySelectorAll('.reveal-on-scroll');

function revealElement(element) {
  element.classList.add('revealed');
  element.addEventListener('transitionend', () => { element.style.willChange = 'auto'; }, { once: true });
}

if ('IntersectionObserver' in window) {
  // rootMargin antecipa o disparo antes do elemento tocar a borda inferior da tela;
  // threshold baixo evita que blocos finos (labels, headings) dependam de uma fração
  // de interseção difícil de atingir no Safari iOS.
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        revealElement(entry.target);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });

  revealElements.forEach((element) => {
    revealObserver.observe(element);
    // Rede de segurança: se o observer nunca disparar para este elemento
    // (bug de engine, elemento fora do fluxo normal, timing do Safari Mobile etc.),
    // o conteúdo é revelado de qualquer forma — nunca deve ficar invisível.
    setTimeout(() => {
      if (!element.classList.contains('revealed')) {
        revealObserver.unobserve(element);
        revealElement(element);
      }
    }, 1800);
  });
} else {
  // Sem suporte a IntersectionObserver: mostra tudo de imediato.
  revealElements.forEach(revealElement);
}

const caseContent = {
  seguradoras: {
    number: '01', label: 'Seguradoras', title: 'Regule sinistros com evidências melhores.',
    description: 'Apoie a análise de ocorrências com registros confiáveis desde a origem, reduzindo zonas cinzentas, retrabalho e tempo de decisão.',
    outcomes: ['Triagem mais consistente', 'Menos disputas sobre o evento', 'Melhor experiência para o segurado']
  },
  frotas: {
    number: '02', label: 'Frotas', title: 'Trate exceções sem reconstruir a operação.',
    description: 'Conecte eventos de campo a uma base verificável para responder incidentes, atribuir responsabilidades e proteger ativos.',
    outcomes: ['Menor tempo de apuração', 'Responsabilidades mais claras', 'Mais controle sobre ocorrências']
  },
  logistica: {
    number: '03', label: 'Logística', title: 'Reduza zonas cegas entre coleta e entrega.',
    description: 'Crie continuidade de evidência entre ativos, operadores e parceiros para lidar com avarias, desvios e divergências.',
    outcomes: ['Menos conflito entre parceiros', 'Auditorias mais rápidas', 'Evidência para eventos críticos']
  },
  mobilidade: {
    number: '04', label: 'Mobilidade', title: 'Escale confiança junto com a rede.',
    description: 'Adicione uma camada verificável a jornadas distribuídas, sem transformar cada novo parceiro em um novo ponto de incerteza.',
    outcomes: ['Integração com o ecossistema', 'Governança entre participantes', 'Decisões consistentes em escala']
  }
};

function applyCase(key) {
  const content = caseContent[key];
  if (!content) return;
  document.querySelectorAll('[data-case]').forEach((item) => item.setAttribute('aria-selected', String(item.dataset.case === key)));
  document.querySelector('.case-number').textContent = content.number;
  document.getElementById('case-label').textContent = content.label;
  document.getElementById('case-title').textContent = content.title;
  document.getElementById('case-description').textContent = content.description;
  document.getElementById('case-outcomes').innerHTML = content.outcomes.map((outcome) => `<li>${outcome}</li>`).join('');
}

document.querySelectorAll('[data-case]').forEach((button) => {
  button.addEventListener('click', () => applyCase(button.dataset.case));
});

// ── Diagnóstico rápido: a pergunta que personaliza o resto da página ──
const painProfiles = {
  fraude: {
    label: 'Fraudes em Sinistros',
    tag: 'SEGURADORAS · FRAUDE',
    caseKey: 'seguradoras',
    segmento: 'seguradora',
    dor: 'fraude',
    insight: 'Operações como a sua costumam perder tempo e credibilidade reconstruindo o que aconteceu depois do sinistro. A GuardDrive atua exatamente nesse ponto: evidência confiável desde a origem do evento, antes que a disputa comece.',
    benefitTitle: 'Menor custo por sinistro contestado',
    ctaLabel: 'PRÓXIMO PASSO · FRAUDE EM SINISTROS',
    ctaTitle: 'Onde a fraude em sinistros custa mais para sua operação?',
    ctaButton: 'Diagnosticar exposição a fraude ↗',
  },
  roubo: {
    label: 'Roubo de veículos',
    tag: 'FROTAS · PROTEÇÃO DE ATIVOS',
    caseKey: 'frotas',
    segmento: 'frota',
    dor: 'operacao',
    insight: 'Operações como a sua costumam decidir sobre um ativo com base em informação incompleta. A GuardDrive atua exatamente nesse ponto: identidade e histórico verificáveis do veículo, disponíveis no momento da ocorrência.',
    benefitTitle: 'Menor custo por veículo exposto',
    ctaLabel: 'PRÓXIMO PASSO · ROUBO DE VEÍCULOS',
    ctaTitle: 'Onde o roubo de veículos custa mais para sua frota?',
    ctaButton: 'Diagnosticar exposição da frota ↗',
  },
  rastreabilidade: {
    label: 'Falta de rastreabilidade',
    tag: 'LOGÍSTICA · CONTINUIDADE',
    caseKey: 'logistica',
    segmento: 'logistica',
    dor: 'integracao',
    insight: 'Operações como a sua costumam perder a evidência exatamente na transição entre parceiros. A GuardDrive atua exatamente nesse ponto: continuidade de evidência do início ao fim da jornada.',
    benefitTitle: 'Menor custo por divergência entre parceiros',
    ctaLabel: 'PRÓXIMO PASSO · RASTREABILIDADE',
    ctaTitle: 'Onde a falta de rastreabilidade custa mais na sua operação?',
    ctaButton: 'Diagnosticar zonas cegas ↗',
  },
  auditoria: {
    label: 'Auditorias lentas',
    tag: 'GOVERNANÇA · CONFORMIDADE',
    caseKey: null,
    segmento: '',
    dor: 'auditoria',
    insight: 'Operações como a sua costumam gastar mais tempo reunindo prova do que decidindo. A GuardDrive atua exatamente nesse ponto: histórico auditável, pronto para consulta, sem reconstrução manual.',
    benefitTitle: 'Menor custo por ciclo de auditoria',
    ctaLabel: 'PRÓXIMO PASSO · AUDITORIAS',
    ctaTitle: 'Onde a lentidão de auditoria custa mais para sua operação?',
    ctaButton: 'Diagnosticar ciclo de auditoria ↗',
  },
  outro: {
    label: 'Outro',
    tag: 'DIAGNÓSTICO PERSONALIZADO',
    caseKey: null,
    segmento: '',
    dor: '',
    insight: 'Cada operação tem um ponto de maior exposição. Conte esse contexto em uma conversa exploratória — sem NDA nesta etapa — e mapeamos juntos onde a GuardDrive gera mais valor.',
    benefitTitle: 'Menor custo por ocorrência',
    ctaLabel: 'PRÓXIMO PASSO',
    ctaTitle: 'Onde a falta de evidência custa mais para sua operação?',
    ctaButton: 'Solicitar Diagnóstico Executivo ↗',
  },
};

const quizOptions = document.querySelectorAll('.quiz-option');
const quizAnswer = document.getElementById('quiz-answer');

function applyPain(key) {
  const profile = painProfiles[key];
  if (!profile) return;

  quizOptions.forEach((option) => option.setAttribute('aria-checked', String(option.dataset.pain === key)));

  document.getElementById('quiz-answer-tag').textContent = profile.tag;
  document.getElementById('quiz-answer-insight').textContent = profile.insight;
  const titleEl = document.getElementById('quiz-answer-title');
  if (profile.caseKey && caseContent[profile.caseKey]) {
    titleEl.textContent = caseContent[profile.caseKey].title;
    applyCase(profile.caseKey);
  } else {
    titleEl.textContent = profile.label;
  }
  quizAnswer.hidden = false;
  requestAnimationFrame(() => quizAnswer.classList.add('is-visible'));

  const benefitTitle = document.getElementById('benefit-accent-title');
  if (benefitTitle) benefitTitle.textContent = profile.benefitTitle;

  const ctaLabel = document.getElementById('final-cta-label');
  const ctaTitle = document.getElementById('final-cta-title');
  const ctaButton = document.getElementById('final-cta-button');
  if (ctaLabel) ctaLabel.textContent = profile.ctaLabel;
  if (ctaTitle) ctaTitle.textContent = profile.ctaTitle;
  if (ctaButton) ctaButton.textContent = profile.ctaButton;

  const params = new URLSearchParams();
  if (profile.dor) params.set('dor', profile.dor);
  if (profile.segmento) params.set('segmento', profile.segmento);
  const query = params.toString();
  document.querySelectorAll('a[href="/diagnostico"]').forEach((link) => {
    link.href = query ? `/diagnostico?${query}` : '/diagnostico';
  });

  fetch('/api/telemetry/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'landing_pain_select', path: window.location.pathname, metadata: { pain: key } }),
  }).catch(() => {});
}

quizOptions.forEach((option) => {
  option.addEventListener('click', () => applyPain(option.dataset.pain));
});

document.querySelectorAll('.faq-acc-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-acc-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-acc-item').forEach((faq) => {
      faq.classList.remove('open');
      faq.querySelector('.faq-acc-btn').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});
