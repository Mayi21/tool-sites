import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Card, Row, Col, Space, Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

export default function MarkdownPreview() {
  const { t } = useTranslation();
  const [markdown, setMarkdown] = useState('# Hello World\n\nThis is **bold** and *italic* text.\n\n- List item 1\n- List item 2\n\n```javascript\nconsole.log("Hello World");\n```');

  function renderMarkdown(text) {
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/^(.+)$/gim, '<p>$1</p>');
  }

  function copyMarkdown() {
    if (markdown) {
      navigator.clipboard.writeText(markdown);
      message.success(t('Copied to clipboard'));
    }
  }

  return (
    <Card style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>{t('Markdown Preview')}</Title>
      
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t('Markdown')}</span>
              <Button size="small" onClick={copyMarkdown} icon={<CopyOutlined />}>
                {t('Copy')}
              </Button>
            </div>
            
            <TextArea 
              value={markdown} 
              onChange={e => setMarkdown(e.target.value)} 
              rows={20} 
              placeholder={t('Enter markdown text')}
              style={{ fontFamily: 'monospace' }}
            />
          </Space>
        </Col>
        
        <Col span={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <span>{t('Preview')}</span>
            
            <div 
              style={{ 
                border: '1px solid var(--border-color)',
                borderRadius: 6,
                padding: 16,
                minHeight: 400,
                backgroundColor: 'var(--card-bg)',
                overflow: 'auto'
              }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
            />
          </Space>
        </Col>
      </Row>
    </Card>
  );
} 