import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { 
  CodeOutlined, 
  ArticleOutlined, 
  StorageOutlined, 
  SecurityOutlined, 
  PaletteOutlined,
  BuildOutlined
} from '@mui/icons-material';

// 工具图标映射
const getToolIcon = (path) => {
  if (path.includes('base64') || path.includes('json') || path.includes('url') || path.includes('timestamp') || path.includes('regex') || path.includes('jwt')) {
    return <CodeOutlined sx={{ fontSize: 32, color: '#1677ff' }} />;
  } else if (path.includes('diff') || path.includes('text') || path.includes('markdown')) {
    return <ArticleOutlined sx={{ fontSize: 32, color: '#52c41a' }} />;
  } else if (path.includes('csv') || path.includes('data')) {
    return <StorageOutlined sx={{ fontSize: 32, color: '#722ed1' }} />;
  } else if (path.includes('hash')) {
    return <SecurityOutlined sx={{ fontSize: 32, color: '#fa8c16' }} />;
  } else if (path.includes('color') || path.includes('qr') || path.includes('image')) {
    return <PaletteOutlined sx={{ fontSize: 32, color: '#eb2f96' }} />;
  } else {
    return <BuildOutlined sx={{ fontSize: 32, color: '#13c2c2' }} />;
  }
};

export default function ToolCard({ path, nameKey, descKey, pageDescriptionKey }) {
  const { t } = useTranslation();
  const cardMaxWidth = 320;
  const titleFontSize = 16;
  const descFontSize = 13;
  const clampLines = 3;
  
  return (
    <Link to={path} style={{ textDecoration: 'none', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Card 
        sx={{ 
          width: '100%',
          maxWidth: cardMaxWidth,
          height: '100%',
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            textAlign: 'center',
            width: '100%',
            height: '100%',
            minHeight: 180,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ mb: 1, flexShrink: 0 }}>
            {getToolIcon(path)}
          </Box>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: titleFontSize, 
              fontWeight: 600, 
              color: 'text.primary',
              mb: 1,
              lineHeight: 1.4,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}
          >
            {t(nameKey)}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: descFontSize, 
              color: 'text.secondary',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: clampLines,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}
          >
            {t(pageDescriptionKey || descKey)}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
} 