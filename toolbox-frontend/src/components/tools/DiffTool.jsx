import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Card, Space, Row, Col } from 'antd';
import { DiffOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

/**
 * Simple text diff implementation
 * @param {string} a - First text to compare
 * @param {string} b - Second text to compare
 * @returns {string} - Formatted diff result
 */
function simpleDiff(a, b) {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  let result = '';
  const max = Math.max(aLines.length, bLines.length);
  
  for (let i = 0; i < max; i++) {
    if (i < aLines.length && i < bLines.length && aLines[i] === bLines[i]) {
      result += `  ${aLines[i]}\n`;
    } else {
      if (i < aLines.length) {
        result += `- ${aLines[i] || ''}\n`;
      }
      if (i < bLines.length) {
        result += `+ ${bLines[i] || ''}\n`;
      }
    }
  }
  return result;
}

export default function DiffTool() {
  const { t } = useTranslation();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [diff, setDiff] = useState('');
  
  const handleCompare = () => {
    setDiff(simpleDiff(a, b));
  };
  
  return (
    <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>{t('Text Comparison')}</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={12}>
            <TextArea 
              value={a} 
              onChange={e => setA(e.target.value)} 
              rows={8} 
              placeholder={t('Text 1')} 
            />
          </Col>
          <Col span={12}>
            <TextArea 
              value={b} 
              onChange={e => setB(e.target.value)} 
              rows={8} 
              placeholder={t('Text 2')} 
            />
          </Col>
        </Row>
        
        <Button 
          type="primary" 
          icon={<DiffOutlined />} 
          onClick={handleCompare}
        >
          {t('Compare')}
        </Button>
        
        {diff && (
          <Card>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {diff}
            </pre>
          </Card>
        )}
      </Space>
    </Card>
  );
} 