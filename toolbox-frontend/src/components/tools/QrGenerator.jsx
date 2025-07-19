import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, Row, Col, InputNumber, message } from 'antd';
import { QrcodeOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function QrGenerator() {
  const { t } = useTranslation();
  const [text, setText] = useState('https://example.com');
  const [size, setSize] = useState(200);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  function generateQR() {
    if (!text) {
      message.error(t('Please enter text or URL'));
      return;
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
    setQrCodeUrl(qrUrl);
  }

  function downloadQR() {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = 'qrcode.png';
      link.click();
    }
  }

  return (
    <Card style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>{t('QR Code Generator')}</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={16}>
            <Input 
              value={text} 
              onChange={e => setText(e.target.value)} 
              placeholder={t('Enter text or URL')}
              size="large"
            />
          </Col>
          <Col span={8}>
            <InputNumber
              value={size}
              onChange={setSize}
              min={100}
              max={500}
              style={{ width: '100%' }}
              placeholder={t('Size')}
            />
          </Col>
        </Row>
        
        <Button type="primary" onClick={generateQR} icon={<QrcodeOutlined />}>
          {t('Generate QR Code')}
        </Button>
        
        {qrCodeUrl && (
          <Card title={t('Generated QR Code')}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  style={{ border: '1px solid #d9d9d9', borderRadius: 8 }}
                />
              </div>
              
              <Button 
                type="primary" 
                onClick={downloadQR} 
                icon={<DownloadOutlined />}
                style={{ width: '100%' }}
              >
                {t('Download QR Code')}
              </Button>
            </Space>
          </Card>
        )}
      </Space>
    </Card>
  );
} 