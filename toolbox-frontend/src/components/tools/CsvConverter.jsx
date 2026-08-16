import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Textarea, Select, Alert } from '../ui';
import { Copy, X } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import useDebouncedEffect from '../../hooks/useDebouncedEffect.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function CsvConverter() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [conversionType, setConversionType] = useState('csv2json');
  const [error, setError] = useState('');

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  // 输入或转换类型变化时实时转换
  useDebouncedEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      if (conversionType === 'csv2json') {
        const lines = input.trim().split('\n');
        if (lines.length < 2) {
          throw new Error(t('CSV must have at least a header and one data row'));
        }
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {});
        });
        setOutput(JSON.stringify(data, null, 2));
      } else {
        const jsonData = JSON.parse(input);
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          throw new Error(t('JSON must be a non-empty array of objects'));
        }
        const headers = Object.keys(jsonData[0]);
        const csvLines = [headers.join(',')];
        jsonData.forEach(row => {
          const values = headers.map(header => row[header] || '');
          csvLines.push(values.join(','));
        });
        setOutput(csvLines.join('\n'));
      }
      setError('');
    } catch (err) {
      setOutput('');
      setError(err.message || t('Conversion failed, please check your input format'));
    }
  }, [input, conversionType]);

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('CSV ↔ JSON Converter')}</h1>
        <p className="text-fg-secondary mb-3">
          {t('CSV to JSON Converter')}
        </p>

        {/* 工具栏：所有操作集中 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <div className="w-56">
            <Select
              value={conversionType}
              onChange={(e) => setConversionType(e.target.value)}
              aria-label={t('Convert')}
            >
              <option value="csv2json">{t('CSV to JSON')}</option>
              <option value="json2csv">{t('JSON to CSV')}</option>
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            label={conversionType === 'csv2json' ? t('Enter CSV data') : t('Enter JSON data')}
            rows={18}
            placeholder={t('Paste or type your text here for processing...')}
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
