import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadAll, dump } from 'js-yaml';
import { Button, Alert, Textarea, ToggleButtonGroup } from '../ui';
import CodeView from '../ui/CodeView.jsx';
import { Copy, Download, X } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import useDebouncedEffect from '../../hooks/useDebouncedEffect.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function YamlFormatter() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('prettify');
  const [error, setError] = useState('');
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) setMode(newMode);
  };

  // 输入或模式变化时实时校验/格式化
  useDebouncedEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      if (mode === 'toJson') {
        // YAML → JSON
        const docs = loadAll(input);
        const value = docs.length === 1 ? docs[0] : docs;
        setOutput(JSON.stringify(value, null, 2));
      } else if (mode === 'fromJson') {
        // JSON → YAML
        setOutput(dump(JSON.parse(input), { indent: 2, lineWidth: -1 }));
      } else {
        // 校验并美化 YAML（支持多文档）
        const docs = loadAll(input);
        const dumped = docs
          .map(doc => dump(doc, { indent: 2, lineWidth: -1 }))
          .join('---\n');
        setOutput(dumped);
      }
      setError('');
    } catch (e) {
      setOutput('');
      // js-yaml 的错误信息带行列号，直接展示便于定位
      setError(e.message || t('yaml-formatter.invalid'));
    }
  }, [input, mode]);

  function downloadResult() {
    if (!output) return;
    const isJson = mode === 'toJson';
    const blob = new Blob([output], { type: isJson ? 'application/json' : 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isJson ? 'converted.json' : 'formatted.yaml';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('yaml-formatter.title')}</h1>
        <p className="text-fg-secondary mb-3">
          {t('yaml-formatter.subtitle')}
        </p>

        {/* 工具栏：所有操作集中 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <ToggleButtonGroup
            value={mode}
            onChange={handleModeChange}
            aria-label="yaml mode"
            options={[
              { value: 'prettify', label: t('yaml-formatter.prettify') },
              { value: 'toJson', label: 'YAML → JSON' },
              { value: 'fromJson', label: 'JSON → YAML' },
            ]}
          />
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <div className="flex gap-1">
            <Button size="small" variant="text" onClick={() => setInput('')} disabled={!input} startIcon={<X size={16} />}>
              {t('Clear')}
            </Button>
            <Button size="small" variant="text" onClick={() => output && copyToClipboard(output)} disabled={!output} startIcon={<Copy size={16} />}>
              {t('Copy')}
            </Button>
            <Button size="small" variant="text" onClick={downloadResult} disabled={!output} startIcon={<Download size={16} />}>
              {t('Download')}
            </Button>
          </div>
        </div>

        {error && (
          <Alert severity="error" className="mb-3 whitespace-pre-wrap font-mono text-xs">
            {error}
          </Alert>
        )}

        {/* 左输入 / 右结果 */}
        <div className="grid grid-cols-2 gap-4">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={18}
            label={t('yaml-formatter.inputLabel')}
            placeholder={mode === 'fromJson' ? '{"key": "value"}' : 'key: value\nlist:\n  - a\n  - b'}
            className="h-[calc(100vh-250px)] min-h-[320px] text-xs"
          />
          <div>
            <span className="mb-1 block text-sm font-medium text-fg-secondary">{t('Processing Results')}</span>
            {output ? (
              <CodeView code={output} className="h-[calc(100vh-274px)] min-h-[300px]" />
            ) : (
              <div className="flex h-[calc(100vh-274px)] min-h-[300px] items-center justify-center rounded-lg border border-line bg-muted text-sm text-fg-tertiary">
                {t('Converted result will appear here')}
              </div>
            )}
          </div>
        </div>
      </div>

      <CopySuccessAnimation
        visible={showAnimation}
        onAnimationEnd={handleAnimationEnd}
      />
    </>
  );
}
