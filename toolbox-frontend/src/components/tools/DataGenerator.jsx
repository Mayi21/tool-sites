import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, Row, Col, Select, InputNumber, message } from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

export default function DataGenerator() {
  const { t } = useTranslation();
  const [dataType, setDataType] = useState('names');
  const [count, setCount] = useState(10);
  const [generatedData, setGeneratedData] = useState('');

  const sampleNames = [
    'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown',
    'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Ivy Chen', 'Jack Anderson'
  ];

  function generateData() {
    let data = [];
    
    switch (dataType) {
      case 'names':
        for (let i = 0; i < count; i++) {
          data.push(sampleNames[i % sampleNames.length]);
        }
        break;
      case 'numbers':
        for (let i = 0; i < count; i++) {
          data.push(Math.floor(Math.random() * 1000));
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
        for (let i = 0; i < count; i++) {
          data.push(sampleNames[i % sampleNames.length]);
        }
    }
    
    setGeneratedData(data.join('\n'));
  }

  function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  function copyData() {
    if (generatedData) {
      navigator.clipboard.writeText(generatedData);
      message.success(t('Copied to clipboard'));
    }
  }

  return (
    <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>{t('Data Generator')}</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Select
              value={dataType}
              onChange={setDataType}
              style={{ width: '100%' }}
              options={[
                { value: 'names', label: t('Names') },
                { value: 'numbers', label: t('Random Numbers') },
                { value: 'uuids', label: t('UUIDs') },
                { value: 'passwords', label: t('Passwords') }
              ]}
            />
          </Col>
          <Col span={8}>
            <InputNumber
              value={count}
              onChange={setCount}
              min={1}
              max={1000}
              style={{ width: '100%' }}
              placeholder={t('Count')}
            />
          </Col>
          <Col span={4}>
            <Button type="primary" onClick={generateData} icon={<ReloadOutlined />}>
              {t('Generate')}
            </Button>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={24}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span>{t('Generated Data')}</span>
              {generatedData && (
                <Button size="small" onClick={copyData} icon={<CopyOutlined />}>
                  {t('Copy')}
                </Button>
              )}
            </div>
            
            <TextArea 
              value={generatedData} 
              readOnly 
              rows={12} 
              placeholder={t('Generated data will appear here')}
              style={{ fontFamily: 'monospace' }}
            />
          </Col>
        </Row>
      </Space>
    </Card>
  );
} 