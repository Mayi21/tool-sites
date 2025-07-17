import { useEffect, useState } from 'react';
import { Switch, theme as antdTheme, ConfigProvider } from 'antd';
import { BulbOutlined, MoonOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export default function ThemeSwitcher() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  useEffect(() => {
    // Apply theme to document body for custom CSS
    document.body.setAttribute('data-theme', theme);
    
    // Store user preference
    localStorage.setItem('theme', theme);
    
    // Apply theme to Ant Design components
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.style.colorScheme = 'dark';
      htmlElement.classList.add('dark');
    } else {
      htmlElement.style.colorScheme = 'light';
      htmlElement.classList.remove('dark');
    }
  }, [theme]);
  
  return (
    <Switch
      checked={theme === 'dark'}
      checkedChildren={<MoonOutlined />}
      unCheckedChildren={<BulbOutlined />}
      onChange={checked => setTheme(checked ? 'dark' : 'light')}
      title={theme === 'dark' ? t('Switch to Light Mode') : t('Switch to Dark Mode')}
    />
  );
} 