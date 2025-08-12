
import { IRequest, StatusError } from 'itty-router';
import { Env } from '../../types';

export async function getQuestionnaireResults(request: IRequest, env: Env): Promise<Response> {
  const { id } = request.params;
  const { adminToken } = request.query;

  const questionnaire = await env.DB.prepare('SELECT * FROM questionnaires WHERE id = ? AND admin_token = ?').bind(id, adminToken).first();

  if (!questionnaire) {
    throw new StatusError(403, 'Invalid admin token or questionnaire ID');
  }

  const questions = await env.DB.prepare('SELECT * FROM questions WHERE questionnaire_id = ? ORDER BY sort_order').bind(id).all();

  const results = [];
  for (const question of questions.results) {
    const result: any = { ...question, submissions: [] };
    if (question.type === 'single' || question.type === 'multiple') {
      const options = await env.DB.prepare('SELECT o.id, o.text, COUNT(a.id) as count FROM options o LEFT JOIN answers a ON o.id = a.option_id WHERE o.question_id = ? GROUP BY o.id').bind(question.id).all();
      result.options = options.results;
    } else {
        const answers = await env.DB.prepare('SELECT answer_text FROM answers WHERE question_id = ?').bind(question.id).all();
        result.submissions = answers.results.map(a => a.answer_text);
    }
    results.push(result);
  }

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
}
