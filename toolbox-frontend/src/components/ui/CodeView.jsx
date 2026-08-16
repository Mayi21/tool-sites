/**
 * 极简 JSON/YAML 语法高亮视图（零依赖，逐行 token 着色）
 * 只处理 key / 字符串 / 数字 / 布尔与 null / 注释 五类，够格式化结果展示用
 */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function highlightLine(line) {
  // YAML 注释整行
  const commentIdx = line.indexOf('#');
  let code = line, comment = '';
  if (commentIdx >= 0 && !/["'].*#.*["']/.test(line)) {
    code = line.slice(0, commentIdx);
    comment = line.slice(commentIdx);
  }
  let html = esc(code)
    // JSON key："key": / YAML key: value
    .replace(/(&quot;)?([\w.$-]+)(&quot;)?(\s*):(?=\s|$)/g, '<span class="text-primary font-medium">$1$2$3</span>$4:')
    // 字符串
    .replace(/(&quot;.*?&quot;|'.*?')/g, '<span class="text-success">$1</span>')
    // 数字
    .replace(/(?<![\w&#"'])(-?\d+\.?\d*)(?![\w;])/g, '<span class="text-amber-600 dark:text-amber-400">$1</span>')
    // 布尔 / null
    .replace(/\b(true|false|null|~)\b/g, '<span class="text-danger">$1</span>');
  if (comment) html += `<span class="text-fg-tertiary italic">${esc(comment)}</span>`;
  return html;
}

export default function CodeView({ code, className = '' }) {
  const html = (code || '').split('\n').map(highlightLine).join('\n');
  return (
    <pre
      className={`m-0 overflow-auto whitespace-pre rounded-lg border border-line bg-muted px-3 py-2 font-mono text-xs leading-relaxed text-fg ${className}`}
      // 输出经过 esc() 转义后再着色，无 XSS 风险
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
