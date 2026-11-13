// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ToggleButtonGroup, IconButton } from './index';

const OPTIONS = [
  { value: 'encode', label: '编码' },
  { value: 'decode', label: '解码' },
];

afterEach(cleanup);

describe('ToggleButtonGroup', () => {
  describe('渲染', () => {
    it('按 options 渲染按钮', () => {
      render(<ToggleButtonGroup value="encode" onChange={() => {}} options={OPTIONS} />);

      expect(screen.getAllByRole('button')).toHaveLength(2);
      expect(screen.getByRole('button', { name: '编码' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '解码' })).toBeInTheDocument();
    });

    it('选中项用主色，未选中项用次要色', () => {
      render(<ToggleButtonGroup value="decode" onChange={() => {}} options={OPTIONS} />);

      expect(screen.getByRole('button', { name: '解码' }).className).toContain('bg-primary');
      expect(screen.getByRole('button', { name: '编码' }).className).toContain('bg-paper');
    });

    it('默认尺寸保持原有 padding 与字号（旧调用方不受影响）', () => {
      render(<ToggleButtonGroup value="encode" onChange={() => {}} options={OPTIONS} />);

      const btn = screen.getByRole('button', { name: '编码' });
      expect(btn.className).toContain('px-3');
      expect(btn.className).toContain('py-1.5');
      expect(btn.className).toContain('text-sm');
    });

    it('size="small" 时使用紧凑 padding 与字号', () => {
      render(<ToggleButtonGroup value="encode" onChange={() => {}} options={OPTIONS} size="small" />);

      const btn = screen.getByRole('button', { name: '编码' });
      expect(btn.className).toContain('px-2');
      expect(btn.className).toContain('py-1');
      expect(btn.className).toContain('text-xs');
      expect(btn.className).not.toContain('px-3');
    });

    it('按钮文字不换行（1×1 小组件内宽度只有 140px 左右）', () => {
      render(<ToggleButtonGroup value="encode" onChange={() => {}} options={OPTIONS} size="small" />);

      expect(screen.getByRole('button', { name: '编码' }).className).toContain('whitespace-nowrap');
    });

    it('options 为空时只渲染 children / 容器', () => {
      render(<ToggleButtonGroup value="" onChange={() => {}}>{null}</ToggleButtonGroup>);

      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });
  });

  describe('交互', () => {
    it('点击按钮回传事件与该按钮的 value', () => {
      const onChange = vi.fn();
      render(<ToggleButtonGroup value="encode" onChange={onChange} options={OPTIONS} />);

      fireEvent.click(screen.getByRole('button', { name: '解码' }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][1]).toBe('decode');
    });

    it('未传 onChange 时点击不报错', () => {
      render(<ToggleButtonGroup value="encode" options={OPTIONS} />);

      expect(() => fireEvent.click(screen.getByRole('button', { name: '解码' }))).not.toThrow();
    });
  });
});

describe('IconButton', () => {
  it('默认可点击，带 hover 反馈', () => {
    render(<IconButton aria-label="复制">x</IconButton>);

    const btn = screen.getByRole('button', { name: '复制' });
    expect(btn).not.toBeDisabled();
    expect(btn.className).toContain('hover:bg-muted');
  });

  it('disabled 时压低不透明度并去掉 hover 反馈', () => {
    render(<IconButton aria-label="调整大小" disabled>x</IconButton>);

    const btn = screen.getByRole('button', { name: '调整大小' });
    expect(btn).toBeDisabled();
    expect(btn.className).toContain('disabled:opacity-40');
    expect(btn.className).toContain('disabled:hover:bg-transparent');
  });
});