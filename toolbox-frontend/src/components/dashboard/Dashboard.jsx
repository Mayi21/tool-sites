import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, LayoutGrid, Pencil, Plus, RotateCcw } from 'lucide-react';
import { Button, Card } from '../ui';
import useDashboardWidgets from '../../hooks/useDashboardWidgets';
import WidgetGrid from './WidgetGrid';
import WidgetPicker from './WidgetPicker';

/**
 * 自定义工作台（首页）：常用工具以小组件形式固定，支持多尺寸与拖拽排序
 */
export default function Dashboard() {
  const { t } = useTranslation();
  const { widgets, addWidget, removeWidget, cycleSize, setSize, reorder, reset } = useDashboardWidgets();
  const [editing, setEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const addedPaths = new Set(widgets.map(w => w.path));

  return (
    <div className="w-full max-w-[1280px]">
      {/* 标题栏 */}
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('Dashboard')}</h1>
        <div className="ml-auto flex items-center gap-2">
          {editing && (
            <Button variant="text" size="small" onClick={reset} startIcon={<RotateCcw size={15} />}>
              {t('Reset Dashboard')}
            </Button>
          )}
          <Button variant="outlined" size="small" onClick={() => setPickerOpen(true)} startIcon={<Plus size={15} />}>
            {t('Add Widget')}
          </Button>
          <Button
            variant={editing ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setEditing(e => !e)}
            startIcon={editing ? <Check size={15} /> : <Pencil size={15} />}
          >
            {editing ? t('Done') : t('Edit Dashboard')}
          </Button>
        </div>
      </div>
      {editing && (
        <p className="mb-2 text-xs text-fg-tertiary">{t('Drag to reorder')} · {t('Drag corner to resize')}</p>
      )}

      {/* 空状态 / 组件网格 */}
      {widgets.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16">
          <LayoutGrid size={40} className="text-fg-tertiary" />
          <p className="m-0 text-base font-medium text-fg">{t('Dashboard is empty')}</p>
          <p className="m-0 text-sm text-fg-secondary">{t('Add tools to get started')}</p>
          <Button onClick={() => setPickerOpen(true)} startIcon={<Plus size={16} />}>
            {t('Add Widget')}
          </Button>
        </Card>
      ) : (
        <WidgetGrid
          widgets={widgets}
          editing={editing}
          onReorder={reorder}
          onRemove={removeWidget}
          onCycleSize={cycleSize}
          onResize={setSize}
        />
      )}

      <WidgetPicker
        open={pickerOpen}
        addedPaths={addedPaths}
        onAdd={addWidget}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
