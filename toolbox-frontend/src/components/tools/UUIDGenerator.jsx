import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Textarea, Alert, Spinner } from '../ui';
import { Copy, RefreshCw, X } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function UUIDGenerator() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState('');
  const [count, setCount] = useState(10);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (generatedData) {
      copyToClipboard(generatedData);
    }
  };

  const handleGenerate = () => {
    setLoading(true);
    setGeneratedData('');
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      let data = [];
      for (let i = 0; i < count; i++) {
        data.push(crypto.randomUUID());
      }
      setGeneratedData(data.join('\n'));
      setLoading(false);
      setFeedback({ type: 'success', message: t('UUIDs generated successfully') });
    }, 500);
  };

  const handleClear = () => {
    setGeneratedData('');
    setFeedback({ type: '', message: '' });
  };

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('UUID Generator')}</h1>
        <p className="text-fg-secondary mb-3">
          {t('Generate universally unique identifiers (UUIDs).')}
        </p>

        {/* 工具栏：选项 + 操作 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <div className="w-28">
            <Input
              name="count"
              label={t('Count')}
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
              min={1}
              max={5000}
              required
            />
          </div>
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <div className="flex gap-1">
            <Button
              size="small"
              variant="text"
              onClick={handleGenerate}
              disabled={loading}
              startIcon={loading ? <Spinner size={16} /> : <RefreshCw size={16} />}
            >
              {loading ? t('Generating...') : t('Generate UUIDs')}
            </Button>
            <Button size="small" variant="text" onClick={handleClear} disabled={!generatedData} startIcon={<X size={16} />}>
              {t('Clear')}
            </Button>
            <Button size="small" variant="text" onClick={handleCopy} disabled={!generatedData} startIcon={<Copy size={16} />}>
              {t('Copy')}
            </Button>
          </div>
        </div>

        {feedback.message && <Alert severity={feedback.type} className="mb-4">{feedback.message}</Alert>}

        {loading ? (
          <div className="flex items-center justify-center min-h-[280px]">
            <div className="flex flex-col items-center gap-2">
              <Spinner />
              <p className="text-fg">{t('Generating UUIDs, please wait...')}</p>
            </div>
          </div>
        ) : generatedData ? (
          <Textarea
            value={generatedData}
            readOnly
            rows={16}
            label={t('Generated UUIDs')}
            className="bg-muted text-xs"
          />
        ) : (
          <div className="min-h-[280px] flex items-center justify-center rounded-lg border border-line">
            <p className="text-fg-secondary">
              {t('Generated UUIDs will appear here. Configure options and click generate.')}
            </p>
          </div>
        )}
      </div>

      <CopySuccessAnimation
        visible={showAnimation}
        onAnimationEnd={handleAnimationEnd}
      />
    </>
  );
}
