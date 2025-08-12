
import { IRequest, StatusError } from 'itty-router';
import { Env } from '../../types';

interface SubmissionPayload {
  answers: {
    question_id: string;
    answer_text?: string;
    option_id?: string;
  }[];
}

export async function submitQuestionnaire(request: IRequest, env: Env): Promise<Response> {
  const { id } = request.params;
  const { answers } = await request.json<SubmissionPayload>();

  const questionnaire = await env.DB.prepare('SELECT * FROM questionnaires WHERE id = ?').bind(id).first();

  if (!questionnaire) {
    throw new StatusError(404, 'Questionnaire not found');
  }

  if (questionnaire.one_submission_per_person) {
    const ip = request.headers.get('cf-connecting-ip');
    const userAgent = request.headers.get('user-agent');
    const submitterHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip + userAgent));
    const hashString = Array.from(new Uint8Array(submitterHash)).map(b => b.toString(16).padStart(2, '0')).join('');

    const existingSubmission = await env.DB.prepare('SELECT id FROM submissions WHERE questionnaire_id = ? AND submitter_hash = ?').bind(id, hashString).first();
    if (existingSubmission) {
      throw new StatusError(429, 'You have already submitted this questionnaire.');
    }
  }

  const submissionId = crypto.randomUUID();
  await env.DB.batch([
    env.DB.prepare('INSERT INTO submissions (id, questionnaire_id, submitter_hash) VALUES (?, ?, ?)').bind(submissionId, id, submitterHash),
    ...answers.map(answer =>
      env.DB.prepare('INSERT INTO answers (id, submission_id, question_id, answer_text, option_id) VALUES (?, ?, ?, ?, ?)').bind(
        crypto.randomUUID(),
        submissionId,
        answer.question_id,
        answer.answer_text,
        answer.option_id
      )
    )
  ]);

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
