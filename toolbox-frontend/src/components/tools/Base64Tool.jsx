import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Radio, Button, Space, Alert, Card } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import CopySuccessAnimation from '../CopySuccessAnimation';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';

const { Title } = Typography;
const { TextArea } = Input;

export default function Base64Tool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [error, setError] = useState(null);
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  function handleConvert() {
    try {
      setError(null);
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch (e) {
      setError(e.message || t('Invalid input'));
      setOutput('');
    }
  }

  async function copyOutput() {
    if (output) {
      await copyToClipboard(output);
    }
  }

  return (
    <>
      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <Title level={2}>{t('Base64 Encode/Decode')}</Title>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <TextArea 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            rows={6} 
            placeholder={t('Enter text to encode or decode')}
          />
          
          <Space>
            <Radio.Group value={mode} onChange={e => setMode(e.target.value)}>
              <Radio.Button value="encode">{t('Encode')}</Radio.Button>
              <Radio.Button value="decode">{t('Decode')}</Radio.Button>
            </Radio.Group>
            
            <Button type="primary" onClick={handleConvert}>
              {t('Convert')}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{t('Result')}</span>
                <Button size="small" onClick={copyOutput} icon={<CopyOutlined />}>
                  {t('Copy')}
                </Button>
              </div>
              
              <TextArea 
                value={output} 
                readOnly 
                rows={6} 
                placeholder={t('Result will appear here')}
              />
            </>
          )}
        </Space>
      </Card>
      
      <CopySuccessAnimation 
        visible={showAnimation} 
        onAnimationEnd={handleAnimationEnd} 
      />
    </>
  );
} 