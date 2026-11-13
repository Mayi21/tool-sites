/**
 * 小组件尺寸换算：网格常量、尺寸吸附与提示文案（纯函数，便于单测）
 */

// 与 WidgetGrid 的网格类对应：grid-cols-4 gap-4 auto-rows-[180px]
export const GRID_COLS = 4;
export const GAP = 16;
export const ROW_H = 180;

// 尺寸 → 网格跨度（4 列网格：小 1×1 / 中 2×1 / 大 2×2 / 超宽 4×1）
//
// 超宽档只加宽不加高：横向拉满一整行，纵向仍是中档高度。内容也相应改成左右并排
// （JSON / Base64 输入与结果各占一半；哈希三条结果各占一整行），
// 因此多出来的宽度全被内容用掉，不会出现"拉宽后右侧一片空白"。
export const SPAN = {
  s: 'col-span-1 row-span-1',
  m: 'col-span-2 row-span-1',
  l: 'col-span-2 row-span-2',
  xl: 'col-span-4 row-span-1',
};

// 尺寸 → 占用的 [列数, 行数]
export const SIZE_CELLS = {
  s: [1, 1],
  m: [2, 1],
  l: [2, 2],
  xl: [4, 1],
};

// 拖拽吸附系数：换算跨度时把 (格宽+间距) 缩小到 60%，等于放宽翻档判定
// 翻档阈值 ≈ 0.5 × 0.6 × (格宽+间距)：中档卡横向约 86px、纵向约 59px（原值 1 需 144px / 98px）
export const SNAP_EASING = 0.6;

export const ALL_SIZES = ['s', 'm', 'l'];
// 需要整行宽度的工具在此之上多一档 xl（4×1）
export const WIDE_SIZES = ['s', 'm', 'l', 'xl'];

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/** 指针位移 → 期望的列数/行数（不受网格回流影响） */
export const spansFromDelta = (cols, rows, dx, dy, cellW) => ({
  cols: clamp(cols + Math.round(dx / ((cellW + GAP) * SNAP_EASING)), 1, GRID_COLS),
  rows: clamp(rows + Math.round(dy / ((ROW_H + GAP) * SNAP_EASING)), 1, 2),
});

/**
 * 期望的列数/行数 → 该工具可用尺寸中最近的一档（如仅 m/l 的工具，拖向 1×1 会吸附回 m）
 *
 * 平局规则：拖到 3 列时 m(2 列) 与 xl(4 列) 距离相同，此时偏向更宽的那档。
 * 向右拖是「我要放大」的主动操作，偏向大档才有即时反馈；若偏向小档，
 * 拉满 4 列还得再多拖整整一格才有反应。
 * 限定条件是「两者行数都等于目标行数」，否则 1×2 的平局（s 与 l）也会被推向 l，
 * 让 s 档向下拖时莫名跳到大档。
 */
export const snapSize = (cols, rows, sizes) => {
  const distance = (size) => {
    const [c, r] = SIZE_CELLS[size];
    return { d: Math.abs(c - cols) + Math.abs(r - rows), cols: c, rows: r };
  };
  return sizes.reduce((best, size) => {
    if (size === best) return best;
    const cand = distance(size);
    const cur = distance(best);
    if (cand.d < cur.d) return size;
    const flatTie = cand.d === cur.d && cand.rows === rows && cur.rows === rows;
    return flatTie && cand.cols > cur.cols ? size : best;
  }, sizes[0]);
};

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

/** 尺寸 → 译名字（按钮与提示共用，避免两处手写映射走样） */
export const sizeLabel = (size, t) => ({
  s: t('Small'),
  m: t('Medium'),
  l: t('Large'),
  xl: t('Extra wide'),
}[size]);

/** 缩放手柄的提示文案：区间（如 小 – 超宽）或「固定尺寸」 */
export const resizeHint = (sizes, t) => {
  if (!canCycle(sizes)) return t('Fixed size');
  const { min, max } = sizeRange(sizes);
  return t('Resize hint', { from: sizeLabel(min, t), to: sizeLabel(max, t) });
};