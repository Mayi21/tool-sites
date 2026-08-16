import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Textarea } from '../ui';
import { Copy, X } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

// Basic markdown renderer, kept as is.
function renderMarkdown(text) {
  // A more robust solution would use a library like Marked or react-markdown
  const html = text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/^\s*[-*] (.*$)/gim, '<ul>\n<li>$1</li>\n</ul>')
    .replace(/<\/ul>\n<ul>/gim, '') // Merge consecutive lists
    .replace(/\n\n/gim, '</p><p>')
    .replace(/^<p>(.*)<\/p>$/gim, '$1'); // Avoid wrapping everything in <p>

  return `<p>${html}</p>`;
}

export default function MarkdownPreview() {
  const { t } = useTranslation();
  const [markdown, setMarkdown] = useState(`# ${t('Hello World')}

${t('This is')} **${t('bold')}** ${t('and')} *${t('italic')}* ${t('text')}.

- ${t('List item')} 1
- ${t('List item')} 2

\`\`\`javascript
console.log("${t('Hello World')}");
\`\`\``);
  const [renderedHtml, setRenderedHtml] = useState('');

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (markdown) {
      copyToClipboard(markdown);
    }
  };

  // Auto-preview when markdown changes (with debounce)
  const debouncedPreview = useCallback(() => {
    const timer = setTimeout(() => {
      if (markdown.trim()) {
        const html = renderMarkdown(markdown);
        setRenderedHtml(html);
      } else {
        setRenderedHtml('');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [markdown]);

  // Effect for auto-preview
  useEffect(() => {
    const cleanup = debouncedPreview();
    return cleanup;
  }, [debouncedPreview]);

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('Markdown Preview')}</h1>
        <p className="text-fg-secondary mb-3">
          {t('Markdown Preview Tool')}
        </p>

        {/* 工具栏：所有操作集中 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <div className="flex gap-1">
            <Button size="small" variant="text" onClick={() => setMarkdown('')} disabled={!markdown} startIcon={<X size={16} />}>
              {t('Clear')}
            </Button>
            <Button size="small" variant="text" onClick={handleCopy} disabled={!markdown} startIcon={<Copy size={16} />}>
              {t('Copy')}
            </Button>
          </div>
        </div>

        {/* 左输入 / 右预览 */}
        <div className="grid grid-cols-2 gap-4">
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            label={t('Enter text to process')}
            rows={18}
            placeholder={t('Paste or type your text here for processing...')}
            className="h-[calc(100vh-250px)] min-h-[320px] text-xs"
          />
          {renderedHtml ? (
            <div
              className={
                'h-[calc(100vh-250px)] min-h-[320px] p-6 overflow-auto bg-paper border border-line rounded-lg text-fg ' +
                '[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:font-bold [&_h1]:text-2xl ' +
                '[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:font-bold [&_h2]:text-xl ' +
                '[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-bold [&_h3]:text-lg ' +
                '[&_p]:my-2 [&_p]:leading-relaxed ' +
                '[&_ul]:pl-6 [&_ul]:my-2 [&_ul]:list-disc [&_li]:mb-1 ' +
                '[&_pre]:p-4 [&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:whitespace-pre-wrap [&_pre]:text-sm [&_pre]:border [&_pre]:border-line ' +
                '[&_code]:font-mono [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm ' +
                '[&_pre_code]:bg-transparent [&_pre_code]:p-0 ' +
                '[&_strong]:font-bold [&_em]:italic [&_em]:text-fg-secondary'
              }
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          ) : (
            <div className="h-[calc(100vh-250px)] min-h-[320px] flex items-center justify-center border border-line rounded-lg">
              <p className="text-fg-secondary text-center">
                {t('Processing results will appear here. Enter text above and select an operation.')}
              </p>
            </div>
          )}
        </div>
      </div>

      <CopySuccessAnimation
        visible={showAnimation}
        onAnimationEnd={handleAnimationEnd}
      />
    </>
  );
}
