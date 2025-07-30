
import { IRequest, StatusError } from 'itty-router';
import { Env } from '../../types';

export async function closeQuestionnaire(request: IRequest, env: Env): Promise<Response> {
  const { id } = request.params;
  const { adminToken } = request.query;

  const questionnaire = await env.DB.prepare('SELECT * FROM questionnaires WHERE id = ? AND admin_token = ?').bind(id, adminToken).first();

  if (!questionnaire) {
    throw new StatusError(403, 'Invalid admin token or questionnaire ID');
  }

  await env.DB.prepare('UPDATE questionnaires SET status = ? WHERE id = ?').bind('closed', id).run();

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
