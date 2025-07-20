import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, Row, Col } from 'antd';
import { CopyOutlined, DiffOutlined } from '@ant-design/icons';
import CopySuccessAnimation from '../CopySuccessAnimation';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';

const { Title } = Typography;
const { TextArea } = Input;

/**
 * Simple text diff implementation
 * @param {string} a - First text to compare
 * @param {string} b - Second text to compare
 * @returns {string} - Formatted diff result
 */
function simpleDiff(a, b) {
  const linesA = a.split('\n');
  const linesB = b.split('\n');
  const diff = [];
  
  for (let i = 0; i < Math.max(linesA.length, linesB.length); i++) {
    const lineA = linesA[i] || '';
    const lineB = linesB[i] || '';
    
    if (lineA === lineB) {
      diff.push(`  ${lineA}`);
    } else {
      diff.push(`- ${lineA}`);
      diff.push(`+ ${lineB}`);
    }
  }
  
  return diff.join('\n');
}

export default function DiffTool() {
  const { t } = useTranslation();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [diff, setDiff] = useState('');
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();
  
  const handleCompare = () => {
    setDiff(simpleDiff(a, b));
  };

  async function copyDiff() {
    if (diff) {
      await copyToClipboard(diff);
    }
  }
  
  return (
    <>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span>{t('Diff Result')}</span>
                <Button size="small" onClick={copyDiff} icon={<CopyOutlined />}>
                  {t('Copy')}
                </Button>
              </div>
              <pre style={{ 
                backgroundColor: 'var(--bg-tertiary)',
                padding: '10px',
                borderRadius: '4px',
                maxHeight: '400px',
                overflow: 'auto',
                border: '1px solid var(--border-color)'
              }}>
                {diff}
              </pre>
            </Card>
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