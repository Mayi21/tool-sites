import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import tools from './tools';
import ToolCard from './components/ToolCard';
import LanguageSwitcher from './components/LanguageSwitcher';
import ThemeSwitcher from './components/ThemeSwitcher';
import { Layout, Row, Col, ConfigProvider, theme as antdTheme, Typography, Divider, Button, Tooltip, Dropdown, Space } from 'antd';
import { AppstoreOutlined, HomeOutlined, ArrowLeftOutlined, MenuOutlined } from '@ant-design/icons';
import ThemeTransition from './components/ThemeTransition';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

// 工具分类
const toolCategories = [
  {
    nameKey: 'Development Tools',
    key: 'dev',
    tools: ['base64', 'json-formatter', 'url-encoder', 'timestamp', 'regex-tester', 'jwt-decoder']
  },
  {
    nameKey: 'Text Processing',
    key: 'text',
    tools: ['diff', 'text-analyzer', 'text-processor', 'markdown-preview', 'unicode-converter']
  },
  {
    nameKey: 'Data Conversion',
    key: 'data',
    tools: ['csv-converter', 'data-generator']
  },
  {
    nameKey: 'Security & Encryption',
    key: 'security',
    tools: ['hash-generator']
  },
  {
    nameKey: 'Design Tools',
    key: 'design',
    tools: ['color-converter', 'qr-generator', 'image-compressor']
  }
];

// 动态标题组件
function DynamicTitle() {
  const { t } = useTranslation();
  const location = useLocation();
  
  useEffect(() => {
    const updateTitle = () => {
      const path = location.pathname;
      
      if (path === '/') {
        document.title = `${t('Multi-function Toolbox')} - 多功能工具箱`;
      } else {
        // 查找当前工具
        const currentTool = tools.find(tool => tool.path === path);
        if (currentTool) {
          document.title = `${currentTool.name} - ${t('Multi-function Toolbox')}`;
        } else {
          document.title = `${t('Multi-function Toolbox')} - 多功能工具箱`;
        }
      }
    };
    
    updateTitle();
  }, [location.pathname, t]);
  
  return null;
}

// 导航栏组件
function NavigationBar({ theme, setTheme }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 检查是否在工具页面
  const isInToolPage = location.pathname !== '/';
  
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

  return (
    <Header 
      style={{ 
        background: 'var(--header-bg)', 
        boxShadow: '0 2px 8px var(--shadow-color)', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 2rem',
        width: '100%',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      {/* 左侧：Logo和返回按钮 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
          <AppstoreOutlined style={{ fontSize: 28, marginRight: 12, color: '#1677ff' }} />
          {t('Multi-function Toolbox')}
        </div>
        
        {/* 在工具页面显示导航按钮 */}
        {isInToolPage && (
          <Space size="small">
            <Tooltip title={`${t('Go Back')} (Alt + ←)`} placement="bottom">
              <Button
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

            <Tooltip title={`${t('Back to Home')} (Alt + H)`} placement="bottom">
              <Button
                type="primary"
                icon={<HomeOutlined />}
                onClick={goHome}
                size="small"
                style={{
                  borderRadius: '6px'
                }}
              />
            </Tooltip>

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
        )}
      </div>
      
      {/* 右侧：语言切换和主题切换 */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
        <LanguageSwitcher />
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
      </div>
    </Header>
  );
}

export default function App() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // Listen for theme changes
  useEffect(() => {
    const handleStorageChange = () => {
      setTheme(localStorage.getItem('theme') || 'light');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Configure theme algorithm
  const { defaultAlgorithm, darkAlgorithm } = antdTheme;

  // 按分类组织工具
  const getToolsByCategory = () => {
    const categorizedTools = {};
    
    toolCategories.forEach(category => {
      categorizedTools[category.key] = tools.filter(tool => 
        category.tools.some(catTool => tool.path.includes(catTool))
      );
    });
    
    return categorizedTools;
  };

  const categorizedTools = getToolsByCategory();
  
  return (
    <ConfigProvider
      key={theme}
      theme={{
        algorithm: theme === 'dark' ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <BrowserRouter>
        <DynamicTitle />
        <ThemeTransition theme={theme}>
          <Layout style={{ minHeight: '100vh', width: '100%' }}>
            <NavigationBar theme={theme} setTheme={setTheme} />
            <Content 
              style={{ 
                background: 'var(--bg-secondary)', 
                padding: '1.5rem 0.5rem',
                width: '100%',
                minHeight: 'calc(100vh - 64px - 70px)'
              }}
            >
              <Routes>
                <Route path="/" element={
                  <div style={{ 
                    width: '100%', 
                    maxWidth: '1400px', 
                    margin: '0 auto', 
                    padding: '0 8px'
                  }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                      <Title level={2} style={{ marginBottom: '0.5rem', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                        {t('Multi-function Toolbox')}
                      </Title>
                      <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {t('One-stop online tool collection to improve development efficiency')}
                      </p>
                    </div>
                    
                    {toolCategories.map((category, index) => (
                      <div key={category.key} id={`category-${category.key}`} style={{ marginBottom: '2rem' }}>
                        <Title level={3} style={{ 
                          marginBottom: '1rem', 
                          color: 'var(--text-primary)',
                          borderLeft: '4px solid #1677ff',
                          paddingLeft: '0.75rem',
                          fontSize: 'clamp(1.1rem, 3vw, 1.5rem)'
                        }}>
                          {t(category.nameKey)}
                        </Title>
                        <Row
                          gutter={[16, 16]}
                          justify="start"
                          style={{ width: '100%' }}
                        >
                          {categorizedTools[category.key]?.map(tool => (
                            <Col 
                              key={tool.path} 
                              xs={24} 
                              sm={12} 
                              md={8} 
                              lg={6} 
                              xl={4}
                              xxl={3}
                              style={{ display: 'flex', justifyContent: 'center' }}
                            >
                              <ToolCard 
                              path={tool.path}
                              nameKey={tool.nameKey}
                              descKey={tool.descKey}
                            />
                            </Col>
                          ))}
                        </Row>
                        {index < toolCategories.length - 1 && (
                          <Divider style={{ margin: '1.5rem 0' }} />
                        )}
                      </div>
                    ))}
                  </div>
                } />
                {tools.map(tool => (
                  <Route 
                    key={tool.path} 
                    path={tool.path} 
                    element={
                      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 8px', width: '100%' }}>
                        <tool.Component />
                      </div>
                    } 
                  />
                ))}
              </Routes>
            </Content>
            <Footer style={{ 
              textAlign: 'center', 
              background: 'var(--footer-bg)', 
              width: '100%',
              borderTop: '1px solid var(--border-color)',
              color: 'var(--text-secondary)'
            }}>
              {t('Multi-function Toolbox')} ©{new Date().getFullYear()}
            </Footer>
          </Layout>
        </ThemeTransition>
      </BrowserRouter>
    </ConfigProvider>
  );
}
