import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import tools from './tools';
import ToolCard from './components/ToolCard';
import LanguageSwitcher from './components/LanguageSwitcher';
import ThemeSwitcher from './components/ThemeSwitcher';
import NotFound from './components/NotFound';
import ThemeTransition from './components/ThemeTransition';
import './App.css';
import { Layout, Row, Col, ConfigProvider, theme as antdTheme, Typography, Divider, Space, Spin } from 'antd';

const ViewQuestionnaire = lazy(() => import('./components/tools/ViewQuestionnaire'));
const ViewResults = lazy(() => import('./components/tools/ViewResults'));

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

// 工具分类
const toolCategories = [
  {
    nameKey: 'Development Tools',
    key: 'dev',
    tools: ['base64', 'json-formatter', 'url-encoder', 'timestamp', 'regex-tester', 'jwt-decoder', 'cron-parser']
  },
  {
    nameKey: 'Text Processing',
    key: 'text',
    tools: ['diff', 'text-analyzer', 'text-processor', 'markdown-preview', 'unicode-converter']
  },
  {
    nameKey: 'Data Conversion',
    key: 'data',
    tools: ['csv-converter', 'uuid-generator']
  },
  {
    nameKey: 'Security & Encryption',
    key: 'security',
    tools: ['hash-generator', 'password-generator']
  },
  { nameKey: 'Design Tools', key: 'design', tools: ['color-converter', 'qr-generator', 'image-compressor', 'image-watermark'] }
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
        const currentTool = tools.find(tool => path === tool.path);
        if (currentTool) {
          document.title = `${t(currentTool.nameKey)} - ${t('Multi-function Toolbox')}`;
        } else {
          document.title = `${t('Multi-function Toolbox')} - 多功能工具箱`;
        }
      }
    };
    
    updateTitle();
  }, [location.pathname, t]);
  
  return null;
}

// 路由过渡包装，基于 pathname 触发入场动画
function RouteTransitionWrapper({ children }) {
  const loc = useLocation();
  return (
    <div className="route-transition" key={loc.pathname}>
      {children}
    </div>
  );
}

// 导航栏组件
function NavigationBar({ theme, setTheme }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 检查是否在工具页面
  const isInToolPage = location.pathname !== '/';
  
  // 点击Logo或标题返回首页
  const goHome = () => navigate('/');

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

  const quickNavItems = [
    {
      key: 'dev',
      label: (
        <Space>
          <span>•</span>
          {t('Development Tools')}
        </Space>
      ),
      onClick: () => goToCategory('dev')
    },
    {
      key: 'text',
      label: (
        <Space>
          <span>•</span>
          {t('Text Processing')}
        </Space>
      ),
      onClick: () => goToCategory('text')
    },
    {
      key: 'data',
      label: (
        <Space>
          <span>•</span>
          {t('Data Conversion')}
        </Space>
      ),
      onClick: () => goToCategory('data')
    },
    {
      key: 'security',
      label: (
        <Space>
          <span>•</span>
          {t('Security & Encryption')}
        </Space>
      ),
      onClick: () => goToCategory('security')
    },
    {
      key: 'design',
      label: (
        <Space>
          <span>•</span>
          {t('Design Tools')}
        </Space>
      ),
      onClick: () => goToCategory('design')
    }
  ];

  // 去掉键盘快捷键

  return (
    <Header 
      style={{ 
        background: 'var(--header-bg)', 
        boxShadow: 'none', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        width: '100%',
        borderBottom: '1px solid var(--border-color)',
        height: '64px',
        padding: '0 24px'
      }}
    >
      {/* 左侧：Logo与标题（点击返回首页） */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center',
          cursor: 'pointer',
          flex: '1 1 auto',
          overflow: 'hidden'
        }} 
        onClick={goHome}
      >
        <img 
          src="/toolbox-icon.svg" 
          alt="Toolbox Icon" 
          style={{ 
            width: 22, 
            height: 22, 
            marginRight: 3,
            flexShrink: 0
          }} 
        />
        <span 
          className="header-title-text" 
          style={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            transform: 'translateY(-2px)'  // 微调垂直位置
          }}
        >
          {t('Multi-function Toolbox')}
        </span>
      </div>
      
      {/* 右侧：语言切换和主题切换 */}
      <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 16
        }}>
        <LanguageSwitcher />
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
      </div>
    </Header>
  );
}

function App() {
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

  // 移除收藏/最近使用/搜索逻辑，保持首页简洁

  const [activeCategoryKey, setActiveCategoryKey] = useState('all');

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

  // 过滤函数移除（不再提供搜索）

  const categorizedTools = getToolsByCategory();
  const categoriesToRender = activeCategoryKey === 'all'
    ? toolCategories
    : toolCategories.filter(c => c.key === activeCategoryKey);
  
  // 简化后不再使用收藏与最近使用

  return (
    <ConfigProvider
      key={theme}
      theme={{
        algorithm: theme === 'dark' ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <BrowserRouter>
        <DynamicTitle />
        {/* 路由过渡动画容器 */}
        <ThemeTransition theme={theme}>
          <Layout style={{ minHeight: '100vh', width: '100%' }}>
            <NavigationBar theme={theme} setTheme={setTheme} />
            <Content 
              style={{ 
                background: 'var(--bg-secondary)', 
                padding: 'clamp(12px, 2vw, 24px) clamp(8px, 2vw, 24px)',
                width: '100%',
                minHeight: 'calc(100vh - 64px - 70px)'
              }}
            >
              <RouteTransitionWrapper>
                <Suspense fallback={<Spin size="large" />}>
                  <Routes>
                  <Route path="/" element={
                    <div style={{ 
                      width: '100%', 
                      maxWidth: '1280px', 
                      margin: '0 auto', 
                      padding: '0 8px'
                    }}>


                      {/* 分类快捷标签保留，仅用于切换分类 */}
                      <div style={{ margin: '0 auto 24px', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {['dev','text','data','security','design','all'].map(key => (
                          <button
                            key={key}
                            onClick={() => setActiveCategoryKey(key)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
                              border: '1px solid var(--border-color)',
                              background: activeCategoryKey === key ? '#1677ff' : 'var(--bg-tertiary)',
                              color: activeCategoryKey === key ? '#fff' : 'var(--text-primary)',
                              cursor: 'pointer'
                            }}
                          >
                            {key === 'all' ? t('All') : t(toolCategories.find(c => c.key === key)?.nameKey)}
                          </button>
                        ))}
                      </div>

                      {/* 移除收藏与最近使用区块 */}
                      
                      {categoriesToRender.map((category, index) => (
                        <div key={category.key} id={`category-${category.key}`} style={{ marginBottom: '2rem' }}>
                          <Title level={3} style={{ 
                            marginBottom: '1.5rem', 
                            color: 'var(--text-primary)',
                            fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                            textAlign: 'center',
                            width: '100%'
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
                                xl={6}
                                xxl={6}
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
                          {index < categoriesToRender.length - 1 && (
                            <Divider style={{ margin: '3rem 0' }} />
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
                  
                  
                  
                  <Route 
                    path="*" 
                    element={<NotFound />} 
                  />
                  <Route path="/questionnaire/:id" element={<ViewQuestionnaire />} />
                  <Route path="/questionnaire/:id/results" element={<ViewResults />} />
                  </Routes>
                </Suspense>
              </RouteTransitionWrapper>
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

export default App;