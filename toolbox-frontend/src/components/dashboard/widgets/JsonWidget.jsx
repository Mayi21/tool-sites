import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy } from 'lucide-react';
import { Input, Textarea, ToggleButtonGroup } from '../../ui';
import useCopyWithAnimation from '../../../hooks/useCopyWithAnimation';
import useDebouncedEffect from '../../../hooks/useDebouncedEffect';
import CopySuccessAnimation from '../../CopySuccessAnimation';

/**
 * JSON 小组件：S 紧凑（单行输入 + 单行结果）；M 输入 + 格式化/压缩实时输出；L 加高文本域
 */
export default function JsonWidget({ size }) {
  const { t } = useTranslation();
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('format');
  const [error, setError] = useState('');

  useDebouncedEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(mode === 'format' ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed));
      setError('');
    } catch {
      setOutput('');
      setError(t('Invalid JSON format'));
    }
  }, [input, mode]);

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <ToggleButtonGroup
          value={mode}
          onChange={(_, v) => v && setMode(v)}
          options={[
            { value: 'format', label: t('Format') },
            { value: 'minify', label: t('Minify') },
          ]}
          // S 档宽度只有 142px，按钮换成紧凑尺寸才不至于折行
          size={size === 's' ? 'small' : 'medium'}
          className="w-fit"
        />
        <button
          type="button"
          onClick={() => output && copyToClipboard(output)}
          title={t('Copy')}
          disabled={!output}
          className="shrink-0 cursor-pointer rounded-md p-1 text-fg-tertiary transition-colors hover:bg-muted hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Copy size={13} />
        </button>
      </div>

      {size === 's' ? (
        // 小：1×1 放不下两个文本域，退化为单行输入 + 单行结果
        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('Enter JSON to format')}
            className="h-8 px-2 py-1 font-mono text-xs"
          />
          <span
            className={`min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 font-mono text-xs ${error ? 'border border-danger text-danger' : 'text-fg'}`}
            title={output || error}
          >
            {error || output || '—'}
          </span>
        </div>
      ) : (
        <>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('Enter JSON to format')}
            rows={size === 'l' ? 6 : 3}
            className="min-h-0 flex-1 px-2 py-1 text-xs"
          />
          <Textarea
            value={output}
            readOnly
            placeholder={t('Formatted Result')}
            rows={size === 'l' ? 8 : 3}
            className={`min-h-0 flex-[1.4] bg-muted px-2 py-1 text-xs ${error ? 'border-danger' : ''}`}
          />
        </>
      )}
      {/* S 档错误已并进结果条（1×1 腾不出额外一行），这里只给 M/L 渲染 */}
      {error && size !== 's' && <p className="shrink-0 text-xs text-danger">{error}</p>}

      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </div>
  );
}
