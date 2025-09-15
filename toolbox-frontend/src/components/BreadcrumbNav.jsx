import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumbs, Typography, Box } from '@mui/material';
import { Home } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// 工具分类映射
const getToolCategory = (path) => {
  const categoryMap = {
    '/base64': 'dev',
    '/json-formatter': 'dev',
    '/regex-tester': 'dev',
    '/url-encoder': 'dev',
    '/timestamp': 'dev',
    '/jwt-decoder': 'dev',
    '/cron-parser': 'dev',
    '/diff': 'text',
    '/text-analyzer': 'text',
    '/text-processor': 'text',
    '/markdown-preview': 'text',
    '/unicode-converter': 'text',
    '/csv-converter': 'data',
    '/uuid-generator': 'data',
    '/hash-generator': 'security',
    '/password-generator': 'security',
    '/color-converter': 'design',
    '/qr-generator': 'design',
    '/image-compressor': 'design',
    '/image-watermark': 'design'
  };

  return categoryMap[path] || null;
};

// 分类显示名称映射
const getCategoryDisplayName = (categoryKey) => {
  const displayMap = {
    'dev': 'Development Tools',
    'text': 'Text Processing',
    'data': 'Data Conversion',
    'security': 'Security & Encryption',
    'design': 'Design Tools'
  };

  return displayMap[categoryKey] || categoryKey;
};

export default function BreadcrumbNav({ currentToolName }) {
  const { t } = useTranslation();
  const location = useLocation();
  const categoryKey = getToolCategory(location.pathname);
  const categoryDisplayName = categoryKey ? getCategoryDisplayName(categoryKey) : null;

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

        {categoryKey && (
          <Link
            to={`/?category=${categoryKey}`}
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            {t(categoryDisplayName)}
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