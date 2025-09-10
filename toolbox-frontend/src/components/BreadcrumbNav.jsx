import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
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

  const items = [
    {
      title: (
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>
          <HomeOutlined style={{ marginRight: '4px' }} />
          {t('Home')}
        </Link>
      ),
    }
  ];

  if (category) {
    items.push({
      title: (
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>
          {t(category)}
        </Link>
      ),
    });
  }

  items.push({
    title: (
      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
        {currentToolName || 'Current Tool'}
      </span>
    ),
  });

  return (
    <div style={{ marginBottom: '1rem' }}>
      <Breadcrumb 
        items={items}
        style={{
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}
      />
    </div>
  );
}