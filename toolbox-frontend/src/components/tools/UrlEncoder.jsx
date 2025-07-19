import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

export default function UrlEncoder() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  function encodeUrl() {
    try {
      const encoded = encodeURIComponent(input);
      setOutput(encoded);
    } catch (e) {
      setOutput('');
    }
  }

  function decodeUrl() {
    try {
      const decoded = decodeURIComponent(input);
      setOutput(decoded);
    } catch (e) {
      setOutput('');
    }
  }

  function copyToClipboard() {
    if (output) {
      navigator.clipboard.writeText(output);
      message.success(t('Copied to clipboard'));
    }
  }

  return (
    <Card style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>{t('URL Encoder/Decoder')}</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <TextArea 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          rows={6} 
          placeholder={t('Enter URL to encode or decode')}
        />
        
        <Space>
          <Button type="primary" onClick={encodeUrl}>
            {t('Encode')}
          </Button>
          <Button onClick={decodeUrl}>
            {t('Decode')}
          </Button>
          {output && (
            <Button icon={<CopyOutlined />} onClick={copyToClipboard}>
              {t('Copy')}
            </Button>
          )}
        </Space>
        
        {output && (
          <TextArea 
            value={output} 
            readOnly 
            rows={6} 
            placeholder={t('Result will appear here')}
          />
        )}
      </Space>
    </Card>
  );
} 