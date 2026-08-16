import { useEffect, useState, useRef } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ThemeSwitcher({ theme, setTheme }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const html = document.documentElement;
    const resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    html.style.colorScheme = resolved;
    html.classList.toggle('dark', resolved === 'dark');
    html.classList.toggle('light', resolved === 'light');
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const html = document.documentElement;
      html.style.colorScheme = e.matches ? 'dark' : 'light';
      html.classList.toggle('dark', e.matches);
      html.classList.toggle('light', !e.matches);
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const options = [
    { key: 'light', icon: <Sun size={16} />, label: t('Light Mode') },
    { key: 'dark', icon: <Moon size={16} />, label: t('Dark Mode') },
    { key: 'system', icon: <Monitor size={16} />, label: t('System') },
  ];

  const currentIcon = theme === 'dark' ? <Moon size={18} /> : theme === 'light' ? <Sun size={18} /> : <Monitor size={18} />;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        title={t('Theme Settings')}
        onClick={() => setOpen(o => !o)}
        className="flex size-9 items-center justify-center rounded-full border border-line bg-paper text-fg shadow-sm hover:bg-muted transition-colors cursor-pointer"
      >
        {currentIcon}
      </button>
      {open && (
        <div className="absolute bottom-full right-0 z-50 mb-1 min-w-36 rounded-lg border border-line bg-paper py-1 shadow-lg">
          {options.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => { setTheme(opt.key); setOpen(false); }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
                theme === opt.key ? 'bg-primary/10 text-primary' : 'text-fg hover:bg-muted'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
