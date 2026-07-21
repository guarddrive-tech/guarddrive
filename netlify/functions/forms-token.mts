import type { Config, Context } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { forms } from '../../db/schema.js';

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const token = context.params.token;
  const [form] = await db.select().from(forms).where(eq(forms.token, token));

  if (!form) {
    return Response.json({ detail: 'Formulário não encontrado' }, { status: 404 });
  }

  return Response.json(form);
};

export const config: Config = {
  path: '/api/forms/:token',
};
