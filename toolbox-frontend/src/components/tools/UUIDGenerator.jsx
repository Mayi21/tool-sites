import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Form, Button, Card, Row, Col, InputNumber, Spin, Empty, message, Input } from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function UUIDGenerator() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState('');
  const [form] = Form.useForm();

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    copyToClipboard(generatedData).then(success => {
      if (success) {
        message.success(t('Copied to clipboard'));
      }
    });
  };

  const onFinish = (values) => {
    setLoading(true);
    setGeneratedData('');

    setTimeout(() => {
      const { count } = values;
      let data = [];
      
      for (let i = 0; i < count; i++) {
        data.push(crypto.randomUUID());
      }
      
      setGeneratedData(data.join('\n'));
      setLoading(false);
      message.success(t('UUIDs generated successfully'));
    }, 500);
  };

  return (
    <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>{t('UUID Generator')}</Title>
      <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
        {t('Generate universally unique identifiers (UUIDs).')}
      </Text>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ count: 10 }}
      >
        <Card type="inner" title={t('Generation Options')}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="count"
                label={t('Count')}
                rules={[{ required: true, message: t('Please enter a count') }]
                }
              >
                <InputNumber
                  min={1}
                  max={5000}
                  style={{ width: '100%' }}
                  placeholder={t('Number of UUIDs to generate')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<ReloadOutlined />} loading={loading} block>
              {loading ? t('Generating...') : t('Generate UUIDs')}
            </Button>
          </Form.Item>
        </Card>
      </Form>
      
      <Card 
        type="inner" 
        title={t('Generated UUIDs')} 
        style={{ marginTop: 24 }}
        extra={
          generatedData && (
            <Button size="small" onClick={handleCopy} icon={<CopyOutlined />}>
              {t('Copy')}
            </Button>
          )
        }
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
            <Spin tip={t('Generating UUIDs, please wait...')} />
          </div>
        ) : generatedData ? (
          <TextArea 
            value={generatedData} 
            readOnly 
            rows={12} 
            style={{ fontFamily: 'monospace', fontSize: 12 }}
          />
        ) : (
          <div style={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description={t('Generated UUIDs will appear here. Configure options and click generate.')} />
          </div>
        )}
      </Card>

      <CopySuccessAnimation 
        visible={showAnimation} 
        onAnimationEnd={handleAnimationEnd} 
      />
    </Card>
  );
}