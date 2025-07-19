import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, Alert, message } from 'antd';
import { CopyOutlined, EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

export default function JwtDecoder() {
  const { t } = useTranslation();
  const [jwt, setJwt] = useState('');
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState(null);

  function decodeJwt() {
    if (!jwt) return;

    try {
      setError(null);
      const parts = jwt.split('.');
      if (parts.length !== 3) {
        throw new Error(t('Invalid JWT format'));
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));

      setDecoded({
        header: JSON.stringify(header, null, 2),
        payload: JSON.stringify(payload, null, 2),
        signature: parts[2]
      });
    } catch (e) {
      setError(e.message);
      setDecoded(null);
    }
  }

  function copyDecoded(type) {
    if (decoded && decoded[type]) {
      navigator.clipboard.writeText(decoded[type]);
      message.success(t('Copied to clipboard'));
    }
  }

  return (
    <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>{t('JWT Decoder')}</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Input 
          value={jwt} 
          onChange={e => setJwt(e.target.value)} 
          placeholder={t('Enter JWT token')}
          size="large"
        />
        
        <Button type="primary" onClick={decodeJwt} icon={<EyeOutlined />}>
          {t('Decode')}
        </Button>
        
        {error && (
          <Alert 
            message={t('Error')} 
            description={error} 
            type="error" 
            showIcon 
          />
        )}
        
        {decoded && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title={t('Header')} size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span>{t('JWT Header')}</span>
                <Button size="small" onClick={() => copyDecoded('header')} icon={<CopyOutlined />}>
                  {t('Copy')}
                </Button>
              </div>
              <TextArea 
                value={decoded.header} 
                readOnly 
                rows={4} 
                style={{ fontFamily: 'monospace' }}
              />
            </Card>
            
            <Card title={t('Payload')} size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span>{t('JWT Payload')}</span>
                <Button size="small" onClick={() => copyDecoded('payload')} icon={<CopyOutlined />}>
                  {t('Copy')}
                </Button>
              </div>
              <TextArea 
                value={decoded.payload} 
                readOnly 
                rows={8} 
                style={{ fontFamily: 'monospace' }}
              />
            </Card>
            
            <Card title={t('Signature')} size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span>{t('JWT Signature')}</span>
                <Button size="small" onClick={() => copyDecoded('signature')} icon={<CopyOutlined />}>
                  {t('Copy')}
                </Button>
              </div>
              <Input 
                value={decoded.signature} 
                readOnly 
                style={{ fontFamily: 'monospace' }}
              />
            </Card>
          </Space>
        )}
      </Space>
    </Card>
  );
} 