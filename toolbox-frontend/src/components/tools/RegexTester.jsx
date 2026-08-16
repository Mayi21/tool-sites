import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Alert, Input, Textarea, Checkbox } from '../ui';
import { Copy, Flag, X } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import useDebouncedEffect from '../../hooks/useDebouncedEffect.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function RegexTester() {
  const { t } = useTranslation();
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [flags, setFlags] = useState({
    g: true,  // global
    i: false, // ignoreCase
    m: false, // multiline
  });
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  const handleFlagChange = (event) => {
    setFlags({
      ...flags,
      [event.target.name]: event.target.checked,
    });
  };

  // pattern、flags、测试文本变化时实时匹配
  useDebouncedEffect(() => {
    if (!pattern.trim() || !testText.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      const flagString = Object.keys(flags).filter(key => flags[key]).join('');
      const regex = new RegExp(pattern, flagString);
      const results = [];
      let match;

      if (flags.g) {
        while ((match = regex.exec(testText)) !== null) {
          results.push({ match: match[0], index: match.index, groups: match.slice(1) });
          if (match[0] === '') regex.lastIndex++;
        }
      } else {
        match = regex.exec(testText);
        if (match) {
          results.push({ match: match[0], index: match.index, groups: match.slice(1) });
        }
      }

      if (results.length > 0) {
        const resultText = results.map((result, index) =>
          `Match ${index + 1}:\n` +
          `  Text: "${result.match}"\n` +
          `  Position: ${result.index}\n` +
          (result.groups.length > 0 ? `  Groups: [${result.groups.map(g => `"${g}"`).join(', ')}]\n` : '') +
          '\n'
        ).join('');

        setOutput(resultText);
      } else {
        setOutput(t('No matches found'));
      }
      setError('');
    } catch (e) {
      setOutput('');
      setError(t('Invalid regex pattern: {{error}}', { error: e.message }));
    }
  }, [pattern, testText, flags]);

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('Regex Tester')}</h1>
        <p className="text-fg-secondary mb-3">
          {t('Regex Testing Tool')}
        </p>

        {/* 工具栏：所有操作集中 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-fg">
            <Flag size={16} />
            {t('Regex Flags')}
          </span>
          <div className="flex flex-row flex-wrap gap-4">
            <Checkbox checked={flags.g} onChange={handleFlagChange} name="g" label="Global (g)" />
            <Checkbox checked={flags.i} onChange={handleFlagChange} name="i" label="Ignore Case (i)" />
            <Checkbox checked={flags.m} onChange={handleFlagChange} name="m" label="Multiline (m)" />
          </div>
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <div className="flex gap-1">
            <Button
              size="small"
              variant="text"
              onClick={() => { setPattern(''); setTestText(''); }}
              disabled={!pattern && !testText}
              startIcon={<X size={16} />}
            >
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
          <div className="flex flex-col gap-4">
            <Input
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              label={t('Enter regex pattern')}
              placeholder="^[a-zA-Z0-9]+$"
              className="font-mono text-xs"
            />
            <Textarea
              value={testText}
              onChange={e => setTestText(e.target.value)}
              rows={12}
              label={t('Enter text to test')}
              placeholder="Sample text to test your regex pattern against..."
              className="h-[calc(100vh-340px)] min-h-[240px]"
            />
          </div>
          <Textarea
            value={output}
            readOnly
            rows={16}
            label={t('Processing Results')}
            placeholder={t('Test results will appear here. Enter a regex pattern and test text, then click Test Regex.')}
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
