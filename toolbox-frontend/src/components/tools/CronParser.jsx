import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, Row, Col, Alert, Table } from 'antd';
import { PlayCircleOutlined, ClearOutlined, ClockCircleOutlined } from '@ant-design/icons';

import { buildApiUrl, getApiConfig } from '../../config/api';

const { Title, Text } = Typography;

export default function CronParser() {
  const { t } = useTranslation();
  const [cronExpression, setCronExpression] = useState('0 */20 * * * ?');
  const [nextExecutions, setNextExecutions] = useState([]);
  const [error, setError] = useState(null);

  const handleParse = async () => {
    try {
      setError(null);
      if (!cronExpression.trim()) {
        setError(t('Please enter a cron expression'));
        return;
      }

      const apiConfig = getApiConfig();
      const response = await fetch(buildApiUrl(apiConfig.ENDPOINTS.CRON_NEXT_TIMES), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expr: cronExpression, count: 5 }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setNextExecutions(data.times.map((time, index) => ({ key: index, time: new Date(time).toLocaleString() })));
      } else {
        setError(data.error || t('Unknown error'));
        setNextExecutions([]);
      }
    } catch (e) {
      setError(e.message);
      setNextExecutions([]);
    }
  };

  function clearAll() {
    setCronExpression('');
    setNextExecutions([]);
    setError(null);
  }

  const executionColumns = [
    {
      title: t('Execution Time'),
      dataIndex: 'time',
      key: 'time',
    }
  ];

  return (
    <Card style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>
        <ClockCircleOutlined style={{ marginRight: 8 }} />
        {t('Cron Expression Parser')}
      </Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>{t('Cron Expression')}:</Text>
                <Input
                  value={cronExpression}
                  onChange={e => setCronExpression(e.target.value)}
                  placeholder={'0 */20 * * * ?'}
                  style={{ marginTop: 8 }}
                  size="large"
                />
              </div>
            </Space>
          </Col>
        </Row>

        <Space>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />} 
            onClick={handleParse}
            size="large"
          >
            {t('Parse Expression')}
          </Button>
          <Button 
            icon={<ClearOutlined />} 
            onClick={clearAll}
          >
            {t('Clear')}
          </Button>
        </Space>

        {error && (
          <Alert 
            message={t('Parse Error')} 
            description={error} 
            type="error" 
            showIcon 
          />
        )}

        {nextExecutions.length > 0 && (
          <Card title={t('Next Executions')} size="small">
            <Table
              columns={executionColumns}
              dataSource={nextExecutions}
              pagination={false}
              size="small"
            />
          </Card>
        )}
      </Space>
    </Card>
  );
}