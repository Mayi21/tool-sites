import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy } from 'lucide-react';
import { Input, Select } from '../../ui';
import useCopyWithAnimation from '../../../hooks/useCopyWithAnimation';
import useDebouncedEffect from '../../../hooks/useDebouncedEffect';
import CopySuccessAnimation from '../../CopySuccessAnimation';

const ALGORITHMS = [
  { value: 'sha1', label: 'SHA-1' },
  { value: 'sha256', label: 'SHA-256' },
  { value: 'sha512', label: 'SHA-512' },
];

const digest = async (algorithm, text) => {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * 哈希小组件：S 单算法（结果可换行）；M 单算法实时计算；L 三种算法结果各一行（点击复制）；
 * XL（4 列宽）三种算法各占整行，64/128 字符完整显示
 * 注：不提供 MD5（Web Crypto 不支持，原工具页的 MD5 实为 SHA-256 截断）
 */
export default function HashWidget({ size }) {
  const { t } = useTranslation();
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const [input, setInput] = useState('');
  const [hashType, setHashType] = useState('sha256');
  const [results, setResults] = useState({});
  const [error, setError] = useState('');

  // L / XL 一次算齐三种算法（结果按算法各占一行），其余档只算当前选中的算法
  const allTypes = size === 'l' || size === 'xl';
  const wide = size === 'xl';

  useDebouncedEffect(() => {
    if (!input.trim()) {
      setResults({});
      setError('');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const types = allTypes ? ALGORITHMS.map(a => a.value) : [hashType];
        const next = {};
        for (const type of types) {
          next[type] = await digest(type === 'sha1' ? 'SHA-1' : type === 'sha256' ? 'SHA-256' : 'SHA-512', input);
        }
        if (cancelled) return;
        setResults(next);
        setError('');
      } catch {
        if (cancelled) return;
        setResults({});
        setError(t('Error generating hash'));
      }
    })();
    return () => { cancelled = true; };
  }, [input, hashType, allTypes, t]);

  const copyButton = (value) => (
    <button
      type="button"
      onClick={() => value && copyToClipboard(value)}
      title={t('Copy')}
      className="shrink-0 cursor-pointer rounded-md p-1 text-fg-tertiary transition-colors hover:bg-muted hover:text-fg"
    >
      <Copy size={13} />
    </button>
  );

  return (
    <div className="flex h-full flex-col gap-2">
      <Input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={t('Enter text to hash')}
        className="h-8 px-2 py-1 text-xs"
      />

      {size === 's' ? (
        // 小：单行输入 + 结果 + 算法选择各占一行，避免 1×1 里横向挤碎
        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
          <div className="flex min-h-0 items-start gap-1.5">
            <span className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 font-mono text-xs text-fg" title={results[hashType]}>
              {results[hashType] || '—'}
            </span>
            {copyButton(results[hashType])}
          </div>
          <Select value={hashType} onChange={e => setHashType(e.target.value)} className="h-7 w-fit px-2 py-0.5 text-xs">
            {ALGORITHMS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </Select>
        </div>
      ) : size === 'm' ? (
        <div className="flex min-h-0 flex-1 items-start gap-1.5">
          <div className="w-28 shrink-0">
            <Select value={hashType} onChange={e => setHashType(e.target.value)} className="h-8 px-2 py-1 text-xs">
              {ALGORITHMS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </Select>
          </div>
          {/* 中档宽度 421px 装不下 SHA-256(64 字符)/SHA-512(128 字符)：改为断行完整显示 */}
          <span className="min-h-0 min-w-0 flex-1 select-text break-all rounded-md bg-muted px-2 py-1.5 font-mono text-xs leading-relaxed text-fg">
            {results[hashType] || '—'}
          </span>
          {copyButton(results[hashType])}
        </div>
      ) : (
        // L / XL：三种算法各占一行。XL 只有一行高（180px），行距收紧才塞得下
        <ul className={`m-0 flex min-h-0 flex-1 list-none flex-col overflow-y-auto p-0 ${wide ? 'gap-0.5' : 'gap-1'}`}>
          {ALGORITHMS.map(a => (
            <li key={a.value} className="flex items-center gap-1.5">
              <span className="w-20 shrink-0 text-xs font-medium text-fg-secondary">{a.label}</span>
              <button
                type="button"
                onClick={() => results[a.value] && copyToClipboard(results[a.value])}
                title={results[a.value] ? t('Click to copy') : ''}
                // XL 整行放得下 128 字符（约 920px < 1000px 可用），完整显示不截断；
                // L 只有 2 列宽，仍靠 title 查看全文
                className={`min-w-0 flex-1 cursor-pointer rounded-md bg-muted px-2 text-left font-mono text-xs text-fg transition-colors hover:text-primary ${
                  wide ? 'select-text break-all py-1 leading-tight' : 'truncate py-1.5'
                }`}
              >
                {results[a.value] || '—'}
              </button>
              {copyButton(results[a.value])}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}

      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </div>
  );
}
