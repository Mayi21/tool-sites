import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumbs, Typography, Box } from '@mui/material';
import { Home } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// 工具分类映射
const getToolCategory = (path) => {
  const categoryMap = {
    '/base64': 'Development Tools',
    '/json-formatter': 'Development Tools', 
    '/regex-tester': 'Development Tools',
    '/url-encoder': 'Development Tools',
    '/timestamp': 'Development Tools',
    '/jwt-decoder': 'Development Tools',
    '/cron-parser': 'Development Tools',
    '/diff': 'Text Processing',
    '/text-analyzer': 'Text Processing',
    '/text-processor': 'Text Processing', 
    '/markdown-preview': 'Text Processing',
    '/unicode-converter': 'Text Processing',
    '/csv-converter': 'Data Conversion',
    '/uuid-generator': 'Data Conversion',
    '/hash-generator': 'Security & Encryption',
    '/password-generator': 'Security & Encryption',
    '/color-converter': 'Design Tools',
    '/qr-generator': 'Design Tools',
    '/image-compressor': 'Design Tools',
    '/image-watermark': 'Design Tools'
  };
  
  return categoryMap[path] || null;
};

export default function BreadcrumbNav({ currentToolName }) {
  const { t } = useTranslation();
  const location = useLocation();
  const category = getToolCategory(location.pathname);
  
  if (location.pathname === '/') {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Breadcrumbs 
        aria-label="breadcrumb"
        sx={{
          fontSize: '14px',
          color: 'text.secondary'
        }}
      >
        <Link 
          to="/" 
          style={{ 
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Home sx={{ mr: 0.5, fontSize: 16 }} />
          {t('Home')}
        </Link>
        
        {category && (
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            {t(category)}
          </Link>
        )}
        
        <Typography 
          color="text.primary" 
          sx={{ fontWeight: 500 }}
        >
          {currentToolName || 'Current Tool'}
        </Typography>
      </Breadcrumbs>
    </Box>
  );
}