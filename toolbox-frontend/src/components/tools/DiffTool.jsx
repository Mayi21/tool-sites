import { useState, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Alert, Textarea, Switch, IconButton, Tooltip, Chip } from '../ui';
import { Copy, ArrowLeftRight } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import useDebouncedEffect from '../../hooks/useDebouncedEffect.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

// Performance optimized diff segment component
const DiffSegment = memo(({ segment }) => {
  const className = useMemo(() => {
    if (segment.type === 'del') {
      return 'inline-block mx-px rounded-sm border border-danger/40 bg-danger/15 px-0.5 line-through';
    }
    if (segment.type === 'add') {
      return 'inline-block mx-px rounded-sm border border-success/40 bg-success/15 px-0.5 underline';
    }
    if (segment.isModified) {
      return 'inline-block mx-px rounded-sm border border-amber-500/40 bg-amber-500/15 px-0.5';
    }
    return '';
  }, [segment.type, segment.isModified]);

  return <span className={className}>{segment.text}</span>;
});

DiffSegment.displayName = 'DiffSegment';
function lcsIndices(aItems, bItems) {
  const m = aItems.length, n = bItems.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = aItems[i] === bItems[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const pairs = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (aItems[i] === bItems[j]) { pairs.push([i++, j++]); }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++;
  }
  return pairs;
}

function computeLineDiff(aText, bText, { ignoreWhitespace, caseSensitive }) {
  const norm = s => {
    let t = s;
    if (!caseSensitive) t = t.toLowerCase();
    if (ignoreWhitespace) t = t.replace(/\s+/g, '');
    return t;
  };
  const aLines = aText.split('\n');
  const bLines = bText.split('\n');
  const aKeys = aLines.map(norm);
  const bKeys = bLines.map(norm);
  const matches = lcsIndices(aKeys, bKeys);
  const result = [];
  let ai = 0, bi = 0, mi = 0;
  const pushDel = line => result.push({ type: 'del', left: line, right: '' });
  const pushAdd = line => result.push({ type: 'add', left: '', right: line });
  const pushEq = (l, r) => result.push({ type: 'eq', left: l, right: r });
  while (ai < aLines.length || bi < bLines.length) {
    if (mi < matches.length && ai === matches[mi][0] && bi === matches[mi][1]) {
      pushEq(aLines[ai++], bLines[bi++]); mi++;
    } else if (mi < matches.length && ai < matches[mi][0]) {
      pushDel(aLines[ai++]);
    } else if (mi < matches.length && bi < matches[mi][1]) {
      pushAdd(bLines[bi++]);
    } else {
      if (ai < aLines.length) pushDel(aLines[ai++]);
      if (bi < bLines.length) pushAdd(bLines[bi++]);
    }
  }
  return result;
}

// Enhanced character-level diff with word boundary awareness
function diffChars(a, b) {
  // First do character-level diff
  const aArr = [...a], bArr = [...b];
  const matches = lcsIndices(aArr, bArr);
  const out = [];
  let ai = 0, bi = 0, mi = 0;
  const push = (t, v) => out.push({ type: t, text: v });

  while (ai < aArr.length || bi < bArr.length) {
    if (mi < matches.length && ai === matches[mi][0] && bi === matches[mi][1]) {
      push('eq', aArr[ai]); ai++; bi++; mi++;
    } else if (mi < matches.length && ai < matches[mi][0]) {
      push('del', aArr[ai++]);
    } else if (mi < matches.length && bi < matches[mi][1]) {
      push('add', bArr[bi++]);
    } else {
      if (ai < aArr.length) push('del', aArr[ai++]);
      if (bi < bArr.length) push('add', bArr[bi++]);
    }
  }

  // Merge consecutive segments of the same type for better visual grouping
  return mergeConsecutiveSegments(out);
}

// Merge consecutive segments of the same type
function mergeConsecutiveSegments(segments) {
  if (segments.length === 0) return segments;

  const merged = [segments[0]];
  for (let i = 1; i < segments.length; i++) {
    const current = segments[i];
    const last = merged[merged.length - 1];

    if (current.type === last.type) {
      last.text += current.text;
    } else {
      merged.push(current);
    }
  }

  return merged;
}

// Enhanced word-aware diff for better granularity
function diffWords(a, b) {
  const wordRegex = /\S+|\s+/g;
  const aWords = a.match(wordRegex) || [];
  const bWords = b.match(wordRegex) || [];

  const matches = lcsIndices(aWords, bWords);
  const result = [];
  let ai = 0, bi = 0, mi = 0;

  const push = (type, text) => result.push({ type, text });

  while (ai < aWords.length || bi < bWords.length) {
    if (mi < matches.length && ai === matches[mi][0] && bi === matches[mi][1]) {
      // Words match exactly
      push('eq', aWords[ai]);
      ai++; bi++; mi++;
    } else if (mi < matches.length && ai < matches[mi][0]) {
      // Word deleted
      push('del', aWords[ai++]);
    } else if (mi < matches.length && bi < matches[mi][1]) {
      // Word added
      push('add', bWords[bi++]);
    } else {
      // Handle remaining words
      if (ai < aWords.length && bi < bWords.length) {
        // Both have words - do character-level diff within words if they're both non-whitespace
        const aWord = aWords[ai];
        const bWord = bWords[bi];

        if (aWord.trim() && bWord.trim()) {
          // Character-level diff for modified words
          const charDiff = diffChars(aWord, bWord);
          result.push(...charDiff.map(seg => ({...seg, isModified: true})));
        } else {
          push('del', aWord);
          push('add', bWord);
        }
        ai++; bi++;
      } else if (ai < aWords.length) {
        push('del', aWords[ai++]);
      } else if (bi < bWords.length) {
        push('add', bWords[bi++]);
      }
    }
  }

  return result;
}

function diffLineClasses(line, side, isCurrentDiff) {
  const marker = side === 'left' ? 'del' : 'add';
  let cls = 'flex min-h-[22px]';
  if (line.type === marker) {
    cls += side === 'left'
      ? ' bg-danger/10 border-l-4 border-danger hover:bg-danger/20'
      : ' bg-success/10 border-l-4 border-success hover:bg-success/20';
  } else if (line.type !== 'eq' && line.type !== 'del' && line.type !== 'add') {
    cls += ' bg-amber-500/10 border-l-4 border-amber-500 hover:bg-amber-500/20';
  } else if (line.type === 'eq') {
    cls += ' hover:bg-muted';
  }
  if (isCurrentDiff && line.type !== 'eq') {
    cls += ' border-l-[5px] border-l-primary';
  }
  return cls;
}

export default function DiffTool() {
  const { t } = useTranslation();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [diffLines, setDiffLines] = useState([]);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [error, setError] = useState('');
  const [currentDiffIndex, setCurrentDiffIndex] = useState(-1);
  const [diffStats, setDiffStats] = useState({ added: 0, deleted: 0, modified: 0 });
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  // 两侧文本或选项变化时实时对比
  useDebouncedEffect(() => {
    if (!a.trim() && !b.trim()) {
      setDiffLines([]);
      setDiffStats({ added: 0, deleted: 0, modified: 0 });
      setCurrentDiffIndex(-1);
      setError('');
      return;
    }
    try {
      const result = computeLineDiff(a, b, { ignoreWhitespace, caseSensitive });
      setDiffLines(result);

      const stats = result.reduce((acc, line) => {
        if (line.type === 'add') acc.added++;
        else if (line.type === 'del') acc.deleted++;
        else if (line.type === 'mod') acc.modified++;
        return acc;
      }, { added: 0, deleted: 0, modified: 0 });
      setDiffStats(stats);
      setCurrentDiffIndex(-1);
      setError('');
    } catch {
      setDiffLines([]);
      setDiffStats({ added: 0, deleted: 0, modified: 0 });
      setError(t('Comparison failed, please try again'));
    }
  }, [a, b, ignoreWhitespace, caseSensitive], 300);

  const handleCopy = () => {
    if (diffLines.length > 0) {
      const text = diffLines.map(l => (l.type === 'eq' ? `  ${l.left}` : l.type === 'del' ? `- ${l.left}` : `+ ${l.right}`)).join('\n');
      copyToClipboard(text);
    }
  };

  const swapInputs = useCallback(() => {
    setA(b);
    setB(a);
  }, [a, b]);

  const navigateToDiff = useCallback((direction) => {
    const diffIndices = diffLines
      .map((line, index) => line.type !== 'eq' ? index : -1)
      .filter(index => index !== -1);

    if (diffIndices.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      const nextIndex = diffIndices.find(index => index > currentDiffIndex);
      newIndex = nextIndex !== undefined ? nextIndex : diffIndices[0];
    } else {
      const prevIndex = diffIndices.reverse().find(index => index < currentDiffIndex);
      newIndex = prevIndex !== undefined ? prevIndex : diffIndices[0];
    }

    setCurrentDiffIndex(newIndex);

    // Scroll to diff position
    setTimeout(() => {
      const element = document.querySelector(`[data-diff-line="${newIndex}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, [diffLines, currentDiffIndex]);

  const renderSide = (side) => (
    <div className={side === 'left' ? 'flex-1 overflow-auto border-r-2 border-line' : 'flex-1 overflow-auto'}>
      <div className="bg-muted p-2 border-b border-line font-bold text-sm text-fg">
        {side === 'left' ? t('Text 1') : t('Text 2')}
      </div>
      <div className="font-mono text-[13px]">
        {diffLines.map((line, idx) => {
          const isCurrentDiff = idx === currentDiffIndex;
          const content = side === 'left' ? line.left : line.right;
          const hasContent = content !== '';
          const blankMarker = side === 'left' ? 'add' : 'del';

          return (
            <div key={idx} data-diff-line={idx} className={diffLineClasses(line, side, isCurrentDiff)}>
              <div className="flex w-10 shrink-0 select-none items-center justify-center border-r border-line bg-muted text-[11px] text-fg-secondary">
                {hasContent ? idx + 1 : ''}
              </div>
              <div className="flex-1 whitespace-pre-wrap break-all px-2 py-0.5 text-fg">
                {line.type === 'eq' || line.type === (side === 'left' ? 'del' : 'add') ? (
                  <span>{content || ' '}</span>
                ) : line.type === blankMarker ? (
                  <span className="text-fg-tertiary">
                    {/* Empty line placeholder */}
                  </span>
                ) : (
                  diffWords(line.left, line.right)
                    .filter(seg => seg.type !== blankMarker)
                    .map((seg, i2) => (
                      <DiffSegment key={i2} segment={seg} />
                    ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('Text Comparison')}</h1>
        <p className="text-fg-secondary mb-3">
          {t('Text Comparison Tool')}
        </p>

        {/* 工具栏：所有操作集中 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Switch
              checked={ignoreWhitespace}
              onChange={v => setIgnoreWhitespace(v)}
              label={t('Ignore Whitespace')}
            />
            <Switch
              checked={caseSensitive}
              onChange={v => setCaseSensitive(v)}
              label={t('Case Sensitive')}
            />
            <Tooltip title={t('Swap texts')}>
              <IconButton onClick={swapInputs}>
                <ArrowLeftRight size={18} />
              </IconButton>
            </Tooltip>
            {diffStats.added + diffStats.deleted + diffStats.modified > 0 && (
              <div className="flex gap-2">
                <Chip color="success" label={`+${diffStats.added}`} />
                <Chip color="error" label={`-${diffStats.deleted}`} />
                {diffStats.modified > 0 && (
                  <Chip label={`~${diffStats.modified}`} className="bg-amber-500/15 text-amber-600 dark:text-amber-400" />
                )}
              </div>
            )}
          </div>
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <div className="flex gap-1">
            <Button
              size="small"
              variant="text"
              onClick={() => navigateToDiff('prev')}
              disabled={diffLines.length === 0 || currentDiffIndex <= 0}
              className="min-w-0 px-2"
            >
              ▲
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={() => navigateToDiff('next')}
              disabled={diffLines.length === 0 || currentDiffIndex >= diffLines.length - 1}
              className="min-w-0 px-2"
            >
              ▼
            </Button>
            <Button size="small" variant="text" onClick={handleCopy} disabled={diffLines.length === 0} startIcon={<Copy size={16} />}>
              {t('Copy')}
            </Button>
          </div>
        </div>

        {error && (
          <Alert severity="error" className="mb-3">
            {error}
          </Alert>
        )}

        {/* 左右输入 */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <Textarea
            value={a}
            onChange={e => setA(e.target.value)}
            label={t('Text 1')}
            rows={8}
            className="text-xs"
          />
          <Textarea
            value={b}
            onChange={e => setB(e.target.value)}
            label={t('Text 2')}
            rows={8}
            className="text-xs"
          />
        </div>

        {/* 对比结果 */}
        {diffLines.length > 0 ? (
          <div className="flex max-h-[500px] overflow-hidden rounded-lg border-2 border-line shadow-md">
            {renderSide('left')}
            {renderSide('right')}
          </div>
        ) : (
          <div className="min-h-[280px] flex items-center justify-center rounded-lg border border-line bg-muted/50">
            <p className="text-fg-secondary text-center">
              {t('Comparison result will appear here. Enter text in both fields and click compare.')}
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
