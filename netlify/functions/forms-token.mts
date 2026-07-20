import type { Config, Context } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { getDb } from '../../db/client';
import { forms } from '../../db/schema';

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const token = context.params.token;
  const db = getDb();
  const [form] = await db.select().from(forms).where(eq(forms.token, token));

  if (!form) {
    return Response.json({ detail: 'Formulário não encontrado' }, { status: 404 });
  }

  return Response.json(form);
};

export const config: Config = {
  path: '/api/forms/:token',
};
