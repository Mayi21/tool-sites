import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import CodeView from './CodeView';

const renderView = (props = {}) => renderToStaticMarkup(<CodeView {...props} />);

/** 提取 <pre> 的 class 属性字符串 */
const getPreClassName = (markup) => {
  const matched = markup.match(/^<pre class="([^"]*)">/);
  expect(matched).not.toBeNull();
  return matched[1];
};

/** 提取 <pre> 内部的 HTML 片段（即语法着色结果） */
const getInnerHtml = (markup) => {
  const start = markup.indexOf('>') + 1;
  const end = markup.lastIndexOf('</pre>');
  expect(end).toBeGreaterThanOrEqual(start);
  return markup.slice(start, end);
};

const renderInner = (props) => getInnerHtml(renderView(props));

describe('CodeView', () => {
  describe('容器渲染', () => {
    it('默认开启自动换行，并输出完整的基础样式类', () => {
      const classes = getPreClassName(renderView({ code: 'a: 1' })).split(/\s+/);

      expect(classes).toContain('whitespace-pre-wrap');
      expect(classes).toContain('break-words');
      expect(classes).toContain('overflow-auto');
      expect(classes).toContain('rounded-lg');
      expect(classes).toContain('border-line');
      expect(classes).toContain('bg-muted');
      expect(classes).toContain('font-mono');
      expect(classes).toContain('text-xs');
      expect(classes).toContain('leading-relaxed');
      expect(classes).toContain('text-fg');
    });

    it('wrap=false 时切换为不换行样式且不残留 pre-wrap', () => {
      const classes = getPreClassName(renderView({ code: 'a: 1', wrap: false })).split(/\s+/);

      expect(classes).toContain('whitespace-pre');
      expect(classes).not.toContain('whitespace-pre-wrap');
      expect(classes).not.toContain('break-words');
    });

    it('把自定义 className 追加到样式类末尾', () => {
      const classes = getPreClassName(
        renderView({ code: 'a: 1', className: 'my-code-view extra-cls' })
      ).split(/\s+/);

      expect(classes).toContain('my-code-view');
      expect(classes).toContain('extra-cls');
      expect(classes.indexOf('my-code-view')).toBeGreaterThan(classes.indexOf('text-fg'));
    });

    it.each([
      ['undefined', undefined],
      ['null', null],
      ['空字符串', ''],
    ])('code 为 %s 时渲染空的 pre 内容', (_label, code) => {
      const markup = renderView({ code });

      expect(getInnerHtml(markup)).toBe('');
      expect(markup.endsWith('</pre>')).toBe(true);
    });

    it('code 为 0 这类假值时按空内容处理', () => {
      expect(renderInner({ code: 0 })).toBe('');
    });

    it('多行代码保留原始换行结构', () => {
      const inner = renderInner({ code: 'first: 1\nsecond: 2' });

      expect(inner).toContain('\n');
      expect(inner.split('\n')).toHaveLength(2);
      expect(inner.split('\n')[0]).toContain('first');
      expect(inner.split('\n')[1]).toContain('second');
    });
  });

  describe('语法着色', () => {
    // 当前实现限制：esc() 不转义双引号，字符串正则中的 &quot; 分支永不命中，
    // 因此 JSON 的双引号 key / 值只会被识别为 key，值本身不着色。
    it('JSON 带引号的 key 与字符串值均不着色（当前 esc 不转义引号的实现限制）', () => {
      const inner = renderInner({ code: '"name": "toolbox"' });

      expect(inner).toBe('"name": "toolbox"');
      expect(inner).not.toContain('text-primary');
      expect(inner).not.toContain('text-success');
    });

    it('高亮 YAML 裸 key', () => {
      const inner = renderInner({ code: 'name: toolbox' });

      expect(inner).toBe('<span class="text-primary font-medium">name</span>: toolbox');
    });

    it('高亮包含点号与连字符的组合 key', () => {
      const inner = renderInner({ code: 'a.b-c: 1' });

      expect(inner).toContain('<span class="text-primary font-medium">a.b-c</span>:');
    });

    it('仅把带冒号的行首标识识别为 key', () => {
      const inner = renderInner({ code: 'plain text without colon' });

      expect(inner).not.toContain('text-primary');
      expect(inner).toBe('plain text without colon');
    });

    it('双引号字符串值不会被着色（当前实现限制）', () => {
      const inner = renderInner({ code: 'msg: "hello world"' });

      expect(inner).toBe('<span class="text-primary font-medium">msg</span>: "hello world"');
      expect(inner).not.toContain('text-success');
    });

    it('高亮单引号字符串值', () => {
      const inner = renderInner({ code: "msg: 'hello world'" });

      expect(inner).toContain("<span class=\"text-success\">'hello world'</span>");
    });

    it('高亮正整数、负整数与小数', () => {
      const positive = renderInner({ code: 'count: 42' });
      const negative = renderInner({ code: 'offset: -7' });
      const decimal = renderInner({ code: 'ratio: 3.14' });

      expect(positive).toContain(
        '<span class="text-amber-600 dark:text-amber-400">42</span>'
      );
      expect(negative).toContain(
        '<span class="text-amber-600 dark:text-amber-400">-7</span>'
      );
      expect(decimal).toContain(
        '<span class="text-amber-600 dark:text-amber-400">3.14</span>'
      );
    });

    it('不为单词内部数字与分号前的数字着色', () => {
      const insideWord = renderInner({ code: 'id: abc123' });
      const beforeSemicolon = renderInner({ code: 'code: 12;' });

      expect(insideWord).not.toContain('text-amber-600');
      expect(insideWord).toContain('abc123');
      expect(beforeSemicolon).not.toContain('text-amber-600');
      expect(beforeSemicolon).toContain('12;');
    });

    it.each(['true', 'false', 'null'])('高亮布尔值与 null（%s）', (token) => {
      const inner = renderInner({ code: `value: ${token}` });

      expect(inner).toContain(`<span class="text-danger">${token}</span>`);
    });

    it('~ 不会被着色（\\b 与非单词字符不构成边界，当前实现限制）', () => {
      const inner = renderInner({ code: 'value: ~' });

      expect(inner).toBe('<span class="text-primary font-medium">value</span>: ~');
      expect(inner).not.toContain('text-danger');
    });

    it('转义 HTML 特殊字符以避免 XSS', () => {
      const inner = renderInner({ code: '<script>alert(1)</script>' });

      expect(inner).not.toContain('<script');
      expect(inner).toContain('&lt;script&gt;');
      expect(inner).toContain('&lt;/script&gt;');
      expect(inner).toContain(
        '<span class="text-amber-600 dark:text-amber-400">1</span>'
      );
    });
  });

  describe('注释处理', () => {
    it('整行注释整体转为注释样式', () => {
      const inner = renderInner({ code: '# 这是注释' });

      expect(inner).toBe('<span class="text-fg-tertiary italic"># 这是注释</span>');
    });

    it('行尾注释与代码分开着色', () => {
      const inner = renderInner({ code: 'port: 8080 # 端口' });

      expect(inner).toContain('<span class="text-primary font-medium">port</span>:');
      expect(inner).toContain(
        '<span class="text-amber-600 dark:text-amber-400">8080</span>'
      );
      expect(inner).toContain('<span class="text-fg-tertiary italic"># 端口</span>');
      expect(inner.indexOf('text-fg-tertiary')).toBeGreaterThan(inner.indexOf('8080'));
    });

    it('引号内的 # 不作为注释切分', () => {
      const inner = renderInner({ code: 'note: "a#b"' });

      expect(inner).not.toContain('text-fg-tertiary');
      expect(inner).toBe('<span class="text-primary font-medium">note</span>: "a#b"');
    });

    it('引号外仍有 # 但引号内含 # 时整行不按注释切分', () => {
      const inner = renderInner({ code: 'note: "a#b" # tail' });

      expect(inner).not.toContain('text-fg-tertiary');
      expect(inner).toContain('# tail');
    });

    it('单引号字符串中的 # 同样阻止注释切分', () => {
      const inner = renderInner({ code: "note: 'a#b'" });

      expect(inner).not.toContain('text-fg-tertiary');
      expect(inner).toContain("<span class=\"text-success\">'a#b'</span>");
    });
  });
});