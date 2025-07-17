import { useTranslation } from 'react-i18next';
import { Select } from 'antd';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <Select
      value={i18n.language}
      onChange={v => i18n.changeLanguage(v)}
      style={{ width: 100 }}
      options={[
        { value: 'zh', label: '中文' },
        { value: 'en', label: 'English' },
      ]}
    />
  );
} 