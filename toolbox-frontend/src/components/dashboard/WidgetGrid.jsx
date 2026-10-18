import { useState } from 'react';
import WidgetCard from './WidgetCard';

// 尺寸 → 网格跨度（4 列网格：小 1×1 / 中 2×1 / 大 2×2）
const SPAN = {
  s: 'col-span-1 row-span-1',
  m: 'col-span-2 row-span-1',
  l: 'col-span-2 row-span-2',
};

/**
 * 小组件网格：CSS Grid 自动流式布局 + 编辑态原生 HTML5 拖拽重排（零依赖）
 * 拖拽进入目标卡片时即时换位（live reorder），网格自动补洞
 */
export default function WidgetGrid({ widgets, editing, onReorder, onRemove, onCycleSize }) {
  const [dragIndex, setDragIndex] = useState(null);

  return (
    <div className="grid grid-cols-4 gap-4 auto-rows-[180px] grid-flow-row-dense">
      {widgets.map((widget, i) => (
        <WidgetCard
          key={widget.path}
          widget={widget}
          editing={editing}
          span={SPAN[widget.size]}
          onRemove={() => onRemove(widget.path)}
          onCycleSize={() => onCycleSize(widget.path)}
          onDragStart={e => {
            setDragIndex(i);
            // Firefox 必须设置 dataTransfer 才能触发拖拽
            e.dataTransfer.setData('text/plain', '');
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragEnter={() => {
            if (dragIndex !== null && dragIndex !== i) {
              onReorder(dragIndex, i);
              setDragIndex(i);
            }
          }}
          onDragOver={e => e.preventDefault()}
          onDragEnd={() => setDragIndex(null)}
        />
      ))}
    </div>
  );
}
