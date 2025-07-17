import { Link } from 'react-router-dom';
import { Card } from 'antd';

export default function ToolCard({ path, name, desc }) {
  return (
    <Link to={path} style={{ textDecoration: 'none', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Card hoverable style={{ borderRadius: 16, minHeight: 140, width: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Card.Meta title={<span style={{ fontSize: 20, fontWeight: 600 }}>{name}</span>} description={desc} />
      </Card>
    </Link>
  );
} 