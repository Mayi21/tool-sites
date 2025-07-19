import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, Row, Col, Select, message } from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

export default function CsvConverter() {
  const { t } = useTranslation();
  const [input, setInput] = useState('name,age,city\nJohn,25,New York\nJane,30,Los Angeles');
  const [output, setOutput] = useState('');
  const [conversionType, setConversionType] = useState('csv2json');

  function convertData() {
    if (!input) return;

    try {
      if (conversionType === 'csv2json') {
        const lines = input.trim().split('\n');
        if (lines.length < 2) {
          message.error(t('CSV must have at least a header and one data row'));
          return;
        }

        const headers = lines[0].split(',');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          const row = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index] ? values[index].trim() : '';
          });
          data.push(row);
        }

        setOutput(JSON.stringify(data, null, 2));
      } else {
        // JSON to CSV
        const jsonData = JSON.parse(input);
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          message.error(t('JSON must be an array of objects'));
          return;
        }

        const headers = Object.keys(jsonData[0]);
        const csvLines = [headers.join(',')];

        jsonData.forEach(row => {
          const values = headers.map(header => row[header] || '');
          csvLines.push(values.join(','));
        });

        setOutput(csvLines.join('\n'));
      }
    } catch (error) {
      message.error(t('Invalid input format'));
    }
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
      <Title level={2}>{t('CSV ↔ JSON Converter')}</Title>
      
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Row gutter={16}>
              <Col span={16}>
                <Select
                  value={conversionType}
                  onChange={setConversionType}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'csv2json', label: t('CSV to JSON') },
                    { value: 'json2csv', label: t('JSON to CSV') }
                  ]}
                />
              </Col>
              <Col span={8}>
                <Space>
                  <Button type="primary" onClick={convertData} icon={<ReloadOutlined />}>
                    {t('Convert')}
                  </Button>
                  <Button onClick={clearAll}>
                    {t('Clear')}
                  </Button>
                </Space>
              </Col>
            </Row>
            
            <TextArea 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              rows={12} 
              placeholder={conversionType === 'csv2json' ? t('Enter CSV data') : t('Enter JSON data')}
              style={{ fontFamily: 'monospace' }}
            />
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
              placeholder={t('Converted data will appear here')}
              style={{ fontFamily: 'monospace' }}
            />
          </Space>
        </Col>
      </Row>
    </Card>
  );
} 