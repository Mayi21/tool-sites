import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Alert, Textarea, ToggleButtonGroup } from '../ui';
import { Copy, X } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import useDebouncedEffect from '../../hooks/useDebouncedEffect.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function Base64Tool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [error, setError] = useState('');

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  const handleClear = () => {
    setInput('');
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) setMode(newMode);
  };

  // 输入或模式变化时实时转换
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
    } catch (e) {
      setOutput('');
      setError(e.message || t('Invalid input for decoding'));
    }
  }, [input, mode]);

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('Base64 Encoder/Decoder')}</h1>
        <p className="text-fg-secondary mb-3">
          {t('Base64 Encode/Decode Tool')}
        </p>

        {/* 工具栏：所有操作集中 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <ToggleButtonGroup
            value={mode}
            onChange={handleModeChange}
            aria-label="conversion mode"
            options={[
              { value: 'encode', label: t('Encode') },
              { value: 'decode', label: t('Decode') },
            ]}
          />
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <div className="flex gap-1">
            <Button size="small" variant="text" onClick={handleClear} disabled={!input} startIcon={<X size={16} />}>
              {t('Clear')}
            </Button>
            <Button size="small" variant="text" onClick={handleCopy} disabled={!output} startIcon={<Copy size={16} />}>
              {t('Copy')}
            </Button>
          </div>
        </div>

        {error && (
          <Alert severity="error" className="mb-3">
            {error}
          </Alert>
        )}

        {/* 左输入 / 右结果 */}
        <div className="grid grid-cols-2 gap-4">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={18}
            label={t('Enter text to encode or decode')}
            className="h-[calc(100vh-250px)] min-h-[320px] text-xs"
          />
          <Textarea
            value={output}
            readOnly
            rows={18}
            label={t('Processing Results')}
            placeholder={t('Converted result will appear here')}
            className="h-[calc(100vh-250px)] min-h-[320px] text-xs bg-muted"
          />
        </div>
      </div>

      <CopySuccessAnimation
        visible={showAnimation}
        onAnimationEnd={handleAnimationEnd}
      />
    </>
  );
}
