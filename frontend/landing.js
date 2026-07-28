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

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal-on-scroll').forEach((element) => revealObserver.observe(element));

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

document.querySelectorAll('[data-case]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-case]').forEach((item) => item.setAttribute('aria-selected', 'false'));
    button.setAttribute('aria-selected', 'true');
    const content = caseContent[button.dataset.case];
    document.querySelector('.case-number').textContent = content.number;
    document.getElementById('case-label').textContent = content.label;
    document.getElementById('case-title').textContent = content.title;
    document.getElementById('case-description').textContent = content.description;
    document.getElementById('case-outcomes').innerHTML = content.outcomes.map((outcome) => `<li>${outcome}</li>`).join('');
  });
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
