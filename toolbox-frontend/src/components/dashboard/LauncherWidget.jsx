import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * 启动卡片：无迷你变体的工具固定后的兜底展示（icon + 名称 + 描述，点击进入完整工具页）
 */
export default function LauncherWidget({ tool }) {
  const { t } = useTranslation();
  const Icon = tool.icon;

  return (
    <Link
      to={tool.path}
      className="flex h-full flex-col items-start gap-2 rounded-lg no-underline transition-opacity hover:opacity-80"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={20} />
      </span>
      <span className="text-sm font-medium text-fg">{t(tool.nameKey)}</span>
      <span className="line-clamp-2 text-xs text-fg-secondary">{t(tool.descKey)}</span>
    </Link>
  );
}
