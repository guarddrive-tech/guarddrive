import type { Config } from '@netlify/functions';

// Embedded commercial intelligence (ported from the previous FastAPI route).
// This is static content — no file-system lookups, so it works the same in
// local dev and in production.
const PAIN_POINTS = [
  'Fraude de hodômetro prejudicando valor residual de locadoras — perdas invisíveis de até 15% do valor do ativo.',
  'Seguradoras com custos elevados em perícias de sinistros duvidosos — tempo médio de resolução superior a 45 dias.',
  'Ausência de prova criptográfica com validade jurídica para litígios patrimoniais em frota.',
  'Bloqueadores de sinal (jammers) invalidam rastreadores convencionais, gerando vulnerabilidade crítica.',
  'Instalação invasiva de dispositivos de segurança causa perda de garantia e depreciação do ativo.',
  'Compliance com LGPD para telemetria contínua sem framework de anonimização adequado.',
];

const DIRECTIVES_SUMMARY = `
GUARDDRIVE TECH — Diretrizes de Uso de Materiais Técnicos em Estruturas Comerciais e Operacionais (2026)

Critérios de Organização:
- Priorizar fatores de impacto operacional e mercadológico em comunicações externas.
- Foco em mapeamento de dores reais do mercado de frotas e locação.
- Redução de perdas invisíveis e fraudes em ativos como benefício principal.
- Conformidade operacional com regras atuais do setor de mobilidade.

Segmentação Documental:
- Material Comercial: Propostas de valor e dores operacionais.
- Material de Validação: Questionários investigativos para campo.
- Material Técnico: Restrito a engenharia e integrações API.
- Material Estratégico: Segredos industriais e propriedade intelectual.

Formulários de Campo:
- Instrumentos de descoberta de gargalos e validação de hipóteses de valor.
- Guiar o entrevistado para expor vulnerabilidades operacionais atuais.
- Nunca antecipar diferenciais estratégicos internos da tecnologia.

Segurança e Blindagem:
- Princípio do mínimo acesso necessário.
- Ocultação completa de patentes em fases de validação de rua.
- Separação entre narrativa comercial e núcleo técnico.
- Rastreabilidade documental e coerência institucional.
`;

const GOVERNANCE = [
  {
    title: 'Diretrizes de Uso de Materiais Técnicos',
    snippet:
      'Regras de conformidade e NDA para compartilhamento de dados comerciais com frotistas e seguradoras. Preservação de propriedade intelectual e blindagem do modelo de negócio.',
  },
  {
    title: 'Política de Compartimentalização',
    snippet:
      'Segmentação documental por finalidade: Material Institucional, Comercial, Jurídico, Técnico, Estratégico e de Validação de Mercado. Cada categoria com linguagem calibrada para o público-alvo.',
  },
  {
    title: 'Diretriz para Formulários de Validação',
    snippet:
      'Formulários de campo como instrumentos de descoberta de gargalos operacionais. O formulário nunca deve expor diferenciais estratégicos internos ou arquiteturas de dados.',
  },
];

export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  return Response.json({
    commercial: {
      source: 'embedded_sovereign',
      content: DIRECTIVES_SUMMARY,
      pain_points: PAIN_POINTS,
    },
    governance: GOVERNANCE,
  });
};

export const config: Config = {
  path: '/api/insights',
};
