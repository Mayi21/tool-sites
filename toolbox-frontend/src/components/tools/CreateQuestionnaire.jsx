
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form, Input, Button, Select, DatePicker, Checkbox, Space, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import QRCode from 'qrcode.react';

const { Option } = Select;

export default function CreateQuestionnaire() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [result, setResult] = useState(null);

  const onFinish = async (values) => {
    try {
      const response = await fetch('/api/questionnaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error('Failed to create questionnaire');
      }
      const data = await response.json();
      setResult(data);
      message.success('Questionnaire created successfully');
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <Card title={t('Create Questionnaire')}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="title" label={t('Title')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.List name="questions">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card key={key} style={{ marginBottom: 16 }}>
                  <Form.Item {...restField} name={[name, 'text']} label={`${t('Question')} ${name + 1}`} rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, 'type']} label={t('Type')} rules={[{ required: true }]}>
                    <Select>
                      <Option value="single">{t('Single Choice')}</Option>
                      <Option value="multiple">{t('Multiple Choice')}</Option>
                      <Option value="text">{t('Short Answer')}</Option>
                      <Option value="rating">{t('Rating')}</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.questions[name]?.type !== currentValues.questions[name]?.type
                    }
                  >
                    {({ getFieldValue }) =>
                      getFieldValue(['questions', name, 'type']) === 'single' ||
                      getFieldValue(['questions', name, 'type']) === 'multiple' ? (
                        <Form.List name={[name, 'options']}>
                          {(options, { add: addOption, remove: removeOption }) => (
                            <>
                              {options.map(({ key: optionKey, name: optionName, ...restOptionField }) => (
                                <Space key={optionKey} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                  <Form.Item {...restOptionField} name={[optionName]} rules={[{ required: true }]}>
                                    <Input placeholder={t('Option')} />
                                  </Form.Item>
                                  <MinusCircleOutlined onClick={() => removeOption(optionName)} />
                                </Space>
                              ))}
                              <Form.Item>
                                <Button type="dashed" onClick={() => addOption()} block icon={<PlusOutlined />}>
                                  {t('Add Option')}
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      ) : null
                    }
                  </Form.Item>
                  <Button type="danger" onClick={() => remove(name)} block>
                    {t('Remove Question')}
                  </Button>
                </Card>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  {t('Add Question')}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item name="expires_at" label={t('Expiration Time')}>
          <DatePicker showTime />
        </Form.Item>

        <Form.Item name="one_submission_per_person" valuePropName="checked">
          <Checkbox>{t('One submission per person')}</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {t('Create Questionnaire')}
          </Button>
        </Form.Item>
      </Form>

      {result && (
        <Card title={t('Questionnaire Created')}>
          <p>{t('Shareable Link')}: <a href={`/questionnaire/${result.questionnaireId}`} target="_blank">{`/questionnaire/${result.questionnaireId}`}</a></p>
          <p>{t('Admin Token')}: <code>{result.adminToken}</code></p>
          <QRCode value={`${window.location.origin}/questionnaire/${result.questionnaireId}`} />
        </Card>
      )}
    </Card>
  );
}
