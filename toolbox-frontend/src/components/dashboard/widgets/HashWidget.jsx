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
 * 哈希小组件：M 单算法实时计算；L 三种算法结果各一行（点击复制）
 * 注：不提供 MD5（Web Crypto 不支持，原工具页的 MD5 实为 SHA-256 截断）
 */
export default function HashWidget({ size }) {
  const { t } = useTranslation();
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const [input, setInput] = useState('');
  const [hashType, setHashType] = useState('sha256');
  const [results, setResults] = useState({});
  const [error, setError] = useState('');

  useDebouncedEffect(() => {
    if (!input.trim()) {
      setResults({});
      setError('');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const types = size === 'l' ? ALGORITHMS.map(a => a.value) : [hashType];
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
  }, [input, hashType, size]);

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

      {size === 'm' ? (
        <div className="flex min-h-0 flex-1 items-center gap-1.5">
          <div className="w-28 shrink-0">
            <Select value={hashType} onChange={e => setHashType(e.target.value)} className="h-8 px-2 py-1 text-xs">
              {ALGORITHMS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </Select>
          </div>
          <span className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 font-mono text-xs text-fg" title={results[hashType]}>
            {results[hashType] || '—'}
          </span>
          {copyButton(results[hashType])}
        </div>
      ) : (
        <ul className="m-0 flex-1 list-none space-y-1 overflow-y-auto p-0">
          {ALGORITHMS.map(a => (
            <li key={a.value} className="flex items-center gap-1.5">
              <span className="w-20 shrink-0 text-xs font-medium text-fg-secondary">{a.label}</span>
              <button
                type="button"
                onClick={() => results[a.value] && copyToClipboard(results[a.value])}
                title={results[a.value] ? t('Click to copy') : ''}
                className="min-w-0 flex-1 cursor-pointer truncate rounded-md bg-muted px-2 py-1.5 text-left font-mono text-xs text-fg transition-colors hover:text-primary"
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
