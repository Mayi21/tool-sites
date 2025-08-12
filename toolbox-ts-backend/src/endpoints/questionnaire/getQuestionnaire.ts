
import { IRequest, StatusError } from 'itty-router';
import { Env } from '../../types';

export async function getQuestionnaire(request: IRequest, env: Env): Promise<Response> {
  const { id } = request.params;

  const questionnaire = await env.DB.prepare('SELECT * FROM questionnaires WHERE id = ?').bind(id).first();

  if (!questionnaire) {
    throw new StatusError(404, 'Questionnaire not found');
  }

  if (questionnaire.status === 'closed' || (questionnaire.expires_at && new Date(questionnaire.expires_at) < new Date())) {
    return new Response('This questionnaire is closed.', { status: 410 });
  }

  const questions = await env.DB.prepare('SELECT * FROM questions WHERE questionnaire_id = ? ORDER BY sort_order').bind(id).all();

  for (const question of questions.results) {
    if (question.type === 'single' || question.type === 'multiple') {
      const options = await env.DB.prepare('SELECT * FROM options WHERE question_id = ?').bind(question.id).all();
      question.options = options.results;
    }
  }

  return new Response(JSON.stringify({ questionnaire, questions: questions.results }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
