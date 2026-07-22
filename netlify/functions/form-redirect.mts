import type { Config, Context } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { forms } from '../../db/schema.js';

export default async (req: Request, context: Context) => {
  const token = context.params.token;
  const [form] = await db.select().from(forms).where(eq(forms.token, token));

  if (!form) {
    return Response.json({ detail: 'Formulário não encontrado' }, { status: 404 });
  }

  const url = new URL(req.url);
  return Response.redirect(`${url.origin}/?r=${token}`, 302);
};

export const config: Config = {
  path: '/r/:token',
};
