import {
  login,
  logout,
  getUser,
  handleAuthCallback,
  requestPasswordRecovery,
  updateUser,
  AuthError,
} from '@netlify/identity';

const STAFF_ROLES = ['admin', 'viewer', 'sdr'];
const ATTEMPT_KEY = 'gd_admin_login_attempts';
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;

const errorBox = document.getElementById('login-error');
const infoBox = document.getElementById('login-info');
const loginForm = document.getElementById('login-form');
const resetForm = document.getElementById('reset-form');
const submitBtn = document.getElementById('login-submit');

function showError(msg) {
  infoBox.style.display = 'none';
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
}

function showInfo(msg) {
  errorBox.style.display = 'none';
  infoBox.textContent = msg;
  infoBox.style.display = 'block';
}

// Lightweight client-side attempt throttle; GoTrue (Netlify Identity's auth
// server) enforces the authoritative rate limit server-side.
function attemptsExceeded() {
  const raw = localStorage.getItem(ATTEMPT_KEY);
  const attempts = raw ? JSON.parse(raw).filter((t) => Date.now() - t < WINDOW_MS) : [];
  return attempts.length >= MAX_ATTEMPTS;
}

function recordAttempt() {
  const raw = localStorage.getItem(ATTEMPT_KEY);
  const attempts = raw ? JSON.parse(raw).filter((t) => Date.now() - t < WINDOW_MS) : [];
  attempts.push(Date.now());
  localStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempts));
}

function clearAttempts() {
  localStorage.removeItem(ATTEMPT_KEY);
}

async function redirectIfStaff(user) {
  const roles = user.roles ?? [];
  if (roles.some((r) => STAFF_ROLES.includes(r))) {
    window.location.href = '/admin/dashboard';
    return true;
  }
  showError('Sua conta não possui permissão para acessar o painel administrativo.');
  await logout().catch(() => {});
  return false;
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (attemptsExceeded()) {
    showError('Muitas tentativas de login. Aguarde um minuto antes de tentar novamente.');
    return;
  }

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  submitBtn.disabled = true;
  errorBox.style.display = 'none';
  infoBox.style.display = 'none';

  try {
    const user = await login(email, password);
    clearAttempts();
    await redirectIfStaff(user);
  } catch (err) {
    recordAttempt();
    if (err instanceof AuthError) {
      // Generic message regardless of cause — never confirm which field was wrong.
      showError('Credenciais inválidas.');
    } else {
      showError('Não foi possível conectar ao serviço de autenticação. Tente novamente.');
    }
  } finally {
    submitBtn.disabled = false;
  }
});

document.getElementById('forgot-btn').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value.trim();
  if (!email) {
    showError('Informe seu e-mail corporativo para receber o link de recuperação.');
    return;
  }
  try {
    await requestPasswordRecovery(email);
    showInfo('Se este e-mail estiver cadastrado, enviamos um link de recuperação de senha.');
  } catch (err) {
    showInfo('Se este e-mail estiver cadastrado, enviamos um link de recuperação de senha.');
  }
});

resetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById('reset-password').value;
  try {
    const user = await updateUser({ password: newPassword });
    showInfo('Senha atualizada com sucesso.');
    await redirectIfStaff(user);
  } catch (err) {
    showError(err instanceof AuthError ? err.message : 'Não foi possível atualizar a senha.');
  }
});

(async function init() {
  try {
    const result = await handleAuthCallback();
    if (result?.type === 'recovery') {
      loginForm.style.display = 'none';
      resetForm.style.display = 'block';
      return;
    }
    if (result?.user) {
      await redirectIfStaff(result.user);
      return;
    }
  } catch {
    // No callback in the URL hash — normal page load.
  }

  const existing = await getUser();
  if (existing) {
    await redirectIfStaff(existing);
  }
})();
