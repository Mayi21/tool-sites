import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Form, Button, Space, Card, Row, Col, Select, InputNumber, Spin, Empty, message, Input } from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';

const { Title, Text } = Typography;
const { TextArea } = Input;

// 扩展的样本数据
const sampleData = {
  names: ['Olivia Chen', 'Liam Patel', 'Sophia Rodriguez', 'Noah Kim', 'Ava Williams', 'Jackson Brown', 'Isabella Garcia', 'Aiden Martinez', 'Mia Davis', 'Lucas Miller', 'Charlotte Wilson', 'Ethan Moore', 'Amelia Taylor', 'Mason Anderson', 'Harper Thomas'],
  cities: ['New York', 'Tokyo', 'London', 'Paris', 'Singapore', 'Sydney', 'Dubai', 'Hong Kong', 'Shanghai', 'Los Angeles', 'Chicago', 'Toronto', 'Berlin', 'Moscow', 'Rome'],
  emails: ['user1@example.com', 'test.user@work.net', 'sample_email@domain.org', 'john.doe@email.co', 'jane.smith@service.io', 'alpha@mail.dev', 'beta@web.info', 'gamma@company.biz', 'delta@cloud.app', 'epsilon@tech.zone']
};

export default function DataGenerator() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState('');
  const [form] = Form.useForm();

  const { copied, handleCopy } = useCopyWithAnimation(generatedData);

  const onFinish = (values) => {
    setLoading(true);
    setGeneratedData('');

    // 模拟异步生成
    setTimeout(() => {
      const { dataType, count } = values;
      let data = [];
      
      switch (dataType) {
        case 'names':
        case 'cities':
        case 'emails':
          const source = sampleData[dataType];
          for (let i = 0; i < count; i++) {
            data.push(source[Math.floor(Math.random() * source.length)]);
          }
          break;
        case 'numbers':
          for (let i = 0; i < count; i++) {
            data.push(Math.floor(Math.random() * 10000));
          }
          break;
        case 'uuids':
          for (let i = 0; i < count; i++) {
            data.push(crypto.randomUUID());
          }
          break;
        case 'passwords':
          for (let i = 0; i < count; i++) {
            data.push(generatePassword());
          }
          break;
        default:
          break;
      }
      
      setGeneratedData(data.join('\n'));
      setLoading(false);
      message.success(t('Data generated successfully'));
    }, 500);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  return (
    <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>{t('Data Generator')}</Title>
      <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
        {t('Generate various types of sample data for testing and development.')}
      </Text>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ dataType: 'names', count: 10 }}
      >
        <Card type="inner" title={t('Generation Options')}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="dataType"
                label={t('Data Type')}
                rules={[{ required: true, message: t('Please select a data type') }]}
              >
                <Select
                  options={[
                    { value: 'names', label: t('Names') },
                    { value: 'cities', label: t('Cities') },
                    { value: 'emails', label: t('Email Addresses') },
                    { value: 'numbers', label: t('Random Numbers') },
                    { value: 'uuids', label: t('UUIDs') },
                    { value: 'passwords', label: t('Secure Passwords') }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="count"
                label={t('Count')}
                rules={[{ required: true, message: t('Please enter a count') }]}
              >
                <InputNumber
                  min={1}
                  max={5000}
                  style={{ width: '100%' }}
                  placeholder={t('Number of items to generate')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<ReloadOutlined />} loading={loading} block>
              {loading ? t('Generating...') : t('Generate Data')}
            </Button>
          </Form.Item>
        </Card>
      </Form>
      
      <Card 
        type="inner" 
        title={t('Generated Data')} 
        style={{ marginTop: 24 }} 
        extra={
          generatedData && (
            <Button size="small" onClick={handleCopy} icon={<CopyOutlined />}>
              {copied ? t('Copied!') : t('Copy')}
            </Button>
          )
        }
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
            <Spin tip={t('Generating data, please wait...')}
 />
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
            <Empty description={t('Generated data will appear here. Configure options and click generate.')} />
          </div>
        )}
      </Card>
    </Card>
  );
} 