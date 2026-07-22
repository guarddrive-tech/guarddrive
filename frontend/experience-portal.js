import { gsap } from 'gsap';

// ══════════════════════════════════════════════════════════════
// EXPERIENCE PORTAL — Operational Trust Journey™
// A cinematic, progressive replacement for the old "click → form"
// flow behind every "Solicitar Diagnóstico" CTA on the page.
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('xp-overlay');
  if (!overlay) return; // ?r=token diagnostic portal pages don't have this markup

  const triggers = document.querySelectorAll('[data-xp-trigger="true"]');
  const closeBtn = document.getElementById('xp-close-btn');

  const state = {
    nome: '',
    empresa: '',
    cargo: '',
    segmento: '',
    fleet: '',
    problem: '',
    diag: null,
    timeline: null,
  };

  triggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openPortal();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closePortal);
  overlay.querySelector('.xp-backdrop')?.addEventListener('click', closePortal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('xp-open')) closePortal();
  });

  function openPortal() {
    overlay.classList.add('xp-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    logTelemetry('xp_opened');
    goToStage('welcome');
  }

  function closePortal() {
    if (state.timeline) {
      state.timeline.kill();
      state.timeline = null;
    }
    overlay.classList.remove('xp-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    logTelemetry('xp_closed', { last_stage: currentStageId });
  }

  // ── Stage machine ─────────────────────────────────────────
  const STAGE_STEP_MAP = {
    welcome: null,
    identify: 'identify',
    profile: 'profile',
    hub: 'assess',
    final: 'trust',
    report: 'trust',
  };
  const STEP_ORDER = ['identify', 'understand', 'profile', 'assess', 'attest', 'recommend', 'trust'];

  let currentStageId = null;

  function goToStage(id) {
    currentStageId = id;
    overlay.querySelectorAll('.xp-stage').forEach((s) => { s.style.display = 'none'; });
    const el = document.getElementById(`xp-stage-${id}`);
    if (el) el.style.display = 'flex';
    overlay.scrollTop = 0;
    updateStepper(STAGE_STEP_MAP[id]);
  }

  function updateStepper(activeStep) {
    const activeIdx = STEP_ORDER.indexOf(activeStep);
    overlay.querySelectorAll('.xp-step').forEach((el) => {
      const step = el.dataset.step;
      const idx = STEP_ORDER.indexOf(step);
      el.classList.remove('active', 'done');
      if (activeStep == null) return;
      if (idx < activeIdx) el.classList.add('done');
      else if (idx === activeIdx) el.classList.add('active');
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str ?? '');
    return div.innerHTML;
  }

  // ── STAGE 1: Welcome ──────────────────────────────────────
  document.getElementById('xp-start-btn')?.addEventListener('click', () => {
    logTelemetry('xp_started');
    goToStage('identify');
  });

  // ── STAGE 2: Identify ─────────────────────────────────────
  const identifyError = document.getElementById('xp-identify-error');
  document.getElementById('xp-identify-btn')?.addEventListener('click', () => {
    const nome = document.getElementById('xp-nome').value.trim();
    const empresa = document.getElementById('xp-empresa').value.trim();
    const cargo = document.getElementById('xp-cargo').value.trim();
    const segmento = document.getElementById('xp-segmento').value;

    if (!nome || !cargo || !segmento) {
      identifyError.classList.add('xp-visible');
      return;
    }
    identifyError.classList.remove('xp-visible');

    state.nome = nome;
    state.empresa = empresa || 'Não informado';
    state.cargo = cargo;
    state.segmento = segmento;

    logTelemetry('xp_identified', { segmento, cargo });
    renderProfile();
    goToStage('profile');
  });

  // ── STAGE 3: Profile reveal + calibration ────────────────
  const SEGMENT_COPY = {
    seguradora: {
      label: 'Seguradora',
      sub: 'Perfil calibrado para operações de subscrição e regulação de sinistros.',
      problems: ['Fraude em sinistros', 'Tempo de regulação alto', 'Falta de evidência técnica', 'Custo de perícia'],
    },
    frotista: {
      label: 'Locadora / Frotista',
      sub: 'Perfil calibrado para gestão de ativos e ciclo de vida de frota.',
      problems: ['Roubo e desvio de veículos', 'Depreciação sem histórico', 'Auditoria manual de devolução', 'Disputas com locatários'],
    },
    logistica: {
      label: 'Logística / Transportadora',
      sub: 'Perfil calibrado para rastreabilidade de carga e cadeia de custódia.',
      problems: ['Jammers de rastreamento', 'Avarias sem responsável definido', 'Atraso em SLA de entrega', 'Auditoria de motoristas'],
    },
    municipio: {
      label: 'Município / Governo',
      sub: 'Perfil calibrado para conformidade de frota pública e prestação de contas.',
      problems: ['Uso indevido de veículos oficiais', 'Falta de transparência para auditoria', 'Manutenção sem histórico', 'Pressão orçamentária'],
    },
    outro: {
      label: 'Operação Customizada',
      sub: 'Perfil calibrado de forma genérica — refine no diagnóstico completo.',
      problems: ['Falta de evidência operacional', 'Processos manuais', 'Risco não mensurado', 'Custos operacionais altos'],
    },
  };

  function renderProfile() {
    const seg = SEGMENT_COPY[state.segmento] || SEGMENT_COPY.outro;
    document.getElementById('xp-profile-title').textContent = `Perfil identificado: ${seg.label}.`;
    document.getElementById('xp-profile-sub').textContent = `${state.nome.split(' ')[0]}, ${seg.sub}`;

    const fleetRow = document.getElementById('xp-chips-fleet');
    const problemRow = document.getElementById('xp-chips-problem');
    fleetRow.querySelectorAll('.xp-chip').forEach((c) => c.classList.remove('selected'));
    problemRow.innerHTML = '';
    state.fleet = '';
    state.problem = '';

    fleetRow.querySelectorAll('.xp-chip').forEach((chip) => {
      chip.onclick = () => {
        fleetRow.querySelectorAll('.xp-chip').forEach((c) => c.classList.remove('selected'));
        chip.classList.add('selected');
        state.fleet = chip.dataset.value;
      };
    });

    seg.problems.forEach((label) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'xp-chip';
      chip.textContent = label;
      chip.dataset.value = label;
      chip.onclick = () => {
        problemRow.querySelectorAll('.xp-chip').forEach((c) => c.classList.remove('selected'));
        chip.classList.add('selected');
        state.problem = label;
      };
      problemRow.appendChild(chip);
    });
  }

  document.getElementById('xp-profile-btn')?.addEventListener('click', () => {
    logTelemetry('xp_calibrated', { fleet: state.fleet, problem: state.problem });
    state.diag = generateDiagnostic(state);
    goToStage('hub');
    runIntelligenceHub();
  });

  // ── Deterministic pseudo-random diagnostic generator ─────
  function hashSeed(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    }
    return h;
  }
  function mulberry32(seed) {
    let a = seed;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const ENGINES = [
    { key: 'risk', icon: '🧠', label: 'Risk Engine', verb: 'Mapeando vetores de risco operacional...' },
    { key: 'compliance', icon: '⚖', label: 'Compliance Engine', verb: 'Cruzando exigências regulatórias do segmento...' },
    { key: 'trust', icon: '🔐', label: 'Trust Engine', verb: 'Calculando score de confiança operacional...' },
    { key: 'mobility', icon: '🚛', label: 'Mobility Engine', verb: 'Analisando padrões de movimentação da frota...' },
    { key: 'roi', icon: '📈', label: 'ROI Engine', verb: 'Projetando retorno sobre investimento...' },
    { key: 'intelligence', icon: '🛰', label: 'Intelligence Engine', verb: 'Consolidando inteligência para o laudo final...' },
  ];

  const RADAR_AXES = ['Identidade', 'Conformidade', 'Rastreabilidade', 'Sinistro', 'Fraude', 'ROI'];

  function generateDiagnostic(s) {
    const seed = hashSeed(`${s.nome}|${s.empresa}|${s.cargo}|${s.segmento}|${s.fleet}|${s.problem}`);
    const rand = mulberry32(seed);

    const engineScores = {};
    ENGINES.forEach((e) => { engineScores[e.key] = Math.round(68 + rand() * 30); });

    const radarValues = RADAR_AXES.map(() => Math.round(55 + rand() * 42));

    const trustScore = (91 + rand() * 8).toFixed(1);
    const riskLevelPool = ['Baixo', 'Moderado', 'Moderado-Alto'];
    const riskLevel = riskLevelPool[Math.floor(rand() * riskLevelPool.length)];
    const roiPool = ['Alto', 'Muito Alto'];
    const roiTier = roiPool[Math.floor(rand() * roiPool.length)];

    const reportId = `GD-${Math.floor(100000 + rand() * 899999)}`;

    const heatCells = Array.from({ length: 32 }, () => {
      const r = rand();
      if (r < 0.55) return 'low';
      if (r < 0.85) return 'medium';
      return 'high';
    });

    return { engineScores, radarValues, trustScore, riskLevel, roiTier, reportId, heatCells, seed };
  }

  // ── STAGE 4-8: Intelligence Hub cinematic sequence ───────
  function runIntelligenceHub() {
    const diag = state.diag;
    const seg = SEGMENT_COPY[state.segmento] || SEGMENT_COPY.outro;

    // Reset engines
    const enginesEl = document.getElementById('xp-engines');
    enginesEl.innerHTML = ENGINES.map((e) => `
      <div class="xp-engine" id="xp-engine-${e.key}">
        <div class="xp-engine-head">
          <span class="xp-engine-icon">${e.icon}</span>
          <span class="xp-engine-label">${e.label}</span>
        </div>
        <p class="xp-engine-verb">${e.verb}</p>
        <div class="xp-engine-bar"><div class="xp-engine-fill" id="xp-engine-fill-${e.key}"></div></div>
        <div class="xp-engine-status" id="xp-engine-status-${e.key}">processando...</div>
      </div>
    `).join('');

    document.getElementById('xp-log').innerHTML = '';
    document.getElementById('xp-report-lines').innerHTML = '';
    document.getElementById('xp-heatmap').innerHTML = '';
    buildRadar(new Array(RADAR_AXES.length).fill(30));

    const LOG_STEPS = [
      'Diagnóstico iniciado...',
      `Perfil ${seg.label} carregado...`,
      'Consultando base de eventos operacionais...',
      'Cruzando exigências de conformidade do segmento...',
      'Calculando exposição a risco por vetor...',
      'Simulando cenários de sinistro e fraude...',
      'Projetando impacto financeiro (ROI)...',
      'Compilando benchmark setorial...',
      'Estruturando recomendações operacionais...',
      'Assinando evidência do diagnóstico...',
    ];

    const REPORT_LINES = [
      'Resumo Executivo',
      'Perfil Operacional',
      'Vetores de Risco',
      'Benchmark',
      'ROI',
      'Recomendações',
      'Score Final',
    ];

    if (state.timeline) state.timeline.kill();
    const tl = gsap.timeline();
    state.timeline = tl;

    // Engines run in visual parallel, staggered start/finish across ~7s
    ENGINES.forEach((e, i) => {
      const start = 0.3 + i * 0.35;
      const dur = 2.6 + (i % 3) * 0.4;
      const fill = document.getElementById(`xp-engine-fill-${e.key}`);
      const card = document.getElementById(`xp-engine-${e.key}`);
      const statusEl = document.getElementById(`xp-engine-status-${e.key}`);
      tl.to(fill, { width: '100%', duration: dur, ease: 'power2.inOut' }, start);
      tl.call(() => {
        card.classList.add('done');
        statusEl.textContent = '✓ concluído';
        statusEl.classList.add('xp-engine-done');
      }, null, start + dur);
    });

    // Sequential log lines
    const logEl = document.getElementById('xp-log');
    LOG_STEPS.forEach((line, i) => {
      tl.call(() => {
        const row = document.createElement('div');
        row.className = 'xp-log-line';
        row.textContent = line;
        logEl.appendChild(row);
        logEl.scrollTop = logEl.scrollHeight;
      }, null, 0.5 + i * 0.85);
    });

    // Radar builds progressively toward final values
    const radarSteps = 5;
    for (let step = 1; step <= radarSteps; step++) {
      tl.call(() => {
        const progress = step / radarSteps;
        const values = diag.radarValues.map((v) => Math.round(30 + (v - 30) * progress));
        buildRadar(values);
      }, null, 1.2 + step * 1.1);
    }

    // Heatmap cells pop in
    tl.call(() => {
      const heatEl = document.getElementById('xp-heatmap');
      diag.heatCells.forEach((sev, i) => {
        const cell = document.createElement('div');
        cell.className = `xp-heat-cell xp-heat-${sev}`;
        cell.style.animationDelay = `${i * 35}ms`;
        heatEl.appendChild(cell);
      });
    }, null, 3.5);

    // Report lines build one by one with checkmarks
    const reportEl = document.getElementById('xp-report-lines');
    REPORT_LINES.forEach((label, i) => {
      tl.call(() => {
        const row = document.createElement('div');
        row.className = 'xp-report-line';
        row.innerHTML = `<span class="xp-report-check">✓</span><span>${escapeHtml(label)}</span>`;
        reportEl.appendChild(row);
      }, null, 4.5 + i * 0.7);
    });

    // Transition to final GuardProof stage
    tl.call(() => {
      logTelemetry('xp_diagnostic_built', { segmento: state.segmento, report_id: diag.reportId });
      renderFinal();
      goToStage('final');
    }, null, '+=0.8');
  }

  function buildRadar(values) {
    const wrap = document.getElementById('xp-radar-wrap');
    const R = 38, cx = 50, cy = 50;
    const n = RADAR_AXES.length;
    const pt = (i, v) => {
      const angle = (-90 + i * (360 / n)) * (Math.PI / 180);
      const r = (v / 100) * R;
      return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
    };
    const gridRings = [0.33, 0.66, 1].map((f) => {
      const pts = RADAR_AXES.map((_, i) => pt(i, f * 100).join(',')).join(' ');
      return `<polygon class="xp-radar-grid" points="${pts}" />`;
    }).join('');
    const axisLines = RADAR_AXES.map((_, i) => {
      const [x, y] = pt(i, 100);
      return `<line class="xp-radar-axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" />`;
    }).join('');
    const labels = RADAR_AXES.map((label, i) => {
      const [x, y] = pt(i, 118);
      return `<text class="xp-radar-label" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${label}</text>`;
    }).join('');
    const valuePts = values.map((v, i) => pt(i, v).join(',')).join(' ');

    wrap.innerHTML = `
      <div class="xp-radar-sweep"></div>
      <svg class="xp-radar-svg" viewBox="0 0 100 100">
        ${gridRings}
        ${axisLines}
        <polygon class="xp-radar-value" points="${valuePts}" />
        ${labels}
      </svg>
    `;
  }

  // ── STAGE 9: GuardProof final ────────────────────────────
  function renderFinal() {
    const diag = state.diag;
    const gauge = document.getElementById('xp-gp-gauge-arc');
    const scoreEl = document.getElementById('xp-gp-score');
    const target = parseFloat(diag.trustScore);

    gsap.to({ val: 0 }, {
      val: target,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: function () {
        const v = this.targets()[0].val;
        scoreEl.textContent = v.toFixed(1);
        const circumference = 251;
        const filled = (v / 100) * circumference;
        gauge.setAttribute('stroke-dasharray', `${filled} ${circumference}`);
      },
    });

    document.getElementById('xp-gp-risk').textContent = diag.riskLevel;
    document.getElementById('xp-gp-roi').textContent = diag.roiTier;
    document.getElementById('xp-gp-reportid').textContent = diag.reportId;

    renderReportDoc();
  }

  function renderReportDoc() {
    const diag = state.diag;
    const seg = SEGMENT_COPY[state.segmento] || SEGMENT_COPY.outro;
    const doc = document.getElementById('xp-report-doc');
    const firstName = escapeHtml(state.nome.split(' ')[0] || state.nome);

    doc.innerHTML = `
      <div class="xp-report-doc-header">
        <div class="xp-report-doc-tag">GUARDPROOF™ · ${escapeHtml(diag.reportId)}</div>
        <h3>Diagnóstico Operacional — ${escapeHtml(state.empresa)}</h3>
      </div>
      <div class="xp-report-section">
        <h4>Resumo Executivo</h4>
        <p>${firstName}, com base no perfil de <strong>${escapeHtml(seg.label)}</strong> e no desafio prioritário informado — <strong>${escapeHtml(state.problem || 'não especificado')}</strong> —, a operação da ${escapeHtml(state.empresa)} apresenta um Trust Score de ${escapeHtml(diag.trustScore)}%, com nível de risco ${escapeHtml(diag.riskLevel).toLowerCase()} e potencial de ROI ${escapeHtml(diag.roiTier).toLowerCase()}.</p>
      </div>
      <div class="xp-report-section">
        <h4>Perfil Operacional</h4>
        <p>Segmento: ${escapeHtml(seg.label)} · Ativos sob gestão: ${escapeHtml(state.fleet || 'não informado')} · Cargo do respondente: ${escapeHtml(state.cargo)}.</p>
      </div>
      <div class="xp-report-section">
        <h4>Vetores de Risco</h4>
        <ul>
          ${RADAR_AXES.map((axis, i) => `<li>${escapeHtml(axis)}: ${diag.radarValues[i]}%</li>`).join('')}
        </ul>
      </div>
      <div class="xp-report-section">
        <h4>Benchmark</h4>
        <p>Operações do mesmo segmento e porte apresentam, em média, exposição superior a esta — o diferencial concentra-se na resposta ao desafio de "${escapeHtml(state.problem || 'operação')}".</p>
      </div>
      <div class="xp-report-section">
        <h4>ROI</h4>
        <p>Projeção de ROI classificada como ${escapeHtml(diag.roiTier).toLowerCase()}, sustentada pela redução de retrabalho manual e pela aceleração de processos de evidência e conformidade.</p>
      </div>
      <div class="xp-report-section">
        <h4>Recomendações</h4>
        <ul>
          <li>Ativar camada de evidência auditável para os vetores de maior exposição.</li>
          <li>Priorizar o desafio "${escapeHtml(state.problem || 'operação')}" no primeiro ciclo de implantação.</li>
          <li>Validar o programa piloto antes da expansão total da frota.</li>
        </ul>
      </div>
      <div class="xp-report-section">
        <h4>Score Final</h4>
        <div class="xp-report-score-big">${escapeHtml(diag.trustScore)}%<span>Operational Trust Score</span></div>
      </div>
    `;
  }

  document.getElementById('xp-open-report-btn')?.addEventListener('click', () => {
    logTelemetry('xp_report_opened');
    goToStage('report');
  });
  document.getElementById('xp-report-back-btn')?.addEventListener('click', () => goToStage('final'));

  document.getElementById('xp-demo-btn')?.addEventListener('click', () => {
    logTelemetry('xp_handoff_demo');
    handoffToContact();
  });
  document.getElementById('xp-pilot-btn')?.addEventListener('click', () => {
    logTelemetry('xp_handoff_pilot');
    handoffToPilot();
  });

  // ── Handoff to existing forms (email capture happens here) ──
  function handoffToContact() {
    closePortal();
    const nomeEl = document.getElementById('nome');
    const empresaEl = document.getElementById('empresa');
    const segmentoEl = document.getElementById('segmento');
    if (nomeEl) nomeEl.value = state.nome;
    if (empresaEl) empresaEl.value = state.empresa;
    if (segmentoEl) segmentoEl.value = state.segmento;

    const ndaAcceptBtn = document.getElementById('nda-accept-btn');
    const ndaCheckbox = document.getElementById('nda-checkbox');
    const modalConfirm = document.getElementById('modal-confirm');
    if (ndaAcceptBtn) ndaAcceptBtn.click();
    setTimeout(() => {
      if (ndaCheckbox) {
        ndaCheckbox.checked = true;
        ndaCheckbox.dispatchEvent(new Event('change'));
      }
      if (modalConfirm) modalConfirm.click();
    }, 150);

    setTimeout(() => {
      document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  }

  function handoffToPilot() {
    closePortal();
    const nomeEl = document.getElementById('pilot-nome');
    const empresaEl = document.getElementById('pilot-empresa');
    const cargoEl = document.getElementById('pilot-cargo');
    if (nomeEl) nomeEl.value = state.nome;
    if (empresaEl) empresaEl.value = state.empresa;
    if (cargoEl) cargoEl.value = state.cargo;

    setTimeout(() => {
      document.getElementById('programa-piloto')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // ── Telemetry (reuses existing endpoint) ─────────────────
  function logTelemetry(eventType, metadata = {}) {
    fetch('/api/telemetry/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventType,
        path: window.location.pathname + window.location.search,
        timestamp: new Date().toISOString(),
        metadata,
      }),
    }).catch(() => {
      console.log(`[Telemetry Offline] Event: ${eventType}`, metadata);
    });
  }
});
