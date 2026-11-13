// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, fireEvent, cleanup, waitFor } from '@testing-library/react';
import Base64Widget from './Base64Widget';
import JsonWidget from './JsonWidget';
import HashWidget from './HashWidget';
import UUIDWidget from './UUIDWidget';
import { widgetRegistry } from '../widgetRegistry';

afterEach(cleanup);

// jsdom 不带 Web Crypto，这里给一个结果确定的替身（sha256 由 sha1 测试值固定）
beforeAll(() => {
  if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        subtle: {
          digest: async (_alg, data) => {
            // 简单确定性哈希，够用来断言"出了结果"
            let h = 0;
            for (const b of data) h = (h * 31 + b) >>> 0;
            const hex = h.toString(16).padStart(8, '0').repeat(8); // 64 位十六进制
            return new TextEncoder().encode(hex).slice(0, 32).buffer;
          },
        },
        randomUUID: () => '11111111-1111-4111-8111-111111111111',
      },
      configurable: true,
    });
  }
});

describe('小组件尺寸档位', () => {
  describe('注册表', () => {
    it('Base64 / JSON / Hash 开放了包含超宽档的四档', () => {
      for (const path of ['/base64', '/json-formatter', '/hash-generator']) {
        expect(widgetRegistry[path].availableSizes).toEqual(['s', 'm', 'l', 'xl']);
      }
    });

    it('时间戳 / 密码 / UUID 不开放超宽档（拉宽只会是空白）', () => {
      for (const path of ['/timestamp', '/password-generator', '/uuid-generator']) {
        expect(widgetRegistry[path].availableSizes).toEqual(['s', 'm', 'l']);
      }
    });

    it('每个注册的组件在默认尺寸下都能渲染', () => {
      for (const [path, entry] of Object.entries(widgetRegistry)) {
        const { container } = render(<entry.component size={entry.defaultSize} />);
        expect(container.firstChild, `${path} 应渲染出内容`).not.toBeNull();
        cleanup();
      }
    });
  });

  describe('Base64', () => {
    it('s / m 档用单行输入 + 单行结果（不渲染 textarea）', () => {
      for (const size of ['s', 'm']) {
        const { container } = render(<Base64Widget size={size} />);
        expect(container.querySelector('textarea')).toBeNull();
        expect(container.querySelector('input')).not.toBeNull();
        cleanup();
      }
    });

    it('l 档用上下双文本域', () => {
      const { container } = render(<Base64Widget size="l" />);
      expect(container.querySelectorAll('textarea')).toHaveLength(2);
      expect(container.querySelector('input')).toBeNull();
    });

    it('xl 档输入与结果左右并排（同一行容器内两块文本域）', () => {
      const { container } = render(<Base64Widget size="xl" />);
      const textareas = container.querySelectorAll('textarea');

      expect(textareas).toHaveLength(2);
      // 两块文本域分属同一 flex 行容器的两个半宽子块（结果块里还嵌着复制按钮）
      const row = textareas[0].parentElement;
      const resultCol = textareas[1].closest('div.flex.items-stretch');
      expect(row.className).toContain('items-stretch');
      expect(row.className).not.toContain('flex-col');
      expect(row.contains(resultCol)).toBe(true);
      expect(resultCol).not.toBe(row);
      // 两栏等分
      expect(textareas[0].className).toContain('flex-1');
      expect(resultCol.className).toContain('flex-1');
      // 切换按钮竖排在输入左侧，不再占一整行高度
      expect(row.querySelector('.inline-flex.flex-col')).not.toBeNull();
    });

    it('输入后实时编码结果写入结果条', async () => {
      const { container } = render(<Base64Widget size="s" />);
      fireEvent.change(container.querySelector('input'), { target: { value: 'hello' } });

      await waitFor(() => {
        expect(container.textContent).toContain('aGVsbG8=');
      }, { timeout: 2000 });
    });

    it('s 档切换按钮为紧凑尺寸', () => {
      // 测试环境未加载完整 i18n 资源，按位置取第一个切换按钮即可
      const { container } = render(<Base64Widget size="s" />);
      const btn = container.querySelector('.inline-flex > button');
      expect(btn.className).toContain('px-2');
      expect(btn.className).toContain('text-xs');
    });

    it('m 档切换按钮保持原尺寸', () => {
      const { container } = render(<Base64Widget size="m" />);
      const btn = container.querySelector('.inline-flex > button');
      expect(btn.className).toContain('px-3');
      expect(btn.className).toContain('text-sm');
    });
  });

  describe('JSON', () => {
    it('s 档退化为单行输入 + 单行结果', () => {
      const { container } = render(<JsonWidget size="s" />);
      expect(container.querySelector('textarea')).toBeNull();
      expect(container.querySelector('input')).not.toBeNull();
    });

    it('m / l / xl 档保留两个文本域', () => {
      for (const size of ['m', 'l', 'xl']) {
        const { container } = render(<JsonWidget size={size} />);
        expect(container.querySelectorAll('textarea')).toHaveLength(2);
        cleanup();
      }
    });

    it('xl 档输入与输出左右并排，m / l 档上下堆叠', () => {
      const wide = render(<JsonWidget size="xl" />);
      const wideAreas = wide.container.querySelectorAll('textarea');
      expect(wideAreas[0].parentElement).toBe(wideAreas[1].parentElement);
      expect(wideAreas[0].parentElement.className).toContain('items-stretch');
      // 切换与复制按钮收进左侧竖栏
      expect(wideAreas[0].parentElement.querySelector('.inline-flex.flex-col')).not.toBeNull();
      cleanup();

      for (const size of ['m', 'l']) {
        const { container } = render(<JsonWidget size={size} />);
        const [input, output] = container.querySelectorAll('textarea');
        // 上下堆叠时两块文本域是兄弟节点而非同一行容器内的子节点
        expect(input.parentElement).toBe(output.parentElement);
        expect(input.parentElement.className).not.toContain('items-stretch');
        cleanup();
      }
    });

    it('xl 档保留独立错误提示行', async () => {
      const { container } = render(<JsonWidget size="xl" />);
      fireEvent.change(container.querySelector('textarea'), { target: { value: '{oops' } });

      await waitFor(() => {
        expect(container.querySelector('p.text-danger')).not.toBeNull();
      }, { timeout: 2000 });
    });

    it('s 档错误只显示一次（并进结果条）', async () => {
      const { container } = render(<JsonWidget size="s" />);
      fireEvent.change(container.querySelector('input'), { target: { value: '{oops' } });

      await waitFor(() => {
        // 测试环境 i18n 回退到英文 key
        const occurrences = (container.textContent.match(/Invalid JSON format/g) || []).length;
        expect(occurrences).toBe(1);
        expect(container.querySelector('p.text-danger')).toBeNull();
      }, { timeout: 2000 });
    });

    it('m 档错误保留独立提示行', async () => {
      const { container } = render(<JsonWidget size="m" />);
      const textareas = container.querySelectorAll('textarea');
      fireEvent.change(textareas[0], { target: { value: '{oops' } });

      await waitFor(() => {
        expect(container.querySelector('p.text-danger')).not.toBeNull();
      }, { timeout: 2000 });
    });

    it('s 档能格式化出结果', async () => {
      const { container } = render(<JsonWidget size="s" />);
      fireEvent.change(container.querySelector('input'), { target: { value: '{"a":1}' } });

      await waitFor(() => {
        expect(container.textContent).toContain('"a": 1');
      }, { timeout: 2000 });
    });
  });

  describe('Hash', () => {
    it('s 档结果与算法选择各占一行（纵向排列）', () => {
      const { container } = render(<HashWidget size="s" />);
      const select = container.querySelector('select');
      const resultStrip = container.querySelector('span.font-mono');

      expect(select).not.toBeNull();
      expect(resultStrip).not.toBeNull();
      // 下拉在结果条下方：s 档纵向堆叠，m 档横向并排
      expect(select.parentElement.className).toContain('flex-col');
    });

    it('m 档结果与算法选择横向并排', () => {
      const { container } = render(<HashWidget size="m" />);
      const row = container.querySelector('select').closest('div.flex');

      expect(row).not.toBeNull();
      // 结果条可能断成两行，所以是 items-start 而非 items-center，但仍是横向排布
      expect(row.className).toContain('items-start');
      expect(row.className).not.toContain('flex-col');
      expect(row.querySelector('span.font-mono')).not.toBeNull();
    });

    it('s 档输入后出哈希结果', async () => {
      const { container } = render(<HashWidget size="s" />);
      fireEvent.change(container.querySelector('input'), { target: { value: 'hello' } });

      await waitFor(() => {
        const strip = container.querySelector('span[title]');
        expect(strip.title).not.toBe('');
        expect(strip.title).toMatch(/^[0-9a-f]{64}$/);
      }, { timeout: 2000 });
    });

    it('l 档列出三种算法', () => {
      const { container } = render(<HashWidget size="l" />);
      expect(container.textContent).toContain('SHA-1');
      expect(container.textContent).toContain('SHA-256');
      expect(container.textContent).toContain('SHA-512');
    });

    it('xl 档同样列出三种算法，且结果区可断行（不截断）', () => {
      const { container } = render(<HashWidget size="xl" />);
      expect(container.textContent).toContain('SHA-512');

      const rows = container.querySelectorAll('li > button.font-mono');
      expect(rows).toHaveLength(3);
      // XL：break-all 完整显示；L：truncate + title
      for (const row of rows) {
        expect(row.className).toContain('break-all');
        expect(row.className).not.toContain('truncate');
      }
    });

    it('l 档结果行仍是单行截断（2 列放不下 SHA-512）', () => {
      const { container } = render(<HashWidget size="l" />);
      const rows = container.querySelectorAll('li > button.font-mono');

      for (const row of rows) {
        expect(row.className).toContain('truncate');
      }
    });

    it('xl 档输入后三种算法都算出结果（长度 40/64/128）', async () => {
      const { container } = render(<HashWidget size="xl" />);
      fireEvent.change(container.querySelector('input'), { target: { value: 'hello' } });

      await waitFor(() => {
        const rows = [...container.querySelectorAll('li > button.font-mono')];
        expect(rows.map(row => row.textContent.length)).toEqual([40, 64, 128]);
        for (const row of rows) expect(row.textContent).toMatch(/^[0-9a-f]+$/);
      }, { timeout: 2000 });
    });

    it('m 档结果条改为断行完整显示（不再单行截断）', () => {
      const { container } = render(<HashWidget size="m" />);
      const strip = container.querySelector('span.font-mono');

      expect(strip.className).toContain('break-all');
      expect(strip.className).not.toContain('truncate');
    });
  });

  describe('UUID（截断修复）', () => {
    it('s 档 UUID 完整显示：状态条断行且不截断', () => {
      const { container } = render(<UUIDWidget size="s" />);
      const strip = container.querySelector('span.font-mono');

      expect(strip.className).toContain('break-all');
      expect(strip.className).not.toContain('truncate');
      expect(strip.textContent).toHaveLength(36);
    });

    it('s 档按钮在状态条下方（纵向排布，不挤占 UUID 宽度）', () => {
      const { container } = render(<UUIDWidget size="s" />);
      const strip = container.querySelector('span.font-mono');
      const row = strip.parentElement;

      expect(row.className).toContain('flex-col');
    });
  });
});