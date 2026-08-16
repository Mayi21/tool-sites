import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Textarea, Chip, Divider } from '../ui';
import { Copy, X } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import useDebouncedEffect from '../../hooks/useDebouncedEffect.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function TextAnalyzer() {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  // 输入变化时实时分析
  useDebouncedEffect(() => {
    if (!text.trim()) {
      setAnalysis(null);
      return;
    }

    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const lines = text.split('\n').length;
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;

    const wordArray = text.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(wordArray).size;
    const averageWordLength = wordArray.length > 0
      ? (wordArray.reduce((sum, word) => sum + word.length, 0) / wordArray.length).toFixed(1)
      : 0;

    // Reading time estimation (average 200 words per minute)
    const readingTime = Math.ceil(words / 200);

    // Word frequency analysis
    const frequency = {};
    wordArray.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    const wordFrequency = Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    setAnalysis({
      characters,
      charactersNoSpaces,
      words,
      lines,
      sentences,
      paragraphs,
      uniqueWords,
      averageWordLength: parseFloat(averageWordLength),
      readingTime,
      wordFrequency
    });
  }, [text]);

  const handleCopy = () => {
    if (analysis) {
      const analysisText = `${t('Text Analysis Report')}:
${t('Characters')}: ${analysis.characters}
${t('Characters (no spaces)')}: ${analysis.charactersNoSpaces}
${t('Words')}: ${analysis.words}
${t('Lines')}: ${analysis.lines}
${t('Sentences')}: ${analysis.sentences}
${t('Paragraphs')}: ${analysis.paragraphs}
${t('Unique Words')}: ${analysis.uniqueWords}
${t('Average Word Length')}: ${analysis.averageWordLength}
${t('Reading Time')}: ${analysis.readingTime} ${t('minutes')}

${t('Top 10 Most Frequent Words')}:
${analysis.wordFrequency.map(({ word, count }) => `${word}: ${count}`).join('\n')}`;

      copyToClipboard(analysisText);
    }
  };

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('Text Analyzer')}</h1>
        <p className="text-fg-secondary mb-3">
          {t('Text Statistics Tool')}
        </p>

        {/* 工具栏：所有操作集中 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <div className="flex gap-1">
            <Button size="small" variant="text" onClick={() => setText('')} disabled={!text} startIcon={<X size={16} />}>
              {t('Clear')}
            </Button>
            <Button size="small" variant="text" onClick={handleCopy} disabled={!analysis} startIcon={<Copy size={16} />}>
              {t('Copy')}
            </Button>
          </div>
        </div>

        {/* 左输入 / 右结果 */}
        <div className="grid grid-cols-2 gap-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            label={t('Enter text to analyze')}
            rows={18}
            placeholder={t('Paste or type your text here for analysis...')}
            className="h-[calc(100vh-250px)] min-h-[320px] text-sm"
          />
          <div>
            {analysis ? (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-semibold text-primary">{analysis.characters.toLocaleString()}</div>
                    <div className="text-sm text-fg-secondary">{t('Characters')}</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-semibold text-primary">{analysis.words.toLocaleString()}</div>
                    <div className="text-sm text-fg-secondary">{t('Words')}</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-semibold text-primary">{analysis.lines}</div>
                    <div className="text-sm text-fg-secondary">{t('Lines')}</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-semibold text-primary">{analysis.sentences}</div>
                    <div className="text-sm text-fg-secondary">{t('Sentences')}</div>
                  </div>
                </div>

                <Divider className="my-0" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/10 text-primary rounded-lg">
                    <div className="text-3xl font-semibold">{analysis.charactersNoSpaces.toLocaleString()}</div>
                    <div className="text-sm">{t('Characters (no spaces)')}</div>
                  </div>
                  <div className="text-center p-4 bg-success/10 text-success rounded-lg">
                    <div className="text-3xl font-semibold">{analysis.paragraphs}</div>
                    <div className="text-sm">{t('Paragraphs')}</div>
                  </div>
                  <div className="text-center p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                    <div className="text-3xl font-semibold">{analysis.uniqueWords}</div>
                    <div className="text-sm">{t('Unique Words')}</div>
                  </div>
                  <div className="text-center p-4 bg-danger/10 text-danger rounded-lg">
                    <div className="text-3xl font-semibold">{analysis.averageWordLength}</div>
                    <div className="text-sm">{t('Avg Word Length')}</div>
                  </div>
                </div>

                <Divider className="my-0" />

                <div className="text-center p-6 bg-primary text-white rounded-xl">
                  <div className="text-4xl font-semibold">{analysis.readingTime}</div>
                  <div className="text-lg font-medium">{t('Reading Time (minutes)')}</div>
                  <p className="text-sm mt-2 opacity-80">
                    {t('Based on 200 words per minute average reading speed')}
                  </p>
                </div>

                {analysis.wordFrequency.length > 0 && (
                  <>
                    <Divider className="my-0" />
                    <div>
                      <h2 className="text-lg font-semibold text-fg mb-2">{t('Most Frequent Words')}</h2>
                      <div className="flex flex-row flex-wrap gap-2">
                        {analysis.wordFrequency.map(({ word, count }, index) => (
                          <Chip
                            key={word}
                            label={`${word} (${count})`}
                            color={index === 0 ? 'primary' : index < 3 ? 'success' : undefined}
                            className="mb-1"
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[280px] flex items-center justify-center rounded-lg border border-line bg-muted">
                <p className="text-fg-secondary text-center">
                  {t('Processing results will appear here. Enter text above and select an operation.')}
                </p>
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
