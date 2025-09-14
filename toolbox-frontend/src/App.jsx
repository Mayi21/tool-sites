import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ThemeProvider, 
  CssBaseline, 
  Box, 
  Container, 
  Grid, 
  Typography,
  AppBar,
  Toolbar,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { lightTheme, darkTheme } from './theme/muiTheme';
import tools from './tools';
import ToolCard from './components/ToolCard';
import LanguageSwitcher from './components/LanguageSwitcher';
import ThemeSwitcher from './components/ThemeSwitcher';
import NotFound from './components/NotFound';
import BreadcrumbNav from './components/BreadcrumbNav';
import RelatedTools from './components/RelatedTools';
import ToolDetailDescription from './components/ToolDetailDescription';
import { Helmet } from 'react-helmet-async';
import Seo from './components/Seo';
import FontOptimization from './components/FontOptimization';
import IntelligentPreloader from './components/IntelligentPreloader';
import { LazyToolCard } from './components/LazyComponents';
import './utils/preloadTester'; // 自动启动性能测试
import './utils/lazyLoadingMonitor'; // 自动启动懒加载监控

const ViewQuestionnaire = lazy(() => import('./components/tools/ViewQuestionnaire'));
const ViewResults = lazy(() => import('./components/tools/ViewResults'));

// 为每个工具生成SEO关键词
const getToolKeywords = (path, t) => {
  // 首先尝试从工具配置中获取关键词
  const tool = tools.find(tool => tool.path === path);
  if (tool && tool.keywords) {
    return tool.keywords;
  }

  // 如果没有配置，使用默认关键词映射（向后兼容）
  const keywordMap = {
    '/base64': 'base64,encoder,decoder,online,free,base64 encode,base64 decode,编码,解码',
    '/json-formatter': 'json,formatter,validator,beautify,minify,json format,json validator,格式化',
    '/regex-tester': 'regex,regular expression,tester,pattern,match,正则表达式,测试',
    '/url-encoder': 'url,encoder,decoder,encode,decode,query string,网址编码,解码',
    '/timestamp': 'timestamp,unix,converter,datetime,时间戳,转换器,unix时间',
    '/color-converter': 'color,converter,hex,rgb,hsl,颜色转换器,颜色代码',
    '/hash-generator': 'hash,md5,sha1,sha256,generator,哈希,加密,生成器',
    '/jwt-decoder': 'jwt,json web token,decoder,decode,jwt解码,token解析',
    '/qr-generator': 'qr,qr code,generator,二维码,生成器,qrcode',
    '/diff': 'text,diff,comparison,compare,文本对比,差异比较',
    '/text-analyzer': 'text,analyzer,word count,character count,文本分析,字数统计',
    '/csv-converter': 'csv,json,converter,convert,数据转换,csv转json',
    '/cron-parser': 'cron,parser,expression,schedule,定时任务,cron表达式',
    '/unicode-converter': 'unicode,converter,chinese,unicode转换,中文编码'
  };

  return keywordMap[path] || 'online tools,free tools,developer tools,在线工具,开发工具';
};

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
      } else if (path === '/base64') {
        document.title = t('base64.pageTitle');
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', t('base64.pageDescription'));
        } else {
          const newMeta = document.createElement('meta');
          newMeta.name = 'description';
          newMeta.content = t('base64.pageDescription');
          document.head.appendChild(newMeta);
        }
      } else {
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

// 导航栏组件
function NavigationBar({ theme, setTheme }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  const goHome = () => navigate('/');

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box 
          onClick={goHome}
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 }
          }}
        >
          <Box
            component="img"
            src="/toolbox-icon.svg"
            alt="Toolbox Icon"
            loading="lazy" // 添加懒加载优化
            sx={{ width: 22, height: 22, mr: 1 }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              color: 'text.primary',
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {t('Multi-function Toolbox')}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LanguageSwitcher />
          <ThemeSwitcher theme={theme} setTheme={setTheme} />
        </Box>
      </Toolbar>
    </AppBar>
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

  const categorizedTools = getToolsByCategory();
  const categoriesToRender = activeCategoryKey === 'all'
    ? toolCategories
    : toolCategories.filter(c => c.key === activeCategoryKey);

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <FontOptimization />
      <BrowserRouter>
        <IntelligentPreloader />
        <DynamicTitle />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <NavigationBar theme={theme} setTheme={setTheme} />
          
          <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
            <Suspense fallback={
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
              </Box>
            }>
              <Routes>
                <Route path="/" element={
                  <>
                    <Seo
                      title="ToolifyHub - Free Online Developer Tools Collection | 多功能在线工具箱"
                      description="20+ free online developer tools: Base64 encoder, JSON formatter, regex tester, timestamp converter, URL encoder, QR generator, and more. Privacy-friendly, fast, mobile-optimized. 免费在线开发工具集合，提升编程效率。"
                      canonical="https://toolifyhub.top/"
                      keywords="online tools,developer tools,base64,json formatter,regex tester,free tools,web tools,programming tools,在线工具,开发工具,免费工具,程序员工具"
                    />
                    <Container maxWidth="lg" sx={{ px: 2 }}>
                      {/* SEO内容区块 */}
                      <Paper 
                        elevation={0}
                        sx={{ 
                          textAlign: 'center', 
                          mb: 4,
                          p: 3,
                          bgcolor: 'background.paper',
                          borderRadius: 2
                        }}
                      >
                        <Typography 
                          variant="h1" 
                          sx={{ 
                            fontSize: { xs: '1.8rem', sm: '2.5rem' },
                            fontWeight: 700,
                            mb: 2,
                            background: 'linear-gradient(45deg, #1677ff 30%, #52c41a 90%)',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          {t('Multi-function Toolbox')} - 免费在线开发工具集合
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontSize: { xs: '1rem', sm: '1.2rem' },
                            color: 'text.secondary',
                            maxWidth: '800px',
                            mx: 'auto',
                            mb: 3,
                            lineHeight: 1.6
                          }}
                        >
                          为开发者精心打造的20+款实用在线工具，涵盖编码解码、格式转换、文本处理、数据生成等核心功能。
                          完全免费，隐私安全，即开即用，助力提升开发效率。
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                          {['🚀 即时处理', '🔒 隐私安全', '📱 移动适配', '🆓 完全免费'].map((feature) => (
                            <Paper 
                              key={feature}
                              elevation={1}
                              sx={{ 
                                px: 2, 
                                py: 1, 
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                borderRadius: 3,
                                fontSize: '0.9rem'
                              }}
                            >
                              {feature}
                            </Paper>
                          ))}
                        </Box>
                      </Paper>

                      {/* 内链优化：热门工具组合推荐 */}
                      <Paper 
                        elevation={1}
                        sx={{ 
                          textAlign: 'center',
                          mb: 4,
                          p: 3,
                          bgcolor: 'background.paper',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                          🔥 热门工具组合 | Popular Tool Combinations
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                          <Link to="/base64" style={{ textDecoration: 'none' }}>
                            <Paper 
                              elevation={2}
                              sx={{ 
                                px: 2, py: 1, 
                                bgcolor: 'rgba(22, 119, 255, 0.1)',
                                color: 'primary.main',
                                borderRadius: 3,
                                fontSize: '14px',
                                fontWeight: 500,
                                '&:hover': { bgcolor: 'rgba(22, 119, 255, 0.2)' }
                              }}
                            >
                              Base64编码 → URL编码 → 哈希生成
                            </Paper>
                          </Link>
                          <Link to="/json-formatter" style={{ textDecoration: 'none' }}>
                            <Paper 
                              elevation={2}
                              sx={{ 
                                px: 2, py: 1, 
                                bgcolor: 'rgba(82, 196, 26, 0.1)',
                                color: 'secondary.main',
                                borderRadius: 3,
                                fontSize: '14px',
                                fontWeight: 500,
                                '&:hover': { bgcolor: 'rgba(82, 196, 26, 0.2)' }
                              }}
                            >
                              JSON格式化 → CSV转换 → 文本对比
                            </Paper>
                          </Link>
                          <Link to="/regex-tester" style={{ textDecoration: 'none' }}>
                            <Paper 
                              elevation={2}
                              sx={{ 
                                px: 2, py: 1, 
                                bgcolor: 'rgba(114, 46, 209, 0.1)',
                                color: '#722ed1',
                                borderRadius: 3,
                                fontSize: '14px',
                                fontWeight: 500,
                                '&:hover': { bgcolor: 'rgba(114, 46, 209, 0.2)' }
                              }}
                            >
                              正则测试 → 文本分析 → 文本处理
                            </Paper>
                          </Link>
                        </Box>
                      </Paper>

                      {/* 分类快捷标签 */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mb: 3 }}>
                        {['dev','text','data','security','design','all'].map(key => (
                          <Paper
                            key={key}
                            elevation={activeCategoryKey === key ? 2 : 1}
                            onClick={() => setActiveCategoryKey(key)}
                            sx={{
                              px: 2,
                              py: 1,
                              cursor: 'pointer',
                              bgcolor: activeCategoryKey === key ? 'primary.main' : 'background.paper',
                              color: activeCategoryKey === key ? 'primary.contrastText' : 'text.primary',
                              '&:hover': {
                                bgcolor: activeCategoryKey === key ? 'primary.dark' : 'action.hover'
                              }
                            }}
                          >
                            <Typography variant="body2" fontWeight={500}>
                              {key === 'all' ? t('All') : t(toolCategories.find(c => c.key === key)?.nameKey)}
                            </Typography>
                          </Paper>
                        ))}
                      </Box>
                      
                      {categoriesToRender.map((category, index) => (
                        <Box key={category.key} id={`category-${category.key}`} sx={{ mb: 4 }}>
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              mb: 3, 
                              textAlign: 'center',
                              fontSize: { xs: '1.5rem', sm: '2rem' },
                              fontWeight: 600
                            }}
                          >
                            {t(category.nameKey)}
                          </Typography>
                          <Grid container spacing={3} justifyContent="center" alignItems="stretch">
                            {categorizedTools[category.key]?.map((tool, toolIndex) => (
                              <Grid item key={tool.path} xs={12} sm={6} md={4} lg={3}>
                                <LazyToolCard index={toolIndex}>
                                  <ToolCard
                                    path={tool.path}
                                    nameKey={tool.nameKey}
                                    descKey={tool.descKey}
                                    pageDescriptionKey={tool.pageDescriptionKey}
                                    cardDescription={tool.cardDescription}
                                  />
                                </LazyToolCard>
                              </Grid>
                            ))}
                          </Grid>
                          {index < categoriesToRender.length - 1 && (
                            <Divider sx={{ my: 4 }} />
                          )}
                        </Box>
                      ))}
                    </Container>
                  </>
                } />
                {tools.map(tool => (
                  <Route 
                    key={tool.path} 
                    path={tool.path} 
                    element={
                      <Container maxWidth="lg" sx={{ px: 2 }}>
                        <Seo
                          title={t(tool.pageTitleKey || tool.nameKey)}
                          description={t(tool.pageDescriptionKey || tool.descKey)}
                          canonical={typeof window !== 'undefined' ? window.location.href : `https://toolifyhub.top${tool.path}`}
                          keywords={getToolKeywords(tool.path, t)}
                        />
                        <BreadcrumbNav currentToolName={t(tool.nameKey)} />
                        <tool.Component />
                        <ToolDetailDescription toolPath={tool.path} />
                        <RelatedTools currentPath={tool.path} allTools={tools} />
                      </Container>
                    } 
                  />
                ))}
                
                <Route path="*" element={<NotFound />} />
                <Route path="/questionnaire/:id" element={<ViewQuestionnaire />} />
                <Route path="/questionnaire/:id/results" element={<ViewResults />} />
              </Routes>
            </Suspense>
          </Box>
          
          <Paper 
            elevation={0}
            sx={{ 
              textAlign: 'center', 
              bgcolor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
              py: 3
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t('Multi-function Toolbox')} ©{new Date().getFullYear()}
            </Typography>
          </Paper>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;