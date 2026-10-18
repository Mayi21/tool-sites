import { memo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Expand } from 'lucide-react';
import tools from '../../tools';
import { Card, IconButton, Tooltip } from '../ui';
import { widgetRegistry } from './widgetRegistry';
import LauncherWidget from './LauncherWidget';

// 尺寸 → 网格跨度（4 列网格：小 1×1 / 中 2×1 / 大 2×2）
const SPAN = {
  s: 'col-span-1 row-span-1',
  m: 'col-span-2 row-span-1',
  l: 'col-span-2 row-span-2',
};

// 与 WidgetGrid 的网格类对应：grid-cols-4 gap-4 auto-rows-[180px]
const GRID_COLS = 4;
const GAP = 16;
const ROW_H = 180;
// 尺寸 → 占用的 [列数, 行数]
const SIZE_CELLS = { s: [1, 1], m: [2, 1], l: [2, 2] };

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// 期望的列数/行数 → 该工具可用尺寸中最近的一档（如 Base64 仅 m/l，拖向 1×1 吸附回 m）
const snapSize = (cols, rows, sizes) =>
  sizes.reduce((best, size) => {
    const [c, r] = SIZE_CELLS[size];
    const dist = Math.abs(c - cols) + Math.abs(r - rows);
    const [bc, br] = SIZE_CELLS[best];
    return dist < Math.abs(bc - cols) + Math.abs(br - rows) ? size : best;
  }, sizes[0]);

/**
 * 小组件外壳：头部（icon + 名称）+ 迷你组件或启动卡片
 * 编辑态：整卡可拖拽重排、右下角手柄拖拽伸缩（吸附三档）、内容禁止交互
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

  // 尺寸循环按钮的提示：下一档尺寸的名称
  const sizeLabels = { s: t('Small'), m: t('Medium'), l: t('Large') };
  const sizes = entry?.availableSizes ?? ['s', 'm', 'l'];
  const nextSize = sizeLabels[sizes[(sizes.indexOf(widget.size) + 1) % sizes.length]];

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
    e.currentTarget.setPointerCapture(e.pointerId);
    setResizing(true);
  };

  const onHandlePointerMove = (e) => {
    if (!resizeRef.current) return;
    const { x, y, cols, rows, cellW } = resizeRef.current;
    const nextCols = clamp(cols + Math.round((e.clientX - x) / (cellW + GAP)), 1, 2);
    const nextRows = clamp(rows + Math.round((e.clientY - y) / (ROW_H + GAP)), 1, 2);
    setPreviewSize(snapSize(nextCols, nextRows, sizes));
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
            <Tooltip title={nextSize}>
              <IconButton onClick={() => onCycleSize(widget.path)} className="p-1.5" aria-label={t('Small') + '/' + t('Medium') + '/' + t('Large')}>
                <Expand size={14} />
              </IconButton>
            </Tooltip>
            <IconButton onClick={() => onRemove(widget.path)} className="p-1.5 hover:text-danger" aria-label={t('Remove Widget')}>
              <X size={14} />
            </IconButton>
          </span>
        )}
      </div>
      <div className={`min-h-0 flex-1 px-3 pb-3 ${editing ? 'pointer-events-none' : ''}`}>
        {Widget ? <Widget size={previewSize ?? widget.size} /> : <LauncherWidget tool={tool} />}
      </div>
      {editing && (
        <button
          type="button"
          aria-label={t('Resize Widget')}
          title={t('Resize Widget')}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={() => endResize(true)}
          onPointerCancel={() => endResize(false)}
          onDragStart={e => e.preventDefault()}
          className="absolute bottom-0 right-0 cursor-nwse-resize touch-none rounded-tl-md p-1.5 transition-colors hover:bg-muted"
        >
          <span
            aria-hidden="true"
            className="block h-2.5 w-2.5 opacity-50"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, currentColor 0, currentColor 1.5px, transparent 1.5px, transparent 4px)' }}
          />
        </button>
      )}
    </Card>
  );
}

export default memo(WidgetCard);
