import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Tooltip, Dropdown, Space, Breadcrumb } from 'antd';
import { 
  HomeOutlined, 
  ArrowLeftOutlined, 
  AppstoreOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export default function BackToHome() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 检查是否在工具页面
  const isInToolPage = location.pathname !== '/';
  
  // 获取当前工具名称
  const getCurrentToolName = () => {
    const currentTool = location.pathname.split('/').pop();
    return currentTool || '';
  };

  // 返回上一页
  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // 返回主页
  const goHome = () => {
    navigate('/');
  };

  // 返回工具分类
  const goToCategory = (category) => {
    navigate('/');
    // 滚动到对应分类
    setTimeout(() => {
      const element = document.getElementById(`category-${category}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Alt + H 返回主页
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        goHome();
      }
      // Alt + ← 返回上一页
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
      }
      // Escape 返回主页
      if (e.key === 'Escape') {
        goHome();
      }
    };

    if (isInToolPage) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isInToolPage]);

  // 面包屑导航项
  const breadcrumbItems = [
    {
      title: (
        <Link to="/" style={{ color: 'var(--text-primary)' }}>
          <HomeOutlined />
          <span style={{ marginLeft: 4 }}>{t('Home')}</span>
        </Link>
      ),
    },
    {
      title: (
        <span style={{ color: 'var(--text-secondary)' }}>
          {getCurrentToolName()}
        </span>
      ),
    },
  ];

  // 快速导航选项
  const quickNavItems = [
    {
      key: 'home',
      label: (
        <Space>
          <HomeOutlined />
          {t('Back to Home')}
        </Space>
      ),
      onClick: goHome
    },
    {
      key: 'back',
      label: (
        <Space>
          <ArrowLeftOutlined />
          {t('Go Back')}
        </Space>
      ),
      onClick: goBack
    },
    {
      type: 'divider'
    },
    {
      key: 'dev',
      label: (
        <Space>
          <AppstoreOutlined />
          {t('Development Tools')}
        </Space>
      ),
      onClick: () => goToCategory('dev')
    },
    {
      key: 'text',
      label: (
        <Space>
          <AppstoreOutlined />
          {t('Text Processing')}
        </Space>
      ),
      onClick: () => goToCategory('text')
    },
    {
      key: 'data',
      label: (
        <Space>
          <AppstoreOutlined />
          {t('Data Conversion')}
        </Space>
      ),
      onClick: () => goToCategory('data')
    },
    {
      key: 'security',
      label: (
        <Space>
          <AppstoreOutlined />
          {t('Security & Encryption')}
        </Space>
      ),
      onClick: () => goToCategory('security')
    },
    {
      key: 'design',
      label: (
        <Space>
          <AppstoreOutlined />
          {t('Design Tools')}
        </Space>
      ),
      onClick: () => goToCategory('design')
    }
  ];

  if (!isInToolPage) {
    return null;
  }

  return (
    <div className="navigation-container">
      {/* 面包屑导航 */}
      <div className="breadcrumb-section">
        <Breadcrumb 
          items={breadcrumbItems}
          separator={<span style={{ color: 'var(--text-tertiary)' }}>/</span>}
        />
      </div>
      
      {/* 导航按钮组 */}
      <div className="nav-buttons-section">
        <Space size="small">
          {/* 返回上一页按钮 */}
          <Tooltip title={`${t('Go Back')} (Alt + ←)`} placement="bottom">
            <Button
              className="nav-button"
              icon={<ArrowLeftOutlined />}
              onClick={goBack}
              size="small"
              style={{
                borderRadius: '6px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </Tooltip>

          {/* 返回主页按钮 */}
          <Tooltip title={`${t('Back to Home')} (Alt + H)`} placement="bottom">
            <Button
              className="nav-button"
              type="primary"
              icon={<HomeOutlined />}
              onClick={goHome}
              size="small"
              style={{
                borderRadius: '6px'
              }}
            />
          </Tooltip>

          {/* 快速导航下拉菜单 */}
          <Dropdown
            menu={{
              items: quickNavItems,
              placement: 'bottomRight'
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Tooltip title={t('Quick Navigation')} placement="bottom">
              <Button
                className="nav-button"
                icon={<MenuOutlined />}
                size="small"
                style={{
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </Tooltip>
          </Dropdown>
        </Space>
      </div>
    </div>
  );
}