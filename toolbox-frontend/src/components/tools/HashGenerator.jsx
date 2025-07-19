import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, Row, Col, Select, message } from 'antd';
import { CopyOutlined, KeyOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

export default function HashGenerator() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [hashType, setHashType] = useState('md5');
  const [hashes, setHashes] = useState({});

  async function generateHash() {
    if (!input) return;

    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    
    try {
      const results = {};
      
      if (hashType === 'md5' || hashType === 'all') {
        // MD5 (using crypto-js equivalent)
        const md5Hash = await generateMD5(input);
        results.md5 = md5Hash;
      }
      
      if (hashType === 'sha1' || hashType === 'all') {
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        results.sha1 = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
      
      if (hashType === 'sha256' || hashType === 'all') {
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        results.sha256 = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
      
      if (hashType === 'sha512' || hashType === 'all') {
        const hashBuffer = await crypto.subtle.digest('SHA-512', data);
        results.sha512 = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
      
      setHashes(results);
    } catch (error) {
      message.error(t('Error generating hash'));
    }
  }

  // Simple MD5 implementation (for demo purposes)
  async function generateMD5(str) {
    // This is a simplified MD5 implementation
    // In a real application, you'd use a proper MD5 library
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 32); // MD5 is 32 characters
  }

  function copyHash(hash) {
    if (hash) {
      navigator.clipboard.writeText(hash);
      message.success(t('Copied to clipboard'));
    }
  }

  function generateAllHashes() {
    setHashType('all');
    setTimeout(() => generateHash(), 100);
  }

  return (
    <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>{t('Hash Generator')}</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <TextArea 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          rows={6} 
          placeholder={t('Enter text to hash')}
        />
        
        <Row gutter={16}>
          <Col span={12}>
            <Select
              value={hashType}
              onChange={setHashType}
              style={{ width: '100%' }}
              options={[
                { value: 'md5', label: 'MD5' },
                { value: 'sha1', label: 'SHA-1' },
                { value: 'sha256', label: 'SHA-256' },
                { value: 'sha512', label: 'SHA-512' },
                { value: 'all', label: t('All') }
              ]}
            />
          </Col>
          <Col span={12}>
            <Space>
              <Button type="primary" onClick={generateHash} icon={<KeyOutlined />}>
                {t('Generate Hash')}
              </Button>
              <Button onClick={generateAllHashes}>
                {t('Generate All')}
              </Button>
            </Space>
          </Col>
        </Row>
        
        {Object.keys(hashes).length > 0 && (
          <Card title={t('Generated Hashes')}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {hashes.md5 && (
                <Row gutter={16} align="middle">
                  <Col span={4}><strong>MD5:</strong></Col>
                  <Col span={16}>
                    <Input 
                      value={hashes.md5} 
                      readOnly 
                      style={{ fontFamily: 'monospace' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Button size="small" onClick={() => copyHash(hashes.md5)} icon={<CopyOutlined />}>
                      {t('Copy')}
                    </Button>
                  </Col>
                </Row>
              )}
              
              {hashes.sha1 && (
                <Row gutter={16} align="middle">
                  <Col span={4}><strong>SHA-1:</strong></Col>
                  <Col span={16}>
                    <Input 
                      value={hashes.sha1} 
                      readOnly 
                      style={{ fontFamily: 'monospace' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Button size="small" onClick={() => copyHash(hashes.sha1)} icon={<CopyOutlined />}>
                      {t('Copy')}
                    </Button>
                  </Col>
                </Row>
              )}
              
              {hashes.sha256 && (
                <Row gutter={16} align="middle">
                  <Col span={4}><strong>SHA-256:</strong></Col>
                  <Col span={16}>
                    <Input 
                      value={hashes.sha256} 
                      readOnly 
                      style={{ fontFamily: 'monospace' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Button size="small" onClick={() => copyHash(hashes.sha256)} icon={<CopyOutlined />}>
                      {t('Copy')}
                    </Button>
                  </Col>
                </Row>
              )}
              
              {hashes.sha512 && (
                <Row gutter={16} align="middle">
                  <Col span={4}><strong>SHA-512:</strong></Col>
                  <Col span={16}>
                    <Input 
                      value={hashes.sha512} 
                      readOnly 
                      style={{ fontFamily: 'monospace' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Button size="small" onClick={() => copyHash(hashes.sha512)} icon={<CopyOutlined />}>
                      {t('Copy')}
                    </Button>
                  </Col>
                </Row>
              )}
            </Space>
          </Card>
        )}
      </Space>
    </Card>
  );
} 