import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Grid, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { 
  CodeOutlined, 
  ArticleOutlined, 
  StorageOutlined, 
  SecurityOutlined, 
  PaletteOutlined,
  BuildOutlined 
} from '@mui/icons-material';

// 工具图标映射 (复用ToolCard的逻辑)
const getToolIcon = (path) => {
  if (path.includes('base64') || path.includes('json') || path.includes('url') || path.includes('timestamp') || path.includes('regex') || path.includes('jwt')) {
    return <CodeOutlined sx={{ fontSize: 20, color: '#1677ff' }} />;
  } else if (path.includes('diff') || path.includes('text') || path.includes('markdown')) {
    return <ArticleOutlined sx={{ fontSize: 20, color: '#52c41a' }} />;
  } else if (path.includes('csv') || path.includes('data')) {
    return <StorageOutlined sx={{ fontSize: 20, color: '#722ed1' }} />;
  } else if (path.includes('hash') || path.includes('password')) {
    return <SecurityOutlined sx={{ fontSize: 20, color: '#fa8c16' }} />;
  } else if (path.includes('color') || path.includes('qr') || path.includes('image')) {
    return <PaletteOutlined sx={{ fontSize: 20, color: '#eb2f96' }} />;
  } else {
    return <BuildOutlined sx={{ fontSize: 20, color: '#13c2c2' }} />;
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
    <Box sx={{ 
      mt: 4,
      p: 3,
      bgcolor: 'background.paper',
      borderRadius: 2,
      border: 1,
      borderColor: 'divider'
    }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 3, 
          color: 'text.primary',
          textAlign: 'center',
          fontSize: { xs: '1.5rem', sm: '2rem' },
          fontWeight: 600
        }}
      >
        相关推荐工具 | Related Tools
      </Typography>
      
      <Grid container spacing={2} justifyContent="center">
        {relatedTools.map(tool => (
          <Grid item key={tool.path} xs={6} sm={6} md={3} lg={3}>
            <Link to={tool.path} style={{ textDecoration: 'none' }}>
              <Card 
                sx={{
                  textAlign: 'center',
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <CardContent sx={{ p: '12px 8px !important' }}>
                  <Box sx={{ mb: 1 }}>
                    {getToolIcon(tool.path)}
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'text.primary',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {t(tool.nameKey)}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}