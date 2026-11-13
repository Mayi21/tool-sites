// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WidgetCard from './WidgetCard';

/** 1440 视口下的网格宽度，与浏览器实测一致 */
const GRID_WIDTH = 1136;

const noop = () => {};

const renderCard = (props = {}) => {
  const base = {
    widget: { path: '/base64', size: 'm' },
    index: 0,
    editing: false,
    onRemove: noop,
    onCycleSize: noop,
    onResize: noop,
    onDragStart: noop,
    onDragEnter: noop,
    onDragOver: noop,
    onDragEnd: noop,
    ...props,
  };
  const utils = render(
    <MemoryRouter>
      <div data-testid="grid">
        <WidgetCard {...base} />
      </div>
    </MemoryRouter>
  );
  return utils;
};

/** 让网格容器报告真实宽度，否则 jsdom 里 getBoundingClientRect 全是 0 */
const stubGridWidth = (width = GRID_WIDTH) => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width, height: 800, top: 0, left: 0, right: width, bottom: 800, x: 0, y: 0,
  });
};

/** 拖拽手柄：按下 → 移动 (dx, dy) → 抬起 */
const resizeBy = (handle, dx, dy, { up = true } = {}) => {
  fireEvent.pointerDown(handle, { clientX: 500, clientY: 500, pointerId: 1 });
  fireEvent.pointerMove(handle, { clientX: 500 + dx, clientY: 500 + dy, pointerId: 1 });
  if (up) fireEvent.pointerUp(handle);
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('WidgetCard', () => {
  describe('渲染', () => {
    it('按尺寸套用网格跨度类', () => {
      const cases = [
        ['s', 'col-span-1 row-span-1'],
        ['m', 'col-span-2 row-span-1'],
        ['l', 'col-span-2 row-span-2'],
      ];
      for (const [size, span] of cases) {
        const { container } = renderCard({ widget: { path: '/timestamp', size } });
        expect(container.querySelector('[data-widget-card]').className).toContain(span);
        cleanup();
      }
    });

    it('编辑态：显示改名后的文字标签循环按钮与移除按钮，并暴露缩放手柄', () => {
      renderCard({ editing: true, widget: { path: '/base64', size: 'm' } });

      const cycle = screen.getByRole('button', { name: '中 → 大' });
      // 标签用可读文字而非纯图标，用户能看出"有档位"
      expect(cycle.textContent).toBe('ml');
      expect(cycle).not.toBeDisabled();

      expect(screen.getByRole('button', { name: '移除' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '调整大小' })).toBeInTheDocument();
    });

    it('非编辑态：不显示编辑控件，卡片不可拖拽', () => {
      const { container } = renderCard({ editing: false });

      expect(screen.queryByRole('button', { name: '调整大小' })).toBeNull();
      expect(screen.queryByRole('button', { name: '移除' })).toBeNull();
      expect(container.querySelector('[data-widget-card]').getAttribute('draggable')).toBe('false');
    });

    it('编辑态卡片可拖拽，编辑态内容区屏蔽交互', () => {
      const { container } = renderCard({ editing: true });
      const card = container.querySelector('[data-widget-card]');

      expect(card.getAttribute('draggable')).toBe('true');
      expect(card.querySelector('.px-3.pb-3').className).toContain('pointer-events-none');
    });

    it('没有迷你组件的工具渲染启动卡片', () => {
      const { container } = renderCard({ widget: { path: '/diff', size: 'm' } });

      // 启动卡片是链到工具页的 Link，不是迷你组件
      expect(container.querySelector('[data-widget-card] a')).not.toBeNull();
      expect(container.querySelector('[data-widget-card] .text-sm.font-medium').textContent).toBe('文本对比');
    });

    it('工具不存在时渲染空内容（不抛错）', () => {
      const { container } = renderCard({ widget: { path: '/not-exist', size: 'm' } });
      expect(container.querySelector('[data-widget-card]')).toBeNull();
    });
  });

  describe('手柄提示', () => {
    it('三档工具显示覆盖区间', () => {
      renderCard({ editing: true, widget: { path: '/timestamp', size: 'm' } });
      expect(screen.getByRole('button', { name: '调整大小' }).title).toBe('拖动右下角手柄调整大小（小 – 大）');
    });

    it('开放 s/m/l 后的 Base64 也显示小 – 大', () => {
      renderCard({ editing: true, widget: { path: '/base64', size: 'm' } });
      expect(screen.getByRole('button', { name: '调整大小' }).title).toBe('拖动右下角手柄调整大小（小 – 大）');
    });
  });

  describe('拖拽伸缩', () => {
    it('向左拖过半格提交更小的尺寸', () => {
      stubGridWidth();
      const onResize = vi.fn();
      renderCard({ editing: true, widget: { path: '/timestamp', size: 'm' }, onResize });

      resizeBy(screen.getByRole('button', { name: '调整大小' }), -100, 0);

      expect(onResize).toHaveBeenCalledWith('/timestamp', 's');
    });

    it('向下拖过半格提交更大的尺寸', () => {
      stubGridWidth();
      const onResize = vi.fn();
      renderCard({ editing: true, widget: { path: '/timestamp', size: 'm' }, onResize });

      resizeBy(screen.getByRole('button', { name: '调整大小' }), 0, 120);

      expect(onResize).toHaveBeenCalledWith('/timestamp', 'l');
    });

    it('拖拽距离不足时保持原尺寸，不触发提交', () => {
      stubGridWidth();
      const onResize = vi.fn();
      renderCard({ editing: true, widget: { path: '/timestamp', size: 'm' }, onResize });

      resizeBy(screen.getByRole('button', { name: '调整大小' }), -20, 20);

      expect(onResize).not.toHaveBeenCalled();
    });

    it('拖拽过程中卡片实时预览目标跨度', () => {
      stubGridWidth();
      const { container } = renderCard({ editing: true, widget: { path: '/timestamp', size: 'm' } });
      const card = container.querySelector('[data-widget-card]');
      const handle = screen.getByRole('button', { name: '调整大小' });

      fireEvent.pointerDown(handle, { clientX: 500, clientY: 500, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientX: 500, clientY: 620, pointerId: 1 });

      // m(2×1) → l(2×2)：预览阶段就变成两行，用户能看到手柄确实在拉
      expect(card.className).toContain('row-span-2');
    });

    it('pointerCancel 放弃本次调整', () => {
      stubGridWidth();
      const onResize = vi.fn();
      renderCard({ editing: true, widget: { path: '/timestamp', size: 'm' }, onResize });
      const handle = screen.getByRole('button', { name: '调整大小' });

      fireEvent.pointerDown(handle, { clientX: 500, clientY: 500, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientX: 380, clientY: 500, pointerId: 1 });
      fireEvent.pointerCancel(handle);

      expect(onResize).not.toHaveBeenCalled();
    });

    it('拖拽结束后恢复原尺寸（预览不残留）', () => {
      stubGridWidth();
      const { container } = renderCard({ editing: true, widget: { path: '/timestamp', size: 'm' } });
      const card = container.querySelector('[data-widget-card]');

      resizeBy(screen.getByRole('button', { name: '调整大小' }), 0, 120);

      // 未提供 onResize 的父级会保持 m，预览必须清掉
      expect(card.className).toContain('row-span-1');
    });

    it('向左拖把 m 缩回 s（放开 s 档后新的可达路径）', () => {
      stubGridWidth();
      const onResize = vi.fn();
      renderCard({ editing: true, widget: { path: '/password-generator', size: 'm' }, onResize });

      resizeBy(screen.getByRole('button', { name: '调整大小' }), -100, 0);

      expect(onResize).toHaveBeenCalledWith('/password-generator', 's');
    });
  });

  describe('回调', () => {
    it('点击循环按钮回传 path', () => {
      const onCycleSize = vi.fn();
      renderCard({ editing: true, widget: { path: '/json-formatter', size: 'l' }, onCycleSize });

      fireEvent.click(screen.getByRole('button', { name: '大 → 小' }));

      expect(onCycleSize).toHaveBeenCalledWith('/json-formatter');
    });

    it('点击移除回传 path', () => {
      const onRemove = vi.fn();
      renderCard({ editing: true, onRemove });

      fireEvent.click(screen.getByRole('button', { name: '移除' }));

      expect(onRemove).toHaveBeenCalledWith('/base64');
    });

    it('拖拽开始回传 index，拖入时回传目标 index', () => {
      const onDragStart = vi.fn();
      const onDragEnter = vi.fn();
      const { container } = renderCard({ editing: true, index: 3, onDragStart, onDragEnter });
      const card = container.querySelector('[data-widget-card]');

      fireEvent.dragStart(card, { dataTransfer: { setData: noop, effectAllowed: '' } });
      fireEvent.dragEnter(card);

      expect(onDragStart).toHaveBeenCalledWith(expect.anything(), 3);
      expect(onDragEnter).toHaveBeenCalledWith(3);
    });
  });
});