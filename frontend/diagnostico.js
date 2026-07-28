const form = document.getElementById('diagnostic-form');
const errorMessage = document.getElementById('diagnostic-error');
const formWrap = document.getElementById('diagnostic-form-wrap');
const successState = document.getElementById('diagnostic-success');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorMessage.classList.remove('visible');

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando contexto...';

  const payload = {
    nome: document.getElementById('diag-nome').value.trim(),
    cargo: document.getElementById('diag-cargo').value.trim(),
    empresa: document.getElementById('diag-empresa').value.trim(),
    email: document.getElementById('diag-email').value.trim(),
    telefone: document.getElementById('diag-telefone').value.trim(),
    segmento: document.getElementById('diag-segmento').value,
    dor: document.getElementById('diag-dor').value,
    frota: document.getElementById('diag-frota').value,
    plano: 'piloto',
    source: 'diagnostico_executivo'
  };

  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || 'Não foi possível enviar sua solicitação.');
    formWrap.hidden = true;
    successState.hidden = false;
    successState.focus?.();
  } catch (error) {
    errorMessage.textContent = error.message || 'Não foi possível enviar agora. Tente novamente em instantes.';
    errorMessage.classList.add('visible');
    submitButton.disabled = false;
    submitButton.innerHTML = originalLabel;
  }
});
