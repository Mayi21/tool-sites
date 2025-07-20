import { Link } from 'react-router-dom';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  CodeOutlined, 
  FileTextOutlined, 
  DatabaseOutlined, 
  SafetyOutlined, 
  BgColorsOutlined,
  ToolOutlined
} from '@ant-design/icons';

// 工具图标映射
const getToolIcon = (path) => {
  if (path.includes('base64') || path.includes('json') || path.includes('url') || path.includes('timestamp') || path.includes('regex') || path.includes('jwt')) {
    return <CodeOutlined style={{ fontSize: 32, color: '#1677ff' }} />;
  } else if (path.includes('diff') || path.includes('text') || path.includes('markdown')) {
    return <FileTextOutlined style={{ fontSize: 32, color: '#52c41a' }} />;
  } else if (path.includes('csv') || path.includes('data')) {
    return <DatabaseOutlined style={{ fontSize: 32, color: '#722ed1' }} />;
  } else if (path.includes('hash')) {
    return <SafetyOutlined style={{ fontSize: 32, color: '#fa8c16' }} />;
  } else if (path.includes('color') || path.includes('qr') || path.includes('image')) {
    return <BgColorsOutlined style={{ fontSize: 32, color: '#eb2f96' }} />;
  } else {
    return <ToolOutlined style={{ fontSize: 32, color: '#13c2c2' }} />;
  }
};

export default function ToolCard({ path, nameKey, descKey }) {
  const { t } = useTranslation();
  
  return (
    <Link to={path} style={{ textDecoration: 'none', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Card 
        hoverable 
        style={{ 
          borderRadius: 12, 
          minHeight: 160, 
          width: '100%',
          maxWidth: 320,
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px var(--shadow-color)',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--card-bg)',
          cursor: 'pointer',
          overflow: 'hidden'
        }}
        bodyStyle={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 12px',
          textAlign: 'center',
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        <div style={{ marginBottom: 8, flexShrink: 0 }}>
          {getToolIcon(path)}
        </div>
        <Card.Meta 
          title={
            <span style={{ 
              fontSize: 16, 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              marginBottom: 6,
              display: 'block',
              lineHeight: 1.4,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}>
              {t(nameKey)}
            </span>
          } 
          description={
            <span style={{ 
              fontSize: 13, 
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}>
              {t(descKey)}
            </span>
          } 
        />
      </Card>
    </Link>
  );
} 