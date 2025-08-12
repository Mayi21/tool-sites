
import { IRequest, StatusError } from 'itty-router';
import { Env } from '../../types';

interface QuestionnairePayload {
  title: string;
  questions: {
    text: string;
    type: 'single' | 'multiple' | 'text' | 'rating';
    options?: string[];
  }[];
  expires_at?: string;
  one_submission_per_person?: boolean;
}

export async function createQuestionnaire(request: IRequest, env: Env): Promise<Response> {
  const { title, questions, expires_at, one_submission_per_person } = await request.json<QuestionnairePayload>();

  if (!title || !questions || !questions.length) {
    throw new StatusError(400, 'Missing required fields');
  }

  const questionnaireId = crypto.randomUUID();
  const adminToken = crypto.randomUUID();

  await env.DB.batch([
    env.DB.prepare(
      'INSERT INTO questionnaires (id, title, admin_token, expires_at, one_submission_per_person) VALUES (?, ?, ?, ?, ?)'
    ).bind(questionnaireId, title, adminToken, expires_at, one_submission_per_person ? 1 : 0),
    ...questions.flatMap((q, i) => {
      const questionId = crypto.randomUUID();
      const statements = [
        env.DB.prepare(
          'INSERT INTO questions (id, questionnaire_id, text, type, sort_order) VALUES (?, ?, ?, ?, ?)'
        ).bind(questionId, questionnaireId, q.text, q.type, i),
      ];
      if (q.options) {
        statements.push(
          ...q.options.map((optionText) =>
            env.DB.prepare('INSERT INTO options (id, question_id, text) VALUES (?, ?, ?)').bind(
              crypto.randomUUID(),
              questionId,
              optionText
            )
          )
        );
      }
      return statements;
    }),
  ]);

  return new Response(JSON.stringify({ questionnaireId, adminToken }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
