import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy } from 'lucide-react';
import { Input, Textarea, ToggleButtonGroup } from '../../ui';
import useCopyWithAnimation from '../../../hooks/useCopyWithAnimation';
import useDebouncedEffect from '../../../hooks/useDebouncedEffect';
import CopySuccessAnimation from '../../CopySuccessAnimation';

/**
 * Base64 小组件：M 单行实时转换；L 上下双文本域
 */
export default function Base64Widget({ size }) {
  const { t } = useTranslation();
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [error, setError] = useState('');

  // 输入或模式变化时实时转换（惯用法与 Base64Tool.jsx 一致，支持中文）
  useDebouncedEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      const result = mode === 'encode'
        ? btoa(unescape(encodeURIComponent(input)))
        : decodeURIComponent(escape(atob(input)));
      setOutput(result);
      setError('');
    } catch {
      setOutput('');
      setError(t('Invalid input for decoding'));
    }
  }, [input, mode]);

  const copyButton = (
    <button
      type="button"
      onClick={() => output && copyToClipboard(output)}
      title={t('Copy')}
      className="shrink-0 cursor-pointer rounded-md p-1 text-fg-tertiary transition-colors hover:bg-muted hover:text-fg"
    >
      <Copy size={13} />
    </button>
  );

  return (
    <div className="flex h-full flex-col gap-2">
      <ToggleButtonGroup
        value={mode}
        onChange={(_, v) => v && setMode(v)}
        options={[
          { value: 'encode', label: t('Encode') },
          { value: 'decode', label: t('Decode') },
        ]}
        className="w-fit text-xs"
      />

      {size === 'm' ? (
        <>
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('Enter text to encode or decode')}
            className="h-8 px-2 py-1 text-xs"
          />
          <div className="flex min-h-0 flex-1 items-center gap-1.5">
            <span className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 font-mono text-xs text-fg" title={output}>
              {output || '—'}
            </span>
            {copyButton}
          </div>
        </>
      ) : (
        <>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('Enter text to encode or decode')}
            rows={3}
            className="min-h-0 flex-1 px-2 py-1 text-xs"
          />
          <div className="flex min-h-0 flex-[2] items-stretch gap-1.5">
            <Textarea
              value={output}
              readOnly
              placeholder={t('Converted result will appear here')}
              rows={3}
              className="min-h-0 w-full bg-muted px-2 py-1 text-xs"
            />
            {copyButton}
          </div>
        </>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}

      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </div>
  );
}
