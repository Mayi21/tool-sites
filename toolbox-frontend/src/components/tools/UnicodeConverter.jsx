import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, Row, Col, Select } from 'antd';
import { CopyOutlined, SwapOutlined, ClearOutlined } from '@ant-design/icons';
import CopySuccessAnimation from '../CopySuccessAnimation';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';

const { Title } = Typography;
const { TextArea } = Input;

export default function UnicodeConverter() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('toUnicode');
  const [error, setError] = useState(null);
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  function chineseToUnicode(text) {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      return `\\u${code.toString(16).padStart(4, '0')}`;
    }).join('');
  }

  function unicodeToChinese(text) {
    return text.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  }

  function chineseToUnicodeEntity(text) {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      return `&#x${code.toString(16).toUpperCase()};`;
    }).join('');
  }

  function unicodeEntityToChinese(text) {
    return text.replace(/&#x([0-9a-fA-F]+);/gi, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  }

  function handleConvert() {
    try {
      setError(null);
      let result = '';

      if (mode === 'toUnicode') {
        result = chineseToUnicode(input);
      } else if (mode === 'fromUnicode') {
        result = unicodeToChinese(input);
      } else if (mode === 'toEntity') {
        result = chineseToUnicodeEntity(input);
      } else if (mode === 'fromEntity') {
        result = unicodeEntityToChinese(input);
      }

      setOutput(result);
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }

  async function copyOutput() {
    if (output) {
      await copyToClipboard(output);
    }
  }

  function clearAll() {
    setInput('');
    setOutput('');
    setError(null);
  }

  function swapContent() {
    if (output) {
      setInput(output);
      setOutput('');
      setError(null);
    }
  }

  const modeOptions = [
    { label: t('Chinese to Unicode'), value: 'toUnicode' },
    { label: t('Unicode to Chinese'), value: 'fromUnicode' },
    { label: t('Chinese to Unicode Entity'), value: 'toEntity' },
    { label: t('Unicode Entity to Chinese'), value: 'fromEntity' }
  ];

  return (
    <>
      <Card style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Title level={2}>{t('Chinese ↔ Unicode Converter')}</Title>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Select
                  value={mode}
                  onChange={setMode}
                  style={{ width: '100%' }}
                  options={modeOptions}
                />
                
                <TextArea 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  rows={8} 
                  placeholder={
                    mode === 'toUnicode' ? t('Enter Chinese text to convert to Unicode') :
                    mode === 'fromUnicode' ? t('Enter Unicode codes (e.g., \\u4e2d\\u6587)') :
                    mode === 'toEntity' ? t('Enter Chinese text to convert to Unicode entities') :
                    t('Enter Unicode entities (e.g., &#x4E2D;&#x6587;)')
                  }
                />
              </Space>
            </Col>
            
            <Col span={12}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{mode.includes('to') ? t('Unicode Result') : t('Chinese Result')}</span>
                  {output && (
                    <Button size="small" onClick={copyOutput} icon={<CopyOutlined />}>
                      {t('Copy')}
                    </Button>
                  )}
                </div>
                
                <TextArea 
                  value={output} 
                  readOnly 
                  rows={8} 
                  placeholder={t('Result will appear here')}
                  style={{ fontFamily: 'monospace' }}
                />
              </Space>
            </Col>
          </Row>

          <Button type="primary" onClick={handleConvert} size="large">
            {t('Convert')}
          </Button>

          {error && (
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: 'var(--error-bg)', 
              color: 'var(--error-color)',
              borderRadius: 6,
              border: '1px solid var(--error-border)'
            }}>
              {error}
            </div>
          )}

          <Space>
            <Button icon={<SwapOutlined />} onClick={swapContent} disabled={!output}>
              {t('Swap')}
            </Button>
            <Button icon={<ClearOutlined />} onClick={clearAll}>
              {t('Clear')}
            </Button>
          </Space>
        </Space>
      </Card>
      
      <CopySuccessAnimation 
        visible={showAnimation} 
        onAnimationEnd={handleAnimationEnd} 
      />
    </>
  );
} 