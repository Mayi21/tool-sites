import { useCallback, useLayoutEffect, useRef } from 'react';
import WidgetCard from './WidgetCard';

const FLIP_DURATION = 200;

/**
 * 小组件网格：CSS Grid 自动流式布局 + 编辑态原生 HTML5 拖拽重排（零依赖）
 * 拖拽进入目标卡片时即时换位（live reorder），网格自动补洞
 *
 * 流畅度设计：
 * - FLIP 动画：换位时卡片从旧位置平滑滑到新位置（prefers-reduced-motion 时跳过）
 * - dragIndex 用 ref 而非 state，所有事件处理器引用稳定，配合 WidgetCard 的 memo，
 *   拖拽期间只有真正换位的卡片重渲染
 * - 拖拽过程中只改内存，onDragEnd 由 onCommit 一次性落盘（避免同步 localStorage IO 掉帧）
 */
export default function WidgetGrid({ widgets, editing, onReorder, onCommit, onRemove, onCycleSize, onResize }) {
  const gridRef = useRef(null);
  const dragIndexRef = useRef(null);
  // FLIP First 快照：Element → 换位前的 DOMRect
  const flipSnapshot = useRef(null);

  const handleDragStart = useCallback((e, index) => {
    dragIndexRef.current = index;
    // Firefox 必须设置 dataTransfer 才能触发拖拽
    e.dataTransfer.setData('text/plain', '');
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnter = useCallback((index) => {
    const from = dragIndexRef.current;
    if (from === null || from === index) return;
    // FLIP First：记录换位前各卡片位置
    const rects = new Map();
    gridRef.current.querySelectorAll('[data-widget-card]').forEach(el => {
      rects.set(el, el.getBoundingClientRect());
    });
    flipSnapshot.current = rects;
    onReorder(from, index);
    dragIndexRef.current = index;
  }, [onReorder]);

  const handleDragEnd = useCallback(() => {
    if (dragIndexRef.current !== null) {
      dragIndexRef.current = null;
      onCommit();
    }
  }, [onCommit]);

  // 允许拖拽悬停/放置，HTML5 DnD 必需
  const handleDragOver = useCallback((e) => e.preventDefault(), []);

  // FLIP Invert + Play：DOM 提交后、绘制前，把位置变化的卡片从旧位平滑过渡到新位
  useLayoutEffect(() => {
    const first = flipSnapshot.current;
    if (!first) return;
    flipSnapshot.current = null;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gridRef.current.querySelectorAll('[data-widget-card]').forEach(el => {
      const prev = first.get(el);
      if (!prev) return;
      const now = el.getBoundingClientRect();
      const dx = prev.left - now.left;
      const dy = prev.top - now.top;
      if (!dx && !dy) return;
      el.style.transition = 'none';
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      // 强制回流后启动过渡
      void el.offsetWidth;
      el.style.transition = `transform ${FLIP_DURATION}ms ease`;
      el.style.transform = '';
      el.addEventListener('transitionend', () => {
        el.style.transition = '';
      }, { once: true });
    });
  }, [widgets]);

  return (
    <div ref={gridRef} className="grid grid-cols-4 gap-4 auto-rows-[180px] grid-flow-row-dense">
      {widgets.map((widget, i) => (
        <WidgetCard
          key={widget.path}
          widget={widget}
          index={i}
          editing={editing}
          onRemove={onRemove}
          onCycleSize={onCycleSize}
          onResize={onResize}
          onDragStart={handleDragStart}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  );
}
