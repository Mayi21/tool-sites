import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={e => changeLanguage(e.target.value)}
      aria-label="Language"
      className="h-9 cursor-pointer rounded-lg border border-line bg-paper px-2 text-sm text-fg outline-none transition-colors hover:bg-muted focus:border-primary"
    >
      <option value="zh">中文</option>
      <option value="en">English</option>
    </select>
  );
}
