import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search } from 'lucide-react';
import { Button, Modal } from '../ui';
import { categorizedTools } from '../../categories';

/**
 * 添加工具弹窗：搜索 + 按分类分组列出全部工具，已添加的置灰
 * 点击添加后弹窗保持打开，可连续添加
 */
export default function WidgetPicker({ open, addedPaths, onAdd, onClose }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  const q = query.trim().toLowerCase();
  const groups = categorizedTools
    .map(category => ({
      ...category,
      items: category.items.filter(tool =>
        !q || t(tool.nameKey).toLowerCase().includes(q) || tool.path.includes(q)
      ),
    }))
    .filter(category => category.items.length > 0);

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl">
      <h2 className="m-0 mb-3 text-base font-semibold text-fg">{t('Add Widget')}</h2>

      <div className="flex items-center gap-2 rounded-lg border border-line bg-bg px-3">
        <Search size={15} className="shrink-0 text-fg-tertiary" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('commandPalette.placeholder')}
          className="h-9 w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-tertiary"
        />
      </div>

      <div className="mt-3 max-h-[55vh] space-y-4 overflow-y-auto pr-1">
        {groups.map(category => (
          <div key={category.key}>
            <p className="mt-0 mb-1 text-xs font-semibold text-fg-tertiary">{t(category.nameKey)}</p>
            <ul className="m-0 list-none p-0">
              {category.items.map(tool => {
                const added = addedPaths.has(tool.path);
                const Icon = tool.icon;
                return (
                  <li key={tool.path} className="flex items-center gap-3 border-b border-line py-2 last:border-b-0">
                    <Icon size={18} className="shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-fg">{t(tool.nameKey)}</span>
                      <span className="block truncate text-xs text-fg-tertiary">{t(tool.descKey)}</span>
                    </span>
                    {added ? (
                      <span className="shrink-0 text-xs text-fg-tertiary">{t('Already added')}</span>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onAdd(tool.path)}
                        startIcon={<Plus size={14} />}
                      >
                        {t('Add Widget')}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="py-6 text-center text-sm text-fg-tertiary">{t('commandPalette.empty')}</p>
        )}
      </div>
    </Modal>
  );
}
