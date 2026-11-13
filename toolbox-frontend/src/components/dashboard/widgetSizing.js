/**
 * 小组件尺寸换算：网格常量、尺寸吸附与提示文案（纯函数，便于单测）
 */

// 与 WidgetGrid 的网格类对应：grid-cols-4 gap-4 auto-rows-[180px]
export const GRID_COLS = 4;
export const GAP = 16;
export const ROW_H = 180;

// 尺寸 → 网格跨度（4 列网格：小 1×1 / 中 2×1 / 大 2×2）
export const SPAN = {
  s: 'col-span-1 row-span-1',
  m: 'col-span-2 row-span-1',
  l: 'col-span-2 row-span-2',
};

// 尺寸 → 占用的 [列数, 行数]
export const SIZE_CELLS = { s: [1, 1], m: [2, 1], l: [2, 2] };

// 拖拽吸附系数：换算跨度时把 (格宽+间距) 缩小到 60%，等于放宽翻档判定
// 翻档阈值 ≈ 0.5 × 0.6 × (格宽+间距)：中档卡横向约 86px、纵向约 59px（原值 1 需 144px / 98px）
export const SNAP_EASING = 0.6;

export const ALL_SIZES = ['s', 'm', 'l'];

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/** 指针位移 → 期望的列数/行数（不受网格回流影响） */
export const spansFromDelta = (cols, rows, dx, dy, cellW) => ({
  cols: clamp(cols + Math.round(dx / ((cellW + GAP) * SNAP_EASING)), 1, 2),
  rows: clamp(rows + Math.round(dy / ((ROW_H + GAP) * SNAP_EASING)), 1, 2),
});

/** 期望的列数/行数 → 该工具可用尺寸中最近的一档（如仅 m/l 的工具，拖向 1×1 会吸附回 m） */
export const snapSize = (cols, rows, sizes) =>
  sizes.reduce((best, size) => {
    const [c, r] = SIZE_CELLS[size];
    const [bc, br] = SIZE_CELLS[best];
    return Math.abs(c - cols) + Math.abs(r - rows) < Math.abs(bc - cols) + Math.abs(br - rows) ? size : best;
  }, sizes[0]);

/** 尺寸循环按钮的目标档位（可用尺寸内轮转） */
export const nextSize = (sizes, current) => sizes[(sizes.indexOf(current) + 1) % sizes.length];

/** 尺寸循环按钮是否可用（可用尺寸只有一档时无意义） */
export const canCycle = (sizes) => sizes.length > 1;

/** 该工具可用尺寸覆盖的区间端点（按占用格数比较） */
export const sizeRange = (sizes) => {
  const cells = (size) => SIZE_CELLS[size][0] + SIZE_CELLS[size][1];
  return {
    min: sizes.reduce((a, b) => (cells(b) < cells(a) ? b : a), sizes[0]),
    max: sizes.reduce((a, b) => (cells(b) > cells(a) ? b : a), sizes[0]),
  };
};

/** 缩放手柄的提示文案：区间（如 小 – 大）或「固定尺寸」 */
export const resizeHint = (sizes, t) => {
  if (!canCycle(sizes)) return t('Fixed size');
  const { min, max } = sizeRange(sizes);
  const label = { s: t('Small'), m: t('Medium'), l: t('Large') };
  return t('Resize hint', { from: label[min], to: label[max] });
};