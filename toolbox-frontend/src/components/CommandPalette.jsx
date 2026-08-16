import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import tools from '../tools';

/**
 * ⌘K / Ctrl+K 快速切换工具面板（自实现，零依赖）
 */
export default function CommandPalette() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  // 全局快捷键
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    // 供侧边栏搜索入口按钮打开
    const onOpenEvent = () => setOpen(true);
    window.addEventListener('open-command-palette', onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('open-command-palette', onOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const q = query.trim().toLowerCase();
  // 名称命中 > 路径命中 > 关键词命中
  const results = q
    ? tools
        .map(tool => {
          const name = t(tool.nameKey).toLowerCase();
          const score = name.includes(q) ? 3 : tool.path.includes(q) ? 2 : (tool.keywords || '').toLowerCase().includes(q) ? 1 : 0;
          return { tool, score };
        })
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(r => r.tool)
    : tools;

  const go = useCallback((tool) => {
    setOpen(false);
    navigate(tool.path);
  }, [navigate]);

  const onInputKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && results[active]) { go(results[active]); }
  };

  // 高亮项预取对应 chunk
  useEffect(() => {
    results[active]?.preload?.();
  }, [active, q]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh]" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border border-line bg-paper shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search size={16} className="shrink-0 text-fg-tertiary" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={onInputKeyDown}
            placeholder={t('commandPalette.placeholder')}
            className="h-11 w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-tertiary"
          />
          <kbd className="shrink-0 rounded border border-line bg-muted px-1.5 py-0.5 text-[10px] text-fg-tertiary">Esc</kbd>
        </div>
        <ul className="m-0 max-h-72 list-none overflow-y-auto p-1.5">
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-fg-tertiary">{t('commandPalette.empty')}</li>
          )}
          {results.map((tool, i) => (
            <li key={tool.path}>
              <button
                type="button"
                onClick={() => go(tool)}
                onMouseEnter={() => { setActive(i); tool.preload?.(); }}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  i === active ? 'bg-muted text-fg' : 'text-fg-secondary'
                }`}
              >
                {t(tool.nameKey)}
                <span className="font-mono text-xs text-fg-tertiary">{tool.path}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
