import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Alert, Card, message } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

export default function JsonFormatter() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);

  function formatJson() {
    try {
      setError(null);
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
    } catch (e) {
      setError(t('Invalid JSON format'));
      setOutput('');
    }
  }

  function minifyJson() {
    try {
      setError(null);
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
    } catch (e) {
      setError(t('Invalid JSON format'));
      setOutput('');
    }
  }

  function copyToClipboard() {
    if (output) {
      navigator.clipboard.writeText(output);
      message.success(t('Copied to clipboard'));
    }
  }

  function downloadJson() {
    if (output) {
      const blob = new Blob([output], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formatted.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>{t('JSON Formatter')}</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <TextArea 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          rows={8} 
          placeholder={t('Enter JSON to format')}
        />
        
        <Space>
          <Button type="primary" onClick={formatJson}>
            {t('Format')}
          </Button>
          <Button onClick={minifyJson}>
            {t('Minify')}
          </Button>
        </Space>
        
        {error && (
          <Alert 
            message={t('Error')} 
            description={error} 
            type="error" 
            showIcon 
          />
        )}
        
        {output && (
          <>
            <Space>
              <Button icon={<CopyOutlined />} onClick={copyToClipboard}>
                {t('Copy')}
              </Button>
              <Button icon={<DownloadOutlined />} onClick={downloadJson}>
                {t('Download')}
              </Button>
            </Space>
            
            <TextArea 
              value={output} 
              readOnly 
              rows={12} 
              style={{ fontFamily: 'monospace' }}
            />
          </>
        )}
      </Space>
    </Card>
  );
} 