import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, Row, Col, Select } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import CopySuccessAnimation from '../CopySuccessAnimation';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';

const { Title } = Typography;
const { TextArea } = Input;

export default function TextProcessor() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [operation, setOperation] = useState('uppercase');
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  function processText() {
    if (!input) return;

    let result;
    switch (operation) {
      case 'uppercase':
        result = input.toUpperCase();
        break;
      case 'lowercase':
        result = input.toLowerCase();
        break;
      case 'capitalize':
        result = input.replace(/\b\w/g, l => l.toUpperCase());
        break;
      case 'titleCase':
        result = input.replace(/\b\w+/g, word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );
        break;
      case 'removeDuplicates':
        result = [...new Set(input.split('\n'))].join('\n');
        break;
      case 'removeExtraSpaces':
        result = input.replace(/\s+/g, ' ').trim();
        break;
      case 'removeEmptyLines':
        result = input.split('\n').filter(line => line.trim() !== '').join('\n');
        break;
      case 'reverse':
        result = input.split('').reverse().join('');
        break;
      case 'sortLines':
        result = input.split('\n').sort().join('\n');
        break;
      case 'sortLinesReverse':
        result = input.split('\n').sort().reverse().join('\n');
        break;
      case 'countWords':
        result = `${t('Word count')}: ${input.trim() ? input.trim().split(/\s+/).length : 0}`;
        break;
      case 'countCharacters':
        result = `${t('Character count')}: ${input.length}`;
        break;
      case 'countLines':
        result = `${t('Line count')}: ${input.split('\n').length}`;
        break;
      default:
        result = input;
    }
    
    setOutput(result);
  }

  async function copyOutput() {
    if (output) {
      await copyToClipboard(output);
    }
  }

  function clearAll() {
    setInput('');
    setOutput('');
  }

  return (
    <>
      <Card style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Title level={2}>{t('Text Processor')}</Title>
        
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{t('Input')}</span>
              </div>
              <TextArea 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                rows={12} 
                placeholder={t('Enter text to process')}
              />
              
              <Space>
                <Select
                  value={operation}
                  onChange={setOperation}
                  style={{ width: 200 }}
                  options={[
                    { value: 'uppercase', label: t('Uppercase') },
                    { value: 'lowercase', label: t('Lowercase') },
                    { value: 'capitalize', label: t('Capitalize') },
                    { value: 'titleCase', label: t('Title Case') },
                    { value: 'removeDuplicates', label: t('Remove Duplicate Lines') },
                    { value: 'removeExtraSpaces', label: t('Remove Extra Spaces') },
                    { value: 'removeEmptyLines', label: t('Remove Empty Lines') },
                    { value: 'reverse', label: t('Reverse Text') },
                    { value: 'sortLines', label: t('Sort Lines') },
                    { value: 'sortLinesReverse', label: t('Sort Lines (Reverse)') },
                    { value: 'countWords', label: t('Count Words') },
                    { value: 'countCharacters', label: t('Count Characters') },
                    { value: 'countLines', label: t('Count Lines') }
                  ]}
                />
                <Button type="primary" onClick={processText}>
                  {t('Process')}
                </Button>
                <Button onClick={clearAll}>
                  {t('Clear')}
                </Button>
              </Space>
            </Space>
          </Col>
          
          <Col span={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{t('Result')}</span>
                {output && (
                  <Button size="small" onClick={copyOutput} icon={<CopyOutlined />}>
                    {t('Copy')}
                  </Button>
                )}
              </div>
              
              <TextArea 
                value={output} 
                readOnly 
                rows={12} 
                placeholder={t('Processed text will appear here')}
                style={{ fontFamily: 'monospace' }}
              />
            </Space>
          </Col>
        </Row>
      </Card>
      
      <CopySuccessAnimation 
        visible={showAnimation} 
        onAnimationEnd={handleAnimationEnd} 
      />
    </>
  );
} 