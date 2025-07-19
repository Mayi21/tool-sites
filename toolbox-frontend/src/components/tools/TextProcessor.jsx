import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, Row, Col, Select, message } from 'antd';
import { CopyOutlined, EditOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

export default function TextProcessor() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [operation, setOperation] = useState('uppercase');

  function processText() {
    if (!input) return;

    let result = '';
    
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
      case 'titlecase':
        result = input.replace(/\b\w+/g, word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );
        break;
      case 'removeDuplicates':
        result = [...new Set(input.split('\n'))].join('\n');
        break;
      case 'removeSpaces':
        result = input.replace(/\s+/g, ' ').trim();
        break;
      case 'removeEmptyLines':
        result = input.split('\n').filter(line => line.trim() !== '').join('\n');
        break;
      case 'reverse':
        result = input.split('').reverse().join('');
        break;
      case 'sort':
        result = input.split('\n').sort().join('\n');
        break;
      case 'sortReverse':
        result = input.split('\n').sort().reverse().join('\n');
        break;
      case 'countWords':
        const words = input.trim().split(/\s+/).filter(word => word.length > 0);
        result = `${t('Word count')}: ${words.length}`;
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

  function copyOutput() {
    if (output) {
      navigator.clipboard.writeText(output);
      message.success(t('Copied to clipboard'));
    }
  }

  function clearAll() {
    setInput('');
    setOutput('');
  }

  return (
    <Card style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>{t('Text Processor')}</Title>
      
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <TextArea 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              rows={12} 
              placeholder={t('Enter text to process')}
            />
            
            <Row gutter={16}>
              <Col span={16}>
                <Select
                  value={operation}
                  onChange={setOperation}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'uppercase', label: t('Uppercase') },
                    { value: 'lowercase', label: t('Lowercase') },
                    { value: 'capitalize', label: t('Capitalize') },
                    { value: 'titlecase', label: t('Title Case') },
                    { value: 'removeDuplicates', label: t('Remove Duplicate Lines') },
                    { value: 'removeSpaces', label: t('Remove Extra Spaces') },
                    { value: 'removeEmptyLines', label: t('Remove Empty Lines') },
                    { value: 'reverse', label: t('Reverse Text') },
                    { value: 'sort', label: t('Sort Lines') },
                    { value: 'sortReverse', label: t('Sort Lines (Reverse)') },
                    { value: 'countWords', label: t('Count Words') },
                    { value: 'countCharacters', label: t('Count Characters') },
                    { value: 'countLines', label: t('Count Lines') }
                  ]}
                />
              </Col>
              <Col span={8}>
                <Space>
                  <Button type="primary" onClick={processText} icon={<EditOutlined />}>
                    {t('Process')}
                  </Button>
                  <Button onClick={clearAll}>
                    {t('Clear')}
                  </Button>
                </Space>
              </Col>
            </Row>
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
  );
} 