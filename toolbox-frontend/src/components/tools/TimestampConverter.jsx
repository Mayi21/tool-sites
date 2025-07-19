import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, message, Row, Col, Statistic } from 'antd';
import { CopyOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function TimestampConverter() {
  const { t } = useTranslation();
  const [timestamp, setTimestamp] = useState('');
  const [date, setDate] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function convertTimestampToDate() {
    if (!timestamp) return;
    
    const ts = parseInt(timestamp);
    if (isNaN(ts)) {
      message.error(t('Invalid timestamp'));
      return;
    }
    
    const dateObj = new Date(ts);
    setDate(dateObj.toLocaleString());
  }

  function convertDateToTimestamp() {
    if (!date) return;
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      message.error(t('Invalid date'));
      return;
    }
    
    setTimestamp(dateObj.getTime().toString());
  }

  function copyTimestamp() {
    if (timestamp) {
      navigator.clipboard.writeText(timestamp);
      message.success(t('Copied to clipboard'));
    }
  }

  function copyDate() {
    if (date) {
      navigator.clipboard.writeText(date);
      message.success(t('Copied to clipboard'));
    }
  }

  function setCurrentTimestamp() {
    setTimestamp(currentTime.toString());
  }

  return (
    <Card style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>{t('Timestamp Converter')}</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Statistic 
            title={t('Current Timestamp')} 
            value={currentTime} 
            prefix={<ClockCircleOutlined />}
          />
        </Col>
        <Col span={12}>
          <Statistic 
            title={t('Current Date')} 
            value={new Date(currentTime).toLocaleString()} 
          />
        </Col>
      </Row>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input 
                value={timestamp} 
                onChange={e => setTimestamp(e.target.value)} 
                placeholder={t('Enter timestamp')}
                addonAfter={
                  <Button size="small" onClick={copyTimestamp} icon={<CopyOutlined />}>
                    {t('Copy')}
                  </Button>
                }
              />
              <Button type="primary" onClick={convertTimestampToDate}>
                {t('Convert to Date')}
              </Button>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                placeholder={t('Enter date')}
                addonAfter={
                  <Button size="small" onClick={copyDate} icon={<CopyOutlined />}>
                    {t('Copy')}
                  </Button>
                }
              />
              <Button onClick={convertDateToTimestamp}>
                {t('Convert to Timestamp')}
              </Button>
            </Space>
          </Col>
        </Row>
        
        <Button onClick={setCurrentTimestamp}>
          {t('Set Current Timestamp')}
        </Button>
      </Space>
    </Card>
  );
} 