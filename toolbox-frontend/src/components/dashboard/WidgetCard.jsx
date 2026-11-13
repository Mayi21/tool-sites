import { memo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, X } from 'lucide-react';
import tools from '../../tools';
import { Card, IconButton, Tooltip } from '../ui';
import { widgetRegistry } from './widgetRegistry';
import LauncherWidget from './LauncherWidget';
import {
  ALL_SIZES, GRID_COLS, GAP, SIZE_CELLS, SPAN,
  canCycle, nextSize, resizeHint, snapSize, spansFromDelta,
} from './widgetSizing';

/**
 * 小组件外壳：头部（icon + 名称）+ 迷你组件或启动卡片
 * 编辑态：整卡可拖拽重排、右下角手柄拖拽伸缩（吸附可用尺寸档位）、内容禁止交互
 * memo 化：props 均为稳定引用（回调传 path/index），拖拽换位时只有相关卡片重渲染
 */
function WidgetCard({ widget, index, editing, onRemove, onCycleSize, onResize, onDragStart, onDragEnter, onDragOver, onDragEnd }) {
  const { t } = useTranslation();
  const [resizing, setResizing] = useState(false);
  const [previewSize, setPreviewSize] = useState(null);
  // 伸缩起点：{ x, y, cols, rows, cellW }（指针增量换算跨度，不受网格回流影响）
  const resizeRef = useRef(null);

  const tool = tools.find(item => item.path === widget.path);
  if (!tool) return null;

  const entry = widgetRegistry[widget.path];
  const Widget = entry?.component;
  const Icon = tool.icon;

  const sizeLabels = { s: t('Small'), m: t('Medium'), l: t('Large') };
  const sizes = entry?.availableSizes ?? ALL_SIZES;
  // 尺寸循环按钮的提示：下一档尺寸的名称
  const cycleTarget = nextSize(sizes, widget.size);
  const cycleDisabled = !canCycle(sizes);

  // 拖拽伸缩：Pointer Events（HTML5 DnD 做不了 resize），指针增量 → 期望跨度 → 吸附可用尺寸
  const onHandlePointerDown = (e) => {
    const gridRect = e.currentTarget.closest('[data-widget-card]').parentElement.getBoundingClientRect();
    resizeRef.current = {
      x: e.clientX,
      y: e.clientY,
      cols: SIZE_CELLS[widget.size][0],
      rows: SIZE_CELLS[widget.size][1],
      cellW: (gridRect.width - (GRID_COLS - 1) * GAP) / GRID_COLS,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setResizing(true);
  };

  const onHandlePointerMove = (e) => {
    if (!resizeRef.current) return;
    const { x, y, cols, rows, cellW } = resizeRef.current;
    const next = spansFromDelta(cols, rows, e.clientX - x, e.clientY - y, cellW);
    setPreviewSize(snapSize(next.cols, next.rows, sizes));
  };

  const endResize = (commit) => {
    if (!resizeRef.current) return;
    resizeRef.current = null;
    setResizing(false);
    if (commit && previewSize && previewSize !== widget.size) onResize(widget.path, previewSize);
    setPreviewSize(null);
  };

  return (
    <Card
      data-widget-card
      className={`relative flex h-full flex-col overflow-hidden ${SPAN[previewSize ?? widget.size]} ${
        editing ? 'cursor-grab select-none ring-2 ring-primary/40 active:cursor-grabbing' : ''
      }`}
      draggable={editing && !resizing}
      onDragStart={editing ? e => onDragStart(e, index) : undefined}
      onDragEnter={editing ? () => onDragEnter(index) : undefined}
      onDragOver={editing ? onDragOver : undefined}
      onDragEnd={editing ? onDragEnd : undefined}
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
            <Tooltip title={`${sizeLabels[widget.size]} → ${sizeLabels[cycleTarget]}`}>
              <IconButton
                onClick={() => onCycleSize(widget.path)}
                className="p-1.5"
                // 可用尺寸只有一档的工具，循环按钮无意义，直接禁用
                disabled={cycleDisabled}
                aria-label={`${sizeLabels[widget.size]} → ${sizeLabels[cycleTarget]}`}
              >
                <span className="flex items-center gap-0.5">
                  <span className="text-[10px] font-semibold uppercase leading-none">{widget.size}</span>
                  <ArrowRight size={11} className="opacity-60" />
                  <span className="text-[10px] font-semibold uppercase leading-none">{cycleTarget}</span>
                </span>
              </IconButton>
            </Tooltip>
            <IconButton onClick={() => onRemove(widget.path)} className="p-1.5 hover:text-danger" aria-label={t('Remove Widget')}>
              <X size={14} />
            </IconButton>
          </span>
        )}
      </div>
      <div className={`min-h-0 flex-1 px-3 pb-3 ${editing ? 'pointer-events-none' : ''} [&_textarea]:resize-none`}>
        {Widget ? <Widget size={previewSize ?? widget.size} /> : <LauncherWidget tool={tool} />}
      </div>
      {editing && (
        <button
          type="button"
          aria-label={t('Resize Widget')}
          title={resizeHint(sizes, t)}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={() => endResize(true)}
          onPointerCancel={() => endResize(false)}
          onDragStart={e => e.preventDefault()}
          // 热区 40×40 抵住卡片右下角（视觉图案仍是 12px 斜纹），避免"点了没反应"；
          // 不加 hover 背景块，否则会压住内容区右下角（如复制按钮）
          className="group/handle absolute bottom-0 right-0 flex h-10 w-10 cursor-nwse-resize touch-none items-end justify-end"
        >
          <span
            aria-hidden="true"
            className="m-1.5 block h-3 w-3 text-fg-secondary opacity-45 transition-all group-hover/handle:text-primary group-hover/handle:opacity-100"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, currentColor 0, currentColor 2px, transparent 2px, transparent 5px)' }}
          />
        </button>
      )}
    </Card>
  );
}

export default memo(WidgetCard);