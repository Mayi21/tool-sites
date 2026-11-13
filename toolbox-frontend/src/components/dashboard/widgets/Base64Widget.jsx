import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy } from 'lucide-react';
import { Input, Textarea, ToggleButtonGroup } from '../../ui';
import useCopyWithAnimation from '../../../hooks/useCopyWithAnimation';
import useDebouncedEffect from '../../../hooks/useDebouncedEffect';
import CopySuccessAnimation from '../../CopySuccessAnimation';

/**
 * Base64 小组件：S 紧凑（切换 + 输入 + 单行结果）；M 单行实时转换；
 * L 上下双文本域；XL（4 列宽）输入与结果左右并排，一倍宽装下两块文本域
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

  // 切换按钮：S 档宽度只有 142px，按钮换成紧凑尺寸才不至于折行；
  // XL 档塞进左侧竖栏，两个按钮上下叠放（竖排后不占额外高度）
  const modeToggle = (
    <ToggleButtonGroup
      value={mode}
      onChange={(_, v) => v && setMode(v)}
      options={[
        { value: 'encode', label: t('Encode') },
        { value: 'decode', label: t('Decode') },
      ]}
      size={size === 's' ? 'small' : 'medium'}
      className="w-fit shrink-0"
      vertical={size === 'xl'}
    />
  );

  return (
    <div className="flex h-full flex-col gap-2">
      {size === 'xl' ? (
        // 超宽：切换按钮移到左侧竖栏，输入 / 结果左右各半并排。
        // 4 列宽本来就够，再把按钮压在顶部会白占一整行高度
        <div className="flex min-h-0 flex-1 items-stretch gap-2">
          <div className="flex shrink-0 flex-col items-start gap-2">{modeToggle}</div>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('Enter text to encode or decode')}
            rows={3}
            className="min-h-0 min-w-0 flex-1 basis-0 px-2 py-1 text-xs"
          />
          <div className="flex min-h-0 min-w-0 flex-1 basis-0 items-stretch gap-1.5">
            <Textarea
              value={output}
              readOnly
              placeholder={t('Converted result will appear here')}
              rows={3}
              className="min-h-0 w-full bg-muted px-2 py-1 text-xs"
            />
            {copyButton}
          </div>
        </div>
      ) : (
        <>
          {modeToggle}
          {size === 'l' ? (
            // 大：上下双文本域，可容长输入与长结果
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
          ) : (
            // 小 / 中：单行输入 + 单行结果，高度一致，S 档挤在一格内
            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={t('Enter text to encode or decode')}
                className="h-8 px-2 py-1 text-xs"
              />
              <div className="flex min-h-0 flex-1 items-start gap-1.5">
                <span className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 font-mono text-xs text-fg" title={output}>
                  {output || '—'}
                </span>
                {copyButton}
              </div>
            </div>
          )}
        </>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}

      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </div>
  );
}
