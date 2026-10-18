import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Expand } from 'lucide-react';
import tools from '../../tools';
import { Card, IconButton, Tooltip } from '../ui';
import { widgetRegistry } from './widgetRegistry';
import LauncherWidget from './LauncherWidget';

/**
 * 小组件外壳：头部（icon + 名称）+ 迷你组件或启动卡片
 * 编辑态：整卡可拖拽、显示尺寸切换/移除按钮、内容禁止交互
 */
export default function WidgetCard({ widget, editing, span, onRemove, onCycleSize, ...dragProps }) {
  const { t } = useTranslation();
  const tool = tools.find(item => item.path === widget.path);
  if (!tool) return null;

  const entry = widgetRegistry[widget.path];
  const Widget = entry?.component;
  const Icon = tool.icon;

  // 尺寸循环按钮的提示：下一档尺寸的名称
  const sizeLabels = { s: t('Small'), m: t('Medium'), l: t('Large') };
  const sizes = entry?.availableSizes ?? ['s', 'm', 'l'];
  const nextSize = sizeLabels[sizes[(sizes.indexOf(widget.size) + 1) % sizes.length]];

  return (
    <Card
      className={`flex h-full flex-col overflow-hidden ${span} ${
        editing ? 'cursor-grab select-none ring-2 ring-primary/40 active:cursor-grabbing' : ''
      }`}
      draggable={editing}
      {...dragProps}
    >
      <div className="flex shrink-0 items-center gap-2 px-3 pt-2.5 pb-1">
        <Icon size={15} className="shrink-0 text-primary" />
        {editing ? (
          <span className="truncate text-sm font-medium text-fg">{t(tool.nameKey)}</span>
        ) : (
          <Link
            to={tool.path}
            title={t('Open full tool')}
            className="truncate text-sm font-medium text-fg no-underline transition-colors hover:text-primary"
          >
            {t(tool.nameKey)}
          </Link>
        )}
        {editing && (
          <span className="ml-auto flex shrink-0 items-center gap-0.5">
            <Tooltip title={nextSize}>
              <IconButton onClick={onCycleSize} className="p-1.5" aria-label={t('Small') + '/' + t('Medium') + '/' + t('Large')}>
                <Expand size={14} />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onRemove} className="p-1.5 hover:text-danger" aria-label={t('Remove Widget')}>
              <X size={14} />
            </IconButton>
          </span>
        )}
      </div>
      <div className={`min-h-0 flex-1 px-3 pb-3 ${editing ? 'pointer-events-none' : ''}`}>
        {Widget ? <Widget size={widget.size} /> : <LauncherWidget tool={tool} />}
      </div>
    </Card>
  );
}
