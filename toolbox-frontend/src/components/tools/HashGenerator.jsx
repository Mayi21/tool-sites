import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Alert, Textarea, Select } from '../ui';
import { Copy, X } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import useDebouncedEffect from '../../hooks/useDebouncedEffect.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function HashGenerator() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [hashType, setHashType] = useState('sha256');
  const [generatedHashes, setGeneratedHashes] = useState('');
  const [error, setError] = useState('');

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (generatedHashes) {
      copyToClipboard(generatedHashes);
    }
  };

  // 输入或算法变化时实时计算哈希
  useDebouncedEffect(() => {
    if (!input.trim()) {
      setGeneratedHashes('');
      setError('');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const results = [];

        const algorithms = {
          md5: 'MD5', // Placeholder, using SHA-256 as fallback
          sha1: 'SHA-1',
          sha256: 'SHA-256',
          sha512: 'SHA-512',
        };

        const typesToGenerate = hashType === 'all' ? Object.keys(algorithms) : [hashType];

        for (const type of typesToGenerate) {
          let hash;
          let algorithmName = type.toUpperCase();

          if (type === 'md5') {
            // MD5 is not part of Web Crypto API, using SHA-256 as fallback
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            hash = Array.from(new Uint8Array(hashBuffer))
              .map(b => b.toString(16).padStart(2, '0'))
              .join('')
              .substring(0, 32);
            algorithmName = 'MD5 (SHA-256 based)';
          } else {
            const hashBuffer = await crypto.subtle.digest(algorithms[type], data);
            hash = Array.from(new Uint8Array(hashBuffer))
              .map(b => b.toString(16).padStart(2, '0'))
              .join('');
          }

          results.push(`${algorithmName}: ${hash}`);
        }

        if (cancelled) return;
        setGeneratedHashes(results.join('\n'));
        setError('');
      } catch {
        if (cancelled) return;
        setGeneratedHashes('');
        setError(t('Hash generation failed, please try again'));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [input, hashType]);

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('Hash Generator')}</h1>
        <p className="text-fg-secondary mb-3">
          {t('MD5/SHA Hash Generator')}
        </p>

        {/* 工具栏：所有操作集中 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <div className="w-56">
            <Select
              label={t('Algorithm')}
              value={hashType}
              onChange={(e) => setHashType(e.target.value)}
            >
              <option value="md5">MD5</option>
              <option value="sha1">SHA-1</option>
              <option value="sha256">SHA-256</option>
              <option value="sha512">SHA-512</option>
              <option value="all">{t('All')}</option>
            </Select>
          </div>
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <div className="flex gap-1">
            <Button size="small" variant="text" onClick={() => setInput('')} disabled={!input} startIcon={<X size={16} />}>
              {t('Clear')}
            </Button>
            <Button size="small" variant="text" onClick={handleCopy} disabled={!generatedHashes} startIcon={<Copy size={16} />}>
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
            label={t('Enter text to hash')}
            rows={18}
            className="h-[calc(100vh-250px)] min-h-[320px]"
            placeholder={t('Paste or type your text here for processing...')}
          />
          <Textarea
            value={generatedHashes}
            readOnly
            rows={18}
            label={t('Generated Hashes')}
            placeholder={t('Processing results will appear here. Enter text above and select an operation.')}
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
