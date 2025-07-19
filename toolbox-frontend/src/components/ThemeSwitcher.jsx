import { useEffect, useState } from 'react';
import { Button, Tooltip, Dropdown, Space } from 'antd';
import { BulbOutlined, MoonOutlined, DesktopOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export default function ThemeSwitcher({ theme, setTheme }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.style.colorScheme = 'dark';
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
    } else if (theme === 'light') {
      htmlElement.style.colorScheme = 'light';
      htmlElement.classList.add('light');
      htmlElement.classList.remove('dark');
    } else if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      htmlElement.style.colorScheme = systemTheme;
      htmlElement.classList.add(systemTheme);
      htmlElement.classList.remove(systemTheme === 'dark' ? 'light' : 'dark');
    }
  }, [theme]);

  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        const htmlElement = document.documentElement;
        const newTheme = e.matches ? 'dark' : 'light';
        htmlElement.style.colorScheme = newTheme;
        htmlElement.classList.remove('dark', 'light');
        htmlElement.classList.add(newTheme);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setIsLoading(true);
    setTheme(newTheme);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const getCurrentThemeIcon = () => {
    if (theme === 'dark') return <MoonOutlined />;
    if (theme === 'light') return <BulbOutlined />;
    return <DesktopOutlined />;
  };

  const themeOptions = [
    {
      key: 'light',
      label: (
        <Space>
          <BulbOutlined />
          {t('Light Mode')}
        </Space>
      ),
      icon: <BulbOutlined />
    },
    {
      key: 'dark',
      label: (
        <Space>
          <MoonOutlined />
          {t('Dark Mode')}
        </Space>
      ),
      icon: <MoonOutlined />
    },
    {
      key: 'system',
      label: (
        <Space>
          <DesktopOutlined />
          {t('System')}
        </Space>
      ),
      icon: <DesktopOutlined />
    }
  ];
  
  return (
    <Dropdown
      menu={{
        items: themeOptions,
        selectedKeys: [theme],
        onClick: ({ key }) => handleThemeChange(key)
      }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Tooltip 
        title={t('Theme Settings')}
        placement="bottom"
      >
        <Button
          type="text"
          icon={getCurrentThemeIcon()}
          loading={isLoading}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)'
          }}
          className="theme-switcher-btn"
        />
      </Tooltip>
    </Dropdown>
  );
} 