import { createTheme } from '@mui/material/styles';

// 创建亮色主题
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1677ff',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#52c41a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#262626',
      secondary: '#595959',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
  },
  components: {
    // 全局CSS基础样式配置
    MuiCssBaseline: {
      styleOverrides: `
        /* 字体显示优化 - 确保所有字体使用swap策略 */
        @font-face {
          font-family: 'SystemOptimized';
          src: local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI'), local('Roboto'), local('Helvetica Neue'), local('Arial');
          font-display: swap;
          font-weight: 100 900;
          font-stretch: 75% 125%;
        }

        /* 全局字体渲染优化 */
        * {
          font-display: swap !important;
        }

        /* Web字体加载优化 */
        body {
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `,
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

// 创建暗色主题
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1890ff',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#52c41a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#141414',
      paper: '#1f1f1f',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a6a6a6',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
  },
  components: {
    // 全局CSS基础样式配置
    MuiCssBaseline: {
      styleOverrides: `
        /* 字体显示优化 - 确保所有字体使用swap策略 */
        @font-face {
          font-family: 'SystemOptimized';
          src: local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI'), local('Roboto'), local('Helvetica Neue'), local('Arial');
          font-display: swap;
          font-weight: 100 900;
          font-stretch: 75% 125%;
        }

        /* 全局字体渲染优化 */
        * {
          font-display: swap !important;
        }

        /* Web字体加载优化 */
        body {
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `,
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#1f1f1f',
          border: '1px solid #303030',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});