import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Alert, Select, Textarea } from '../ui';
import { Copy, X } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import useDebouncedEffect from '../../hooks/useDebouncedEffect.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

// Conversion logic remains the same
function chineseToUnicode(text) {
  return text.split('').map(char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`).join('');
}
function unicodeToChinese(text) {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
}
function chineseToUnicodeEntity(text) {
  return text.split('').map(char => `&#x${char.charCodeAt(0).toString(16).toUpperCase()};`).join('');
}
function unicodeEntityToChinese(text) {
  return text.replace(/&#x([0-9a-fA-F]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export default function UnicodeConverter() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('toUnicode');
  const [error, setError] = useState('');

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const modeOptions = [
    { label: t('Chinese to Unicode'), value: 'toUnicode' },
    { label: t('Unicode to Chinese'), value: 'fromUnicode' },
    { label: t('Chinese to Unicode Entity'), value: 'toEntity' },
    { label: t('Unicode Entity to Chinese'), value: 'fromEntity' }
  ];

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  // 输入或模式变化时实时转换
  useDebouncedEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      let result = '';
      switch (mode) {
        case 'toUnicode': result = chineseToUnicode(input); break;
        case 'fromUnicode': result = unicodeToChinese(input); break;
        case 'toEntity': result = chineseToUnicodeEntity(input); break;
        case 'fromEntity': result = unicodeEntityToChinese(input); break;
        default: break;
      }
      setOutput(result);
      setError('');
    } catch (e) {
      setOutput('');
      setError(t('Conversion failed: {{error}}', { error: e.message }));
    }
  }, [input, mode]);

  const placeholderText =
    mode === 'toUnicode' ? t('Enter Chinese text to convert to Unicode') :
    mode === 'fromUnicode' ? t('Enter Unicode codes (e.g., \\u4e2d\\u6587)') :
    mode === 'toEntity' ? t('Enter Chinese text to convert to Unicode entities') :
    t('Enter Unicode entities (e.g., &#x4E2D;&#x6587;)');

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('Unicode Converter')}</h1>
        <p className="text-fg-secondary mb-3">
          {t('Convert between Chinese characters and Unicode representations.')}
        </p>

        {/* 工具栏：所有操作集中 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <div className="w-56">
            <Select
              value={mode}
              onChange={e => setMode(e.target.value)}
              aria-label={t('Conversion Mode')}
              required
            >
              {modeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Select>
          </div>
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <div className="flex gap-1">
            <Button size="small" variant="text" onClick={() => setInput('')} disabled={!input} startIcon={<X size={16} />}>
              {t('Clear')}
            </Button>
            <Button size="small" variant="text" onClick={handleCopy} disabled={!output} startIcon={<Copy size={16} />}>
              {t('Copy')}
            </Button>
          </div>
        </div>

        {error && <Alert severity="error" className="mb-3">{error}</Alert>}

        {/* 左输入 / 右结果 */}
        <div className="grid grid-cols-2 gap-4">
          <Textarea
            name="inputText"
            value={input}
            onChange={e => setInput(e.target.value)}
            label={t('Input Text')}
            placeholder={placeholderText}
            rows={18}
            className="h-[calc(100vh-250px)] min-h-[320px] text-xs"
          />
          <Textarea
            value={output}
            readOnly
            rows={18}
            label={t('Converted Result')}
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
