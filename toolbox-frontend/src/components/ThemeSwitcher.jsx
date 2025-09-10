import { useEffect, useState } from 'react';
import { 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  Box,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { 
  LightMode, 
  DarkMode, 
  Monitor
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function ThemeSwitcher({ theme, setTheme }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  useEffect(() => {
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
    handleClose();
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const getCurrentThemeIcon = () => {
    if (theme === 'dark') return <DarkMode sx={{ fontSize: 20 }} />;
    if (theme === 'light') return <LightMode sx={{ fontSize: 20 }} />;
    return <Monitor sx={{ fontSize: 20 }} />;
  };

  const themeOptions = [
    {
      key: 'light',
      icon: <LightMode sx={{ fontSize: 18 }} />,
      label: t('Light Mode')
    },
    {
      key: 'dark', 
      icon: <DarkMode sx={{ fontSize: 18 }} />,
      label: t('Dark Mode')
    },
    {
      key: 'system',
      icon: <Monitor sx={{ fontSize: 18 }} />,
      label: t('System')
    }
  ];
  
  return (
    <Box>
      <Tooltip title={t('Theme Settings')} placement="bottom">
        <IconButton
          onClick={handleClick}
          sx={{
            width: 40,
            height: 40,
            color: 'text.primary',
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            boxShadow: 1,
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={20} />
          ) : (
            getCurrentThemeIcon()
          )}
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'theme-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {themeOptions.map((option) => (
          <MenuItem
            key={option.key}
            selected={theme === option.key}
            onClick={() => handleThemeChange(option.key)}
          >
            <ListItemIcon>
              {option.icon}
            </ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
} 