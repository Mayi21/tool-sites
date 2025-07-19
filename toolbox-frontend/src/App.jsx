import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import tools from './tools';
import ToolCard from './components/ToolCard';
import LanguageSwitcher from './components/LanguageSwitcher';
import ThemeSwitcher from './components/ThemeSwitcher';
import BackToHome from './components/BackToHome';
import { Layout, Row, Col, ConfigProvider, theme as antdTheme, Typography, Divider } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';

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
    tools: ['diff', 'text-analyzer', 'text-processor', 'markdown-preview']
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
      theme={{
        algorithm: theme === 'dark' ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh', width: '100%' }}>
          <Header 
            style={{ 
              background: theme === 'dark' ? '#1f1f1f' : '#fff', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
              display: 'flex', 
              alignItems: 'center', 
              padding: '0 2rem',
              width: '100%'
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <AppstoreOutlined style={{ fontSize: 28, marginRight: 12, color: '#1677ff' }} />
              {t('Multi-function Toolbox')}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </Header>
          <Content 
            style={{ 
              background: theme === 'dark' ? '#141414' : '#f7f8fa', 
              padding: '2rem 1rem',
              width: '100%'
            }}
          >
            <Routes>
              <Route path="/" element={
                <div style={{ 
                  width: '100%', 
                  maxWidth: '1400px', 
                  margin: '0 auto', 
                  padding: '0 16px'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Title level={2} style={{ marginBottom: '0.5rem' }}>
                      {t('Multi-function Toolbox')}
                    </Title>
                    <p style={{ fontSize: 16, color: theme === 'dark' ? '#a6a6a6' : '#666', margin: 0 }}>
                      {t('One-stop online tool collection to improve development efficiency')}
                    </p>
                  </div>
                  
                  {toolCategories.map((category, index) => (
                    <div key={category.key} style={{ marginBottom: '3rem' }}>
                      <Title level={3} style={{ 
                        marginBottom: '1.5rem', 
                        color: theme === 'dark' ? '#fff' : '#262626',
                        borderLeft: '4px solid #1677ff',
                        paddingLeft: '1rem'
                      }}>
                        {t(category.nameKey)}
                      </Title>
                      <Row
                        gutter={[24, 24]}
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
                            style={{ display: 'flex', justifyContent: 'center' }}
                          >
                            <ToolCard {...tool} />
                          </Col>
                        ))}
                      </Row>
                      {index < toolCategories.length - 1 && (
                        <Divider style={{ margin: '2rem 0' }} />
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
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', width: '100%' }}>
                      <BackToHome />
                      <tool.Component />
                    </div>
                  } 
                />
              ))}
            </Routes>
          </Content>
          <Footer style={{ textAlign: 'center', background: theme === 'dark' ? '#1f1f1f' : '#f0f2f5', width: '100%' }}>
            {t('Multi-function Toolbox')} ©{new Date().getFullYear()}
          </Footer>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
}
