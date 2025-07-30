
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Card, Form, Button, Radio, Checkbox, Input, Rate, message, Spin, Alert } from 'antd';

const { TextArea } = Input;

export default function ViewQuestionnaire() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        const response = await fetch(`/api/questionnaires/${id}`);
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const data = await response.json();
        setQuestionnaire(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionnaire();
  }, [id]);

  const onFinish = async (values) => {
    try {
      const response = await fetch(`/api/questionnaires/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: values.answers }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      message.success('Submission successful');
      form.resetFields();
    } catch (err) {
      message.error(err.message);
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message={t('Error')} description={error} type="error" />;
  }

  return (
    <Card title={questionnaire.questionnaire.title}>
      <Form form={form} onFinish={onFinish} layout="vertical">
        {questionnaire.questions.map((q, i) => (
          <Form.Item key={q.id} label={q.text} name={['answers', i, 'question_id']} initialValue={q.id} hidden>
            <Input />
          </Form.Item>
        ))}
        {questionnaire.questions.map((q, i) => {
          if (q.type === 'single') {
            return (
              <Form.Item key={q.id} label={q.text} name={['answers', i, 'option_id']} rules={[{ required: true }]}>
                <Radio.Group>
                  {q.options.map(opt => (
                    <Radio key={opt.id} value={opt.id}>{opt.text}</Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
            );
          }
          if (q.type === 'multiple') {
            return (
              <Form.Item key={q.id} label={q.text} name={['answers', i, 'option_id']} rules={[{ required: true }]}>
                <Checkbox.Group>
                  {q.options.map(opt => (
                    <Checkbox key={opt.id} value={opt.id}>{opt.text}</Checkbox>
                  ))}
                </Checkbox.Group>
              </Form.Item>
            );
          }
          if (q.type === 'text') {
            return (
              <Form.Item key={q.id} label={q.text} name={['answers', i, 'answer_text']} rules={[{ required: true }]}>
                <TextArea rows={4} />
              </Form.Item>
            );
          }
          if (q.type === 'rating') {
            return (
              <Form.Item key={q.id} label={q.text} name={['answers', i, 'answer_text']} rules={[{ required: true }]}>
                <Rate />
              </Form.Item>
            );
          }
          return null;
        })}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {t('Submit')}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
