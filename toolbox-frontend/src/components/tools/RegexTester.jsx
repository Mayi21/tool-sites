import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, Alert, Row, Col, Checkbox } from 'antd';
import { SearchOutlined, CopyOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

export default function RegexTester() {
  const { t } = useTranslation();
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [flags, setFlags] = useState({
    global: true,
    ignoreCase: false,
    multiline: false,
    sticky: false,
    unicode: false
  });

  function testRegex() {
    if (!pattern || !testText) return;

    try {
      setError(null);
      let flagString = '';
      if (flags.global) flagString += 'g';
      if (flags.ignoreCase) flagString += 'i';
      if (flags.multiline) flagString += 'm';
      if (flags.sticky) flagString += 'y';
      if (flags.unicode) flagString += 'u';

      const regex = new RegExp(pattern, flagString);
      const results = [];
      let match;

      if (flags.global) {
        while ((match = regex.exec(testText)) !== null) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      } else {
        match = regex.exec(testText);
        if (match) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }

      setMatches(results);
    } catch (e) {
      setError(e.message);
      setMatches([]);
    }
  }

  function replaceText() {
    if (!pattern || !testText) return;

    try {
      setError(null);
      let flagString = '';
      if (flags.global) flagString += 'g';
      if (flags.ignoreCase) flagString += 'i';
      if (flags.multiline) flagString += 'm';
      if (flags.sticky) flagString += 'y';
      if (flags.unicode) flagString += 'u';

      const regex = new RegExp(pattern, flagString);
      const replaced = testText.replace(regex, 'REPLACED');
      setTestText(replaced);
    } catch (e) {
      setError(e.message);
    }
  }

  function copyPattern() {
    if (pattern) {
      navigator.clipboard.writeText(pattern);
    }
  }

  return (
    <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>{t('Regex Tester')}</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={16}>
            <Input 
              value={pattern} 
              onChange={e => setPattern(e.target.value)} 
              placeholder={t('Enter regex pattern')}
              prefix={<SearchOutlined />}
              addonAfter={
                <Button size="small" onClick={copyPattern} icon={<CopyOutlined />}>
                  {t('Copy')}
                </Button>
              }
            />
          </Col>
          <Col span={8}>
            <Space>
              <Checkbox 
                checked={flags.global} 
                onChange={e => setFlags({...flags, global: e.target.checked})}
              >
                g
              </Checkbox>
              <Checkbox 
                checked={flags.ignoreCase} 
                onChange={e => setFlags({...flags, ignoreCase: e.target.checked})}
              >
                i
              </Checkbox>
              <Checkbox 
                checked={flags.multiline} 
                onChange={e => setFlags({...flags, multiline: e.target.checked})}
              >
                m
              </Checkbox>
            </Space>
          </Col>
        </Row>
        
        <TextArea 
          value={testText} 
          onChange={e => setTestText(e.target.value)} 
          rows={6} 
          placeholder={t('Enter text to test')}
        />
        
        <Space>
          <Button type="primary" onClick={testRegex}>
            {t('Test')}
          </Button>
          <Button onClick={replaceText}>
            {t('Replace')}
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
        
        {matches.length > 0 && (
          <Card title={`${t('Matches')} (${matches.length})`}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {matches.map((match, index) => (
                <div key={index} style={{ 
                  padding: 8, 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: 4,
                  border: '1px solid #d9d9d9'
                }}>
                  <div><strong>{t('Match')}:</strong> {match.match}</div>
                  <div><strong>{t('Index')}:</strong> {match.index}</div>
                  {match.groups.length > 0 && (
                    <div><strong>{t('Groups')}:</strong> {match.groups.join(', ')}</div>
                  )}
                </div>
              ))}
            </Space>
          </Card>
        )}
      </Space>
    </Card>
  );
} 