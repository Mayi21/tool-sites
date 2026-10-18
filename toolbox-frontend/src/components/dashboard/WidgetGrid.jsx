import { useState } from 'react';
import WidgetCard from './WidgetCard';

/**
 * 小组件网格：CSS Grid 自动流式布局 + 编辑态原生 HTML5 拖拽重排（零依赖）
 * 拖拽进入目标卡片时即时换位（live reorder），网格自动补洞
 * 尺寸跨度映射（SPAN）在 WidgetCard 内，与其拖拽伸缩的实时预览共用
 */
export default function WidgetGrid({ widgets, editing, onReorder, onRemove, onCycleSize, onResize }) {
  const [dragIndex, setDragIndex] = useState(null);

  return (
    <div className="grid grid-cols-4 gap-4 auto-rows-[180px] grid-flow-row-dense">
      {widgets.map((widget, i) => (
        <WidgetCard
          key={widget.path}
          widget={widget}
          editing={editing}
          onRemove={() => onRemove(widget.path)}
          onCycleSize={() => onCycleSize(widget.path)}
          onResize={onResize}
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
