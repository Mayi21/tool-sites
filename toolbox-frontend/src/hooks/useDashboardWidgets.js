import { useState, useCallback } from 'react';
import tools from '../tools';
import { widgetRegistry } from '../components/dashboard/widgetRegistry';

const STORAGE_KEY = 'dashboard_layout';
const VERSION = 1;

// 首次访问预播种的默认布局（数组顺序即展示顺序）
const DEFAULT_LAYOUT = [
  { path: '/timestamp', size: 'm' },
  { path: '/password-generator', size: 'm' },
  { path: '/uuid-generator', size: 's' },
  { path: '/base64', size: 'm' },
  { path: '/json-formatter', size: 'l' },
];

const availableSizes = (path) => widgetRegistry[path]?.availableSizes ?? ['s', 'm', 'l'];
const defaultSize = (path) => widgetRegistry[path]?.defaultSize ?? 'm';

/**
 * 读取并校验本地布局：
 * - key 不存在或数据非法（坏 JSON / 版本不符）→ 返回默认布局（不写回，用户清空后不重新播种）
 * - path 已失效的工具静默丢弃；按 path 去重；非法尺寸修正为该工具的默认尺寸
 */
const loadLayout = () => {
  let raw = null;
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    raw = null;
  }
  if (!raw || raw.version !== VERSION || !Array.isArray(raw.widgets)) return DEFAULT_LAYOUT;

  const known = new Set(tools.map(tool => tool.path));
  const seen = new Set();
  return raw.widgets
    .filter(w => w && typeof w.path === 'string' && known.has(w.path) && !seen.has(w.path) && seen.add(w.path))
    .map(w => ({
      path: w.path,
      size: availableSizes(w.path).includes(w.size) ? w.size : defaultSize(w.path),
    }));
};

/**
 * 工作台布局状态：localStorage 持久化（模式同 theme/language），每次变更立即写回
 */
export default function useDashboardWidgets() {
  const [widgets, setWidgets] = useState(loadLayout);

  const persist = useCallback((next) => {
    setWidgets(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, widgets: next }));
  }, []);

  const addWidget = useCallback((path) => {
    setWidgets(current => {
      if (current.some(w => w.path === path)) return current;
      const next = [...current, { path, size: defaultSize(path) }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, widgets: next }));
      return next;
    });
  }, []);

  const removeWidget = useCallback((path) => {
    setWidgets(current => {
      const next = current.filter(w => w.path !== path);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, widgets: next }));
      return next;
    });
  }, []);

  // 尺寸循环：s → m → l → s，仅在该工具可用尺寸内循环
  const cycleSize = useCallback((path) => {
    setWidgets(current => {
      const sizes = availableSizes(path);
      const next = current.map(w =>
        w.path === path ? { ...w, size: sizes[(sizes.indexOf(w.size) + 1) % sizes.length] } : w
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, widgets: next }));
      return next;
    });
  }, []);

  // 直接设定尺寸（拖拽伸缩提交用）：仅接受该工具的可用尺寸
  const setSize = useCallback((path, size) => {
    setWidgets(current => {
      if (!availableSizes(path).includes(size)) return current;
      const next = current.map(w => (w.path === path ? { ...w, size } : w));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, widgets: next }));
      return next;
    });
  }, []);

  // 拖拽重排：把 from 位置的项移动到 to 位置
  const reorder = useCallback((from, to) => {
    setWidgets(current => {
      if (from === to || from < 0 || to < 0 || from >= current.length || to >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, widgets: next }));
      return next;
    });
  }, []);

  const reset = useCallback(() => persist(DEFAULT_LAYOUT), [persist]);

  return { widgets, addWidget, removeWidget, cycleSize, setSize, reorder, reset };
}
