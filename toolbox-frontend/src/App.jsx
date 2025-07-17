import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import tools from './tools';
import ToolCard from './components/ToolCard';
import LanguageSwitcher from './components/LanguageSwitcher';
import ThemeSwitcher from './components/ThemeSwitcher';
import { Layout, Row, Col, ConfigProvider, theme as antdTheme } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

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
                  maxWidth: '1200px', 
                  margin: '0 auto', 
                  padding: '0 16px'
                }}>
                  <Row
                    gutter={[32, 32]}
                    justify="center"
                    style={{ width: '100%' }}
                  >
                    {tools.map(tool => (
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
                </div>
              } />
              {tools.map(tool => (
                <Route 
                  key={tool.path} 
                  path={tool.path} 
                  element={
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', width: '100%' }}>
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
