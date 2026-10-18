import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy } from 'lucide-react';
import { Textarea, ToggleButtonGroup } from '../../ui';
import useCopyWithAnimation from '../../../hooks/useCopyWithAnimation';
import useDebouncedEffect from '../../../hooks/useDebouncedEffect';
import CopySuccessAnimation from '../../CopySuccessAnimation';

/**
 * JSON 小组件：M 输入 + 格式化/压缩实时输出；L 加高文本域
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
      <div className="flex items-center justify-between gap-2">
        <ToggleButtonGroup
          value={mode}
          onChange={(_, v) => v && setMode(v)}
          options={[
            { value: 'format', label: t('Format') },
            { value: 'minify', label: t('Minify') },
          ]}
          className="w-fit text-xs"
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
      {error && <p className="shrink-0 text-xs text-danger">{error}</p>}

      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </div>
  );
}
