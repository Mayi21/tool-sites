import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  CodeOutlined, 
  FileTextOutlined, 
  DatabaseOutlined, 
  SafetyOutlined, 
  BgColorsOutlined,
  ToolOutlined 
} from '@ant-design/icons';

const { Title } = Typography;

// 工具图标映射 (复用ToolCard的逻辑)
const getToolIcon = (path) => {
  if (path.includes('base64') || path.includes('json') || path.includes('url') || path.includes('timestamp') || path.includes('regex') || path.includes('jwt')) {
    return <CodeOutlined style={{ fontSize: 20, color: '#1677ff' }} />;
  } else if (path.includes('diff') || path.includes('text') || path.includes('markdown')) {
    return <FileTextOutlined style={{ fontSize: 20, color: '#52c41a' }} />;
  } else if (path.includes('csv') || path.includes('data')) {
    return <DatabaseOutlined style={{ fontSize: 20, color: '#722ed1' }} />;
  } else if (path.includes('hash') || path.includes('password')) {
    return <SafetyOutlined style={{ fontSize: 20, color: '#fa8c16' }} />;
  } else if (path.includes('color') || path.includes('qr') || path.includes('image')) {
    return <BgColorsOutlined style={{ fontSize: 20, color: '#eb2f96' }} />;
  } else {
    return <ToolOutlined style={{ fontSize: 20, color: '#13c2c2' }} />;
  }
};

// 相关工具推荐逻辑
const getRelatedTools = (currentPath, allTools) => {
  // 工具关联关系映射
  const relatedMap = {
    '/base64': ['/url-encoder', '/hash-generator', '/jwt-decoder', '/text-processor'],
    '/json-formatter': ['/csv-converter', '/jwt-decoder', '/diff', '/text-processor'],
    '/regex-tester': ['/text-analyzer', '/text-processor', '/diff'],
    '/url-encoder': ['/base64', '/hash-generator', '/text-processor'],
    '/timestamp': ['/uuid-generator', '/hash-generator', '/text-analyzer'],
    '/hash-generator': ['/base64', '/password-generator', '/jwt-decoder'],
    '/jwt-decoder': ['/base64', '/json-formatter', '/hash-generator'],
    '/color-converter': ['/qr-generator', '/image-watermark', '/image-compressor'],
    '/qr-generator': ['/color-converter', '/image-watermark', '/text-processor'],
    '/diff': ['/text-analyzer', '/text-processor', '/regex-tester'],
    '/text-analyzer': ['/text-processor', '/regex-tester', '/diff'],
    '/text-processor': ['/text-analyzer', '/regex-tester', '/base64'],
    '/csv-converter': ['/json-formatter', '/text-processor', '/diff'],
    '/markdown-preview': ['/text-processor', '/diff', '/text-analyzer'],
    '/image-compressor': ['/image-watermark', '/qr-generator'],
    '/image-watermark': ['/image-compressor', '/qr-generator', '/color-converter'],
    '/unicode-converter': ['/text-processor', '/base64', '/url-encoder'],
    '/cron-parser': ['/timestamp', '/text-analyzer', '/regex-tester'],
    '/uuid-generator': ['/hash-generator', '/password-generator', '/timestamp'],
    '/password-generator': ['/hash-generator', '/uuid-generator', '/base64']
  };

  const related = relatedMap[currentPath] || [];
  return allTools.filter(tool => related.includes(tool.path)).slice(0, 4);
};

export default function RelatedTools({ currentPath, allTools }) {
  const { t } = useTranslation();
  const relatedTools = getRelatedTools(currentPath, allTools);

  if (relatedTools.length === 0) {
    return null;
  }

  return (
    <div style={{ 
      marginTop: '3rem',
      padding: '2rem',
      background: 'var(--bg-primary)',
      borderRadius: '12px',
      border: '1px solid var(--border-color)'
    }}>
      <Title level={3} style={{ 
        marginBottom: '1.5rem', 
        color: 'var(--text-primary)',
        textAlign: 'center'
      }}>
        相关推荐工具 | Related Tools
      </Title>
      
      <Row gutter={[16, 16]} justify="center">
        {relatedTools.map(tool => (
          <Col key={tool.path} xs={12} sm={12} md={6} lg={6}>
            <Link to={tool.path} style={{ textDecoration: 'none' }}>
              <Card 
                hoverable
                size="small"
                style={{
                  textAlign: 'center',
                  height: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)'
                }}
                bodyStyle={{ padding: '12px 8px' }}
              >
                <div style={{ marginBottom: '8px' }}>
                  {getToolIcon(tool.path)}
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  lineHeight: '1.3',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {t(tool.nameKey)}
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}