import type { Config, Context } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { guardTags, telemetry } from '../../db/schema.js';
import { isValidGtid, normalizeGtid } from '../../lib/gtid.js';

type ResolvedState = 'active' | 'revoked' | 'replaced' | 'unknown';

// Statuses this pilot's `guard_tags.status` column may legitimately hold.
// Anything else read back from the database (a typo, a future/undocumented
// value, manual DB edit, etc.) must fail closed to 'unknown' — it must never
// be passed through and accidentally rendered as an active identity.
const KNOWN_STATUSES: readonly string[] = ['active', 'revoked', 'replaced'];

function toResolvedState(status: string): ResolvedState {
  return (KNOWN_STATUSES as string[]).includes(status) ? (status as ResolvedState) : 'unknown';
}

const STATE_COPY: Record<ResolvedState, { httpStatus: number; accent: string; headline: string; subheadline: string }> = {
  active: {
    httpStatus: 200,
    accent: '#00FF88',
    headline: 'IDENTIDADE VERIFICADA',
    subheadline: 'Selo GuardDrive ativo',
  },
  revoked: {
    httpStatus: 200,
    accent: '#ff4a4a',
    headline: 'SELO REVOGADO',
    subheadline: 'Este selo GuardDrive foi revogado e não representa mais uma identidade válida.',
  },
  replaced: {
    httpStatus: 200,
    accent: '#FFB800',
    headline: 'SELO SUBSTITUÍDO',
    subheadline: 'Este selo GuardDrive foi substituído por um novo selo.',
  },
  unknown: {
    httpStatus: 404,
    accent: '#6e7491',
    headline: 'SELO NÃO ENCONTRADO',
    subheadline: 'Não foi possível localizar esse identificador GuardDrive.',
  },
};

// Applied to every response this function returns, including error paths.
// Minimal but intentional: no inline scripts, no external resources, no
// framing by another origin, no MIME-sniffing, no referrer leakage of the
// GTID to a third party via the "Sobre o GuardDrive" outbound-looking link
// (it's same-origin, but the policy is defense-in-depth regardless).
const SECURITY_HEADERS: Record<string, string> = {
  'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function renderPage(state: ResolvedState, gtid: string, activatedAt: Date | null): string {
  const copy = STATE_COPY[state];
  const dateBlock =
    state === 'active' && activatedAt
      ? `<p class="meta">Ativado em:<br><strong>${escapeHtml(formatDate(activatedAt))}</strong></p>`
      : '';

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>GuardDrive — Verificação de Selo</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #030305; color: #fff; padding: 24px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  .card { max-width: 380px; width: 100%; text-align: center; }
  .brand { font-size: 0.8rem; letter-spacing: 0.35em; color: #6e7491; margin: 0 0 40px; }
  .headline { font-size: 1.4rem; font-weight: 700; letter-spacing: 0.02em; color: ${copy.accent}; margin: 0 0 12px; }
  .subheadline { font-size: 0.95rem; color: #fff; opacity: 0.85; margin: 0 0 28px; line-height: 1.5; }
  .gtid {
    font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 1rem; letter-spacing: 0.06em;
    word-break: break-all; padding: 16px; border: 1px solid rgba(255,255,255,0.12); border-radius: 8px;
    margin: 0 0 24px;
  }
  .meta { font-size: 0.8rem; color: #6e7491; margin: 0 0 28px; }
  .meta strong { color: #fff; }
  .about {
    display: inline-block; font-size: 0.8rem; color: #00F0FF; text-decoration: none;
    border: 1px solid rgba(0,240,255,0.3); border-radius: 999px; padding: 8px 20px; margin-bottom: 24px;
  }
  .tagline { font-size: 0.68rem; letter-spacing: 0.15em; color: #6e7491; text-transform: uppercase; }
</style>
</head>
<body>
  <div class="card">
    <div class="brand">GUARDDRIVE</div>
    <h1 class="headline">${copy.headline}</h1>
    <p class="subheadline">${escapeHtml(copy.subheadline)}</p>
    <div class="gtid">${escapeHtml(gtid)}</div>
    ${dateBlock}
    <div><a class="about" href="/">Sobre o GuardDrive</a></div>
    <div class="tagline">Operational Trust for Mobility</div>
  </div>
</body>
</html>`;
}

// Deliberately NOT one of the four ResolvedState/STATE_COPY variants: a
// database/infrastructure failure is a different semantic condition than
// "this GTID does not exist" and must never render as SELO NÃO ENCONTRADO
// (404) or, worse, silently fall through to an active-looking page. No
// internal detail (driver error, connection string, stack trace) is ever
// interpolated into this page.
function renderTemporaryErrorPage(): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>GuardDrive — Verificação de Selo</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #030305; color: #fff; padding: 24px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  .card { max-width: 380px; width: 100%; text-align: center; }
  .brand { font-size: 0.8rem; letter-spacing: 0.35em; color: #6e7491; margin: 0 0 40px; }
  .headline { font-size: 1.4rem; font-weight: 700; letter-spacing: 0.02em; color: #6e7491; margin: 0 0 12px; }
  .subheadline { font-size: 0.95rem; color: #fff; opacity: 0.85; margin: 0; line-height: 1.5; }
</style>
</head>
<body>
  <div class="card">
    <div class="brand">GUARDDRIVE</div>
    <h1 class="headline">VERIFICAÇÃO TEMPORARIAMENTE INDISPONÍVEL</h1>
    <p class="subheadline">Não foi possível concluir a verificação agora. Tente novamente em instantes.</p>
  </div>
</body>
</html>`;
}

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405, headers: SECURITY_HEADERS });
  }

  const gtid = normalizeGtid(context.params.gtid ?? '');

  let state: ResolvedState = 'unknown';
  let activatedAt: Date | null = null;
  let dbUnavailable = false;

  if (isValidGtid(gtid)) {
    try {
      const [record] = await db.select().from(guardTags).where(eq(guardTags.gtid, gtid));
      if (record) {
        state = toResolvedState(record.status);
        activatedAt = record.activatedAt;
      }
    } catch {
      // Postgres unreachable/erroring: an infrastructure failure, not an
      // "unknown GTID" result. Handled below as its own HTTP 5xx response.
      dbUnavailable = true;
    }
  }

  if (dbUnavailable) {
    return new Response(req.method === 'HEAD' ? null : renderTemporaryErrorPage(), {
      status: 503,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...SECURITY_HEADERS },
    });
  }

  // GuardDrive operational telemetry — NOT a signed UEAP Read Event. A
  // telemetry write failure must never affect the verification response
  // already computed above, so its rejection is swallowed here.
  context.waitUntil(
    db
      .insert(telemetry)
      .values({
        eventType: 'guard_tag_verification',
        path: `/v/${gtid}`,
        metadata: { gtid, status: state },
      })
      .catch(() => {}),
  );

  const body = renderPage(state, gtid, activatedAt);

  return new Response(req.method === 'HEAD' ? null : body, {
    status: STATE_COPY[state].httpStatus,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...SECURITY_HEADERS },
  });
};

export const config: Config = {
  path: '/v/:gtid',
};
