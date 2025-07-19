import { Link } from 'react-router-dom';
import { Card } from 'antd';
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

export default function ToolCard({ path, name, desc }) {
  return (
    <Link to={path} style={{ textDecoration: 'none', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Card 
        hoverable 
        style={{ 
          borderRadius: 16, 
          minHeight: 160, 
          width: 280, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0'
        }}
        bodyStyle={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          textAlign: 'center'
        }}
      >
        <div style={{ marginBottom: 16 }}>
          {getToolIcon(path)}
        </div>
        <Card.Meta 
          title={
            <span style={{ 
              fontSize: 18, 
              fontWeight: 600, 
              color: '#262626',
              marginBottom: 8,
              display: 'block'
            }}>
              {name}
            </span>
          } 
          description={
            <span style={{ 
              fontSize: 14, 
              color: '#666',
              lineHeight: 1.5
            }}>
              {desc}
            </span>
          } 
        />
      </Card>
    </Link>
  );
} 