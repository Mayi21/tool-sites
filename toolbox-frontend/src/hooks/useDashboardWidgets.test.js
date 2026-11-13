// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useDashboardWidgets from './useDashboardWidgets';
import { widgetRegistry } from '../components/dashboard/widgetRegistry';

const STORAGE_KEY = 'dashboard_layout';

const readStored = () => JSON.parse(localStorage.getItem(STORAGE_KEY));
const storedSizes = () => readStored().widgets.map(w => `${w.path}:${w.size}`);

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('useDashboardWidgets', () => {
  describe('初始布局', () => {
    it('没有存档时播种默认布局', () => {
      const { result } = renderHook(() => useDashboardWidgets());

      expect(result.current.widgets.length).toBeGreaterThan(0);
      expect(result.current.widgets[0]).toEqual({ path: '/timestamp', size: 'm' });
    });

    it('损坏的存档回退到默认布局', () => {
      localStorage.setItem(STORAGE_KEY, '{not json');
      const { result } = renderHook(() => useDashboardWidgets());

      expect(result.current.widgets[0].path).toBe('/timestamp');
    });

    it('版本不符的存档回退到默认布局', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, widgets: [{ path: '/base64', size: 's' }] }));
      const { result } = renderHook(() => useDashboardWidgets());

      expect(result.current.widgets[0].path).toBe('/timestamp');
    });

    it('丢弃已下线的工具路径并去重', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        widgets: [
          { path: '/base64', size: 'm' },
          { path: '/gone-tool', size: 's' },
          { path: '/base64', size: 'l' },
        ],
      }));
      const { result } = renderHook(() => useDashboardWidgets());

      expect(result.current.widgets).toEqual([{ path: '/base64', size: 'm' }]);
    });

    it('存档里的非法尺寸修正为该工具的默认尺寸', () => {
      // json-formatter 默认 l，存档写 m 是合法的，这里用不存在的档位
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        widgets: [{ path: '/json-formatter', size: 'xl' }],
      }));
      const { result } = renderHook(() => useDashboardWidgets());

      expect(result.current.widgets[0].size).toBe(widgetRegistry['/json-formatter'].defaultSize);
    });
  });

  describe('setSize（拖拽伸缩提交）', () => {
    beforeEach(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        widgets: [{ path: '/base64', size: 'm' }],
      }));
    });

    it('接受白名单内的尺寸并落盘', () => {
      const { result } = renderHook(() => useDashboardWidgets());

      act(() => result.current.setSize('/base64', 's'));

      expect(result.current.widgets[0].size).toBe('s');
      expect(storedSizes()).toEqual(['/base64:s']);
    });

    it('拒绝白名单外的尺寸，状态与存档都不变', () => {
      const { result } = renderHook(() => useDashboardWidgets());
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, widgets: [{ path: '/base64', size: 'm' }] }));

      act(() => result.current.setSize('/base64', 'xl'));

      expect(result.current.widgets[0].size).toBe('m');
      expect(storedSizes()).toEqual(['/base64:m']);
    });

    it('未注册迷你组件的工具按 s/m/l 三档接受', () => {
      const { result } = renderHook(() => useDashboardWidgets());

      act(() => result.current.addWidget('/diff'));
      act(() => result.current.setSize('/diff', 'l'));

      const diff = result.current.widgets.find(w => w.path === '/diff');
      expect(diff.size).toBe('l');
    });
  });

  describe('cycleSize', () => {
    it('在可用尺寸内轮转并落盘', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        widgets: [{ path: '/json-formatter', size: 'l' }],
      }));
      const { result } = renderHook(() => useDashboardWidgets());

      act(() => result.current.cycleSize('/json-formatter'));

      // l → s（放开三档后循环回到最小档）
      expect(result.current.widgets[0].size).toBe('s');
      expect(storedSizes()).toEqual(['/json-formatter:s']);
    });

    it('只影响目标工具', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        widgets: [{ path: '/base64', size: 'm' }, { path: '/timestamp', size: 'm' }],
      }));
      const { result } = renderHook(() => useDashboardWidgets());

      act(() => result.current.cycleSize('/base64'));

      expect(result.current.widgets).toEqual([
        { path: '/base64', size: 'l' },
        { path: '/timestamp', size: 'm' },
      ]);
    });
  });

  describe('增删与提交', () => {
    it('addWidget 去重并落盘', () => {
      const { result } = renderHook(() => useDashboardWidgets());
      const before = result.current.widgets.length;

      act(() => result.current.addWidget('/diff'));
      act(() => result.current.addWidget('/diff'));

      expect(result.current.widgets.length).toBe(before + 1);
      expect(result.current.widgets.at(-1).path).toBe('/diff');
      expect(readStored().widgets.at(-1).path).toBe('/diff');
    });

    it('removeWidget 移除并落盘', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        widgets: [{ path: '/base64', size: 'm' }, { path: '/timestamp', size: 'm' }],
      }));
      const { result } = renderHook(() => useDashboardWidgets());

      act(() => result.current.removeWidget('/base64'));

      expect(result.current.widgets.map(w => w.path)).toEqual(['/timestamp']);
      expect(readStored().widgets.map(w => w.path)).toEqual(['/timestamp']);
    });

    it('reorder 只改内存，commit 之后才落盘', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        widgets: [{ path: '/base64', size: 'm' }, { path: '/timestamp', size: 'm' }],
      }));
      const { result } = renderHook(() => useDashboardWidgets());

      act(() => result.current.reorder(0, 1));
      expect(result.current.widgets.map(w => w.path)).toEqual(['/timestamp', '/base64']);
      // 拖拽过程中不写盘
      expect(readStored().widgets.map(w => w.path)).toEqual(['/base64', '/timestamp']);

      act(() => result.current.commit());
      expect(readStored().widgets.map(w => w.path)).toEqual(['/timestamp', '/base64']);
    });

    it('reorder 越界或原地移动时不变更', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        widgets: [{ path: '/base64', size: 'm' }, { path: '/timestamp', size: 'm' }],
      }));
      const { result } = renderHook(() => useDashboardWidgets());

      act(() => result.current.reorder(0, 0));
      act(() => result.current.reorder(-1, 1));
      act(() => result.current.reorder(0, 99));

      expect(result.current.widgets.map(w => w.path)).toEqual(['/base64', '/timestamp']);
    });

    it('reset 恢复默认布局并落盘', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        widgets: [{ path: '/base64', size: 's' }],
      }));
      const { result } = renderHook(() => useDashboardWidgets());

      act(() => result.current.reset());

      expect(result.current.widgets.map(w => w.path)).toContain('/timestamp');
      expect(readStored().widgets.map(w => w.path)).toContain('/timestamp');
    });
  });
});