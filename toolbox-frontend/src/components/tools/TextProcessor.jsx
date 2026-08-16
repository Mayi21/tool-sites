import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Alert, Textarea, Select } from '../ui';
import { Copy, X } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import useDebouncedEffect from '../../hooks/useDebouncedEffect.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function TextProcessor() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [operation, setOperation] = useState('uppercase');
  const [error, setError] = useState('');

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const operations = [
    { value: 'uppercase', label: t('Uppercase') },
    { value: 'lowercase', label: t('Lowercase') },
    { value: 'capitalize', label: t('Capitalize') },
    { value: 'titleCase', label: t('Title Case') },
    { value: 'removeDuplicates', label: t('Remove Duplicate Lines') },
    { value: 'removeExtraSpaces', label: t('Remove Extra Spaces') },
    { value: 'removeEmptyLines', label: t('Remove Empty Lines') },
    { value: 'reverse', label: t('Reverse Text') },
    { value: 'sortLines', label: t('Sort Lines') },
    { value: 'sortLinesReverse', label: t('Sort Lines (Reverse)') },
    { value: 'countWords', label: t('Count Words') },
    { value: 'countCharacters', label: t('Count Characters') },
    { value: 'countLines', label: t('Count Lines') }
  ];

  const processText = useCallback((inputText, selectedOperation) => {
    if (!inputText.trim()) return '';

    let result;
    switch (selectedOperation) {
      case 'uppercase':
        result = inputText.toUpperCase();
        break;
      case 'lowercase':
        result = inputText.toLowerCase();
        break;
      case 'capitalize':
        result = inputText.replace(/\b\w/g, l => l.toUpperCase());
        break;
      case 'titleCase':
        result = inputText.replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
        break;
      case 'removeDuplicates':
        result = [...new Set(inputText.split('\n'))].join('\n');
        break;
      case 'removeExtraSpaces':
        result = inputText.replace(/\s+/g, ' ').trim();
        break;
      case 'removeEmptyLines':
        result = inputText.split('\n').filter(line => line.trim() !== '').join('\n');
        break;
      case 'reverse':
        result = inputText.split('').reverse().join('');
        break;
      case 'sortLines':
        result = inputText.split('\n').sort().join('\n');
        break;
      case 'sortLinesReverse':
        result = inputText.split('\n').sort().reverse().join('\n');
        break;
      case 'countWords':
        result = `${t('Word count')}: ${inputText.trim() ? inputText.trim().split(/\s+/).length : 0}`;
        break;
      case 'countCharacters':
        result = `${t('Character count')}: ${inputText.length}`;
        break;
      case 'countLines':
        result = `${t('Line count')}: ${inputText.split('\n').length}`;
        break;
      default:
        result = inputText;
    }
    return result;
  }, [t]);

  // 输入或操作类型变化时实时处理
  useDebouncedEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      setOutput(processText(input, operation));
      setError('');
    } catch {
      setOutput('');
      setError(t('Processing failed, please try again'));
    }
  }, [input, operation, processText]);

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  const handleClear = () => {
    setInput('');
  };

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('Text Processor')}</h1>
        <p className="text-fg-secondary mb-3">
          {t('Text Processing Tool')}
        </p>

        {/* 工具栏：所有操作集中 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <div className="w-56">
            <Select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              aria-label={t('Processing Operation')}
            >
              {operations.map(op => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </Select>
          </div>
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
            onChange={(e) => setInput(e.target.value)}
            label={t('Enter text to process')}
            rows={18}
            placeholder={t('Paste or type your text here for processing...')}
            className="h-[calc(100vh-250px)] min-h-[320px] text-sm"
          />
          <Textarea
            value={output}
            readOnly
            rows={18}
            label={t('Processing Results')}
            placeholder={t('Converted result will appear here')}
            className="h-[calc(100vh-250px)] min-h-[320px] text-sm bg-muted"
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
