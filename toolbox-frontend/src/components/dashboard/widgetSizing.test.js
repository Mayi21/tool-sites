import { describe, it, expect } from 'vitest';
import {
  GRID_COLS, GAP, ROW_H, SNAP_EASING, SIZE_CELLS, SPAN, ALL_SIZES, WIDE_SIZES,
  clamp, spansFromDelta, snapSize, nextSize, canCycle, sizeRange, sizeLabel, resizeHint,
} from './widgetSizing';

/** 1440 视口下的实际格宽：视口 1440 − 侧栏 240 − 主区左右 padding 64 = 网格 1136 */
const GRID_W = 1136;
const CELL_W = (GRID_W - (GRID_COLS - 1) * GAP) / GRID_COLS;
/** 横向翻一档需要的最小位移（Math.round 的临界点） */
const COL_THRESHOLD = (CELL_W + GAP) * SNAP_EASING * 0.5;
/** 横向翻满一整档的位移（Math.round 从 0 到 1 的起点） */
const COL_STEP = (CELL_W + GAP) * SNAP_EASING;
const ROW_THRESHOLD = (ROW_H + GAP) * SNAP_EASING * 0.5;

describe('widgetSizing', () => {
  describe('常量', () => {
    it('网格常量与 WidgetGrid 的 grid-cols-4 gap-4 auto-rows-[180px] 保持一致', () => {
      expect(GRID_COLS).toBe(4);
      expect(GAP).toBe(16);
      expect(ROW_H).toBe(180);
    });

    it('每个尺寸都有跨度类与占用格数', () => {
      for (const size of WIDE_SIZES) {
        expect(SPAN[size]).toMatch(/^col-span-\d row-span-\d$/);
        expect(SIZE_CELLS[size]).toHaveLength(2);
      }
    });

    it('占用格数与跨度类一致（防止改一处忘另一处）', () => {
      for (const size of WIDE_SIZES) {
        const [cols, rows] = SIZE_CELLS[size];
        expect(SPAN[size]).toBe(`col-span-${cols} row-span-${rows}`);
      }
    });

    it('超宽档横向拉满 4 列且不加高（只加宽不加高，才不会有空白）', () => {
      expect(SIZE_CELLS.xl).toEqual([GRID_COLS, 1]);
      expect(SIZE_CELLS.xl[1]).toBe(SIZE_CELLS.m[1]);
      expect(WIDE_SIZES).toEqual([...ALL_SIZES, 'xl']);
    });
  });

  describe('clamp', () => {
    it('限制在上下界内', () => {
      expect(clamp(0, 1, 2)).toBe(1);
      expect(clamp(3, 1, 2)).toBe(2);
      expect(clamp(2, 1, 2)).toBe(2);
      expect(clamp(1.4, 1, 2)).toBe(1.4);
    });
  });

  describe('spansFromDelta', () => {
    it('位移未超过阈值时保持原跨度', () => {
      expect(spansFromDelta(2, 1, -(COL_THRESHOLD - 1), 0, CELL_W)).toEqual({ cols: 2, rows: 1 });
      expect(spansFromDelta(2, 1, COL_THRESHOLD - 1, 0, CELL_W)).toEqual({ cols: 2, rows: 1 });
    });

    it('向左拖过阈值缩一列', () => {
      expect(spansFromDelta(2, 1, -(COL_THRESHOLD + 1), 0, CELL_W)).toEqual({ cols: 1, rows: 1 });
    });

    it('向右拖过阈值扩列，最多到 4 列', () => {
      // Math.round 的临界点：位移达到 COL_STEP 的一半即可进一档
      expect(spansFromDelta(1, 1, COL_THRESHOLD + 1, 0, CELL_W)).toEqual({ cols: 2, rows: 1 });
      expect(spansFromDelta(2, 1, COL_THRESHOLD + 1, 0, CELL_W)).toEqual({ cols: 3, rows: 1 });
      // 从 2 列横向拖满两档 → 4 列
      expect(spansFromDelta(2, 1, 2 * COL_STEP, 0, CELL_W)).toEqual({ cols: 4, rows: 1 });
    });

    it('超过 4 列时夹到网格宽度', () => {
      expect(spansFromDelta(3, 1, COL_STEP, 0, CELL_W)).toEqual({ cols: 4, rows: 1 });
      expect(spansFromDelta(4, 1, COL_STEP, 0, CELL_W)).toEqual({ cols: 4, rows: 1 });
    });

    it('向下拖过阈值加一行', () => {
      expect(spansFromDelta(2, 1, 0, ROW_THRESHOLD + 1, CELL_W)).toEqual({ cols: 2, rows: 2 });
    });

    it('向上拖过阈值减一行', () => {
      expect(spansFromDelta(2, 2, 0, -(ROW_THRESHOLD + 1), CELL_W)).toEqual({ cols: 2, rows: 1 });
    });

    it('始终夹在 1..4 列、1..2 行之间（拖得再远也不会越界）', () => {
      expect(spansFromDelta(2, 2, 5000, 5000, CELL_W)).toEqual({ cols: 4, rows: 2 });
      expect(spansFromDelta(1, 1, -5000, -5000, CELL_W)).toEqual({ cols: 1, rows: 1 });
    });

    it('阈值比原来的半格更宽松（SNAP_EASING 生效）', () => {
      const halfCell = (CELL_W + GAP) / 2;
      expect(SNAP_EASING).toBeLessThan(1);
      expect(COL_THRESHOLD).toBeLessThan(halfCell);
      // 老阈值（系数 1）需要 144px，现在 90px 就够
      expect(COL_THRESHOLD).toBeCloseTo(86.4, 1);
      expect(halfCell).toBe(144);
      expect(spansFromDelta(2, 1, -90, 0, CELL_W).cols).toBe(1);
      // 但在旧逻辑下 90px 不够
      expect(Math.round(90 / (CELL_W + GAP))).toBe(0);
    });

    it('格宽随网格容器缩放（不同视口下阈值随之变化）', () => {
      const narrow = (480 - (GRID_COLS - 1) * GAP) / GRID_COLS;
      // 窄容器（约 108px 格宽）里 40px 就够缩一列
      expect(spansFromDelta(2, 1, -40, 0, narrow).cols).toBe(1);
      // 宽容器里同样的 40px 不够
      expect(spansFromDelta(2, 1, -40, 0, CELL_W).cols).toBe(2);
    });
  });

  describe('snapSize', () => {
    it('三档齐全时吸附到最近的尺寸', () => {
      expect(snapSize(1, 1, ALL_SIZES)).toBe('s');
      expect(snapSize(2, 1, ALL_SIZES)).toBe('m');
      expect(snapSize(2, 2, ALL_SIZES)).toBe('l');
    });

    it('仅开放 m/l 时，拖向 1×1 会吸附回 m（兼容只有 m/l 的工具）', () => {
      expect(snapSize(1, 1, ['m', 'l'])).toBe('m');
      expect(snapSize(2, 1, ['m', 'l'])).toBe('m');
      expect(snapSize(2, 2, ['m', 'l'])).toBe('l');
    });

    it('仅开放 s/m 时，拖向 2×2 会吸附回 m', () => {
      expect(snapSize(2, 2, ['s', 'm'])).toBe('m');
      expect(snapSize(1, 1, ['s', 'm'])).toBe('s');
    });

    it('只有一档时永远返回该档', () => {
      expect(snapSize(2, 2, ['m'])).toBe('m');
    });

    it('开放超宽档后拖到 3~4 列吸附到 xl', () => {
      expect(snapSize(4, 1, WIDE_SIZES)).toBe('xl');
      expect(snapSize(3, 1, WIDE_SIZES)).toBe('xl');
    });

    it('平局偏向更宽的档，但仅限行数相符的情况', () => {
      // 3×1：m(|2-3|+|1-1|=1) 与 xl(|4-3|+|1-1|=1) 平局 → 取更宽的 xl
      expect(snapSize(3, 1, WIDE_SIZES)).toBe('xl');
      // 1×2：s(0+1=1) 与 l(1+0=1) 平局，但行数分别对应 1 与 2，不应偏向 l
      expect(snapSize(1, 2, ALL_SIZES)).toBe('s');
    });

    it('未开放的 xl 不会被选中（普通工具拖到 4 列最多吸附到 m）', () => {
      expect(snapSize(4, 1, ALL_SIZES)).toBe('m');
    });
  });

  describe('nextSize', () => {
    it('按可用尺寸轮转', () => {
      expect(nextSize(ALL_SIZES, 's')).toBe('m');
      expect(nextSize(ALL_SIZES, 'm')).toBe('l');
      expect(nextSize(ALL_SIZES, 'l')).toBe('s');
    });

    it('只在可用尺寸内轮转（仅 m/l 的工具 m → l → m）', () => {
      expect(nextSize(['m', 'l'], 'm')).toBe('l');
      expect(nextSize(['m', 'l'], 'l')).toBe('m');
    });

    it('开放超宽档的工具 l → xl → s', () => {
      expect(nextSize(WIDE_SIZES, 'l')).toBe('xl');
      expect(nextSize(WIDE_SIZES, 'xl')).toBe('s');
    });

    it('当前尺寸不在列表里时取第一档', () => {
      expect(nextSize(['s', 'm'], 'l')).toBe('s');
    });
  });

  describe('canCycle', () => {
    it('多于一档时可循环', () => {
      expect(canCycle(['s', 'm'])).toBe(true);
    });

    it('只有一档时不可循环', () => {
      expect(canCycle(['m'])).toBe(false);
    });
  });

  describe('sizeRange', () => {
    it('按占用格数取最小/最大（小 2 格、中 3 格、大 4 格）', () => {
      expect(sizeRange(ALL_SIZES)).toEqual({ min: 's', max: 'l' });
    });

    it('仅 m/l 时区间为中 – 大', () => {
      expect(sizeRange(['m', 'l'])).toEqual({ min: 'm', max: 'l' });
    });

    it('不依赖数组顺序（可用尺寸被打乱也能正确取端点）', () => {
      expect(sizeRange(['l', 's', 'm'])).toEqual({ min: 's', max: 'l' });
    });

    it('开放超宽档后区间为 小 – 超宽', () => {
      expect(sizeRange(WIDE_SIZES)).toEqual({ min: 's', max: 'xl' });
    });
  });

  describe('sizeLabel', () => {
    const t = (key) => ({ Small: '小', Medium: '中', Large: '大', 'Extra wide': '超宽' })[key];

    it('四档都有译名', () => {
      expect(WIDE_SIZES.map(size => sizeLabel(size, t))).toEqual(['小', '中', '大', '超宽']);
    });
  });

  describe('resizeHint', () => {
    // 用真实的 zh 文案，避免测试断言自己编的假词
    const t = (key, vars) => ({
      Small: '小',
      Medium: '中',
      Large: '大',
      'Extra wide': '超宽',
      'Fixed size': '固定尺寸',
      'Resize hint': `拖动右下角手柄调整大小（${vars?.from} – ${vars?.to}）`,
    })[key];

    it('三档工具显示 小 – 大', () => {
      expect(resizeHint(ALL_SIZES, t)).toBe('拖动右下角手柄调整大小（小 – 大）');
    });

    it('开放超宽档的工具显示 小 – 超宽', () => {
      expect(resizeHint(WIDE_SIZES, t)).toBe('拖动右下角手柄调整大小（小 – 超宽）');
    });

    it('仅 m/l 的工具显示 中 – 大', () => {
      expect(resizeHint(['m', 'l'], t)).toBe('拖动右下角手柄调整大小（中 – 大）');
    });

    it('只有一档时提示固定尺寸', () => {
      expect(resizeHint(['m'], t)).toBe('固定尺寸');
    });
  });
});