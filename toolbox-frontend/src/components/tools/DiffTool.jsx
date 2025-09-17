import { useState, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, Alert, Box, Stack, CardHeader, CardContent, CircularProgress,
  Grid, Switch, FormControlLabel, IconButton, Tooltip, Chip
} from '@mui/material';
import { ContentCopy, Difference, SwapHoriz, Compare } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

// Performance optimized diff segment component
const DiffSegment = memo(({ segment, index }) => {
  const {
    backgroundColor,
    textDecoration,
    border,
    borderRadius,
    padding,
    boxShadow,
    margin,
    display
  } = useMemo(() => {
    let bgColor = 'transparent';
    let textDecoration = 'none';
    let border = 'none';
    let borderRadius = '0';
    let padding = '0';
    let boxShadow = 'none';
    let margin = '0';
    let display = 'inline';

    if (segment.type === 'del') {
      bgColor = '#ffebee';
      border = '1px solid #ffcdd2';
      borderRadius = '2px';
      padding = '1px 2px';
      boxShadow = 'inset 0 0 0 1px rgba(244, 67, 54, 0.2)';
      textDecoration = 'line-through';
      margin = '0 1px';
      display = 'inline-block';
    } else if (segment.type === 'add') {
      bgColor = '#e8f5e8';
      border = '1px solid #a5d6a7';
      borderRadius = '2px';
      padding = '1px 2px';
      boxShadow = 'inset 0 0 0 1px rgba(76, 175, 80, 0.2)';
      textDecoration = 'underline';
      margin = '0 1px';
      display = 'inline-block';
    } else if (segment.isModified) {
      bgColor = '#fff3e0';
      border = '1px solid #ffcc02';
      borderRadius = '2px';
      padding = '1px 2px';
      boxShadow = 'inset 0 0 0 1px rgba(255, 152, 0, 0.2)';
      margin = '0 1px';
      display = 'inline-block';
    }

    return {
      backgroundColor: bgColor,
      textDecoration,
      border,
      borderRadius,
      padding,
      boxShadow,
      margin,
      display
    };
  }, [segment.type, segment.isModified]);

  return (
    <Typography component="span" sx={{
      backgroundColor,
      textDecoration,
      border,
      borderRadius,
      padding,
      boxShadow,
      fontSize: 'inherit',
      margin,
      display
    }}>
      {segment.text}
    </Typography>
  );
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

export default function DiffTool() {
  const { t } = useTranslation();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [diffLines, setDiffLines] = useState([]);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [currentDiffIndex, setCurrentDiffIndex] = useState(-1);
  const [diffStats, setDiffStats] = useState({ added: 0, deleted: 0, modified: 0 });
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();
  
  const handleCompare = useCallback(() => {
    if (!a.trim() && !b.trim()) {
      setFeedback({ type: 'error', message: t('Please enter text to compare') });
      return;
    }

    setLoading(true);
    setDiffLines([]);
    setFeedback({ type: '', message: '' });
    setCurrentDiffIndex(-1);

    setTimeout(() => {
      try {
        const result = computeLineDiff(a, b, { ignoreWhitespace, caseSensitive });
        setDiffLines(result);

        // Calculate diff statistics
        const stats = result.reduce((acc, line) => {
          if (line.type === 'add') acc.added++;
          else if (line.type === 'del') acc.deleted++;
          else if (line.type === 'mod') acc.modified++;
          return acc;
        }, { added: 0, deleted: 0, modified: 0 });
        setDiffStats(stats);

        setFeedback({ type: 'success', message: t('Text comparison completed successfully') });
      } catch (error) {
        setFeedback({ type: 'error', message: t('Comparison failed, please try again') });
      }
      setLoading(false);
    }, 300);
  }, [a, b, ignoreWhitespace, caseSensitive, t]);

  const handleCopy = () => {
    if (diffLines.length > 0) {
      const text = diffLines.map(l => (l.type === 'eq' ? `  ${l.left}` : l.type === 'del' ? `- ${l.left}` : `+ ${l.right}`)).join('\n');
      copyToClipboard(text);
    }
  };

  const swapInputs = useCallback(() => {
    setA(b);
    setB(a);
    setDiffLines([]);
    setFeedback({ type: '', message: '' });
    setCurrentDiffIndex(-1);
    setDiffStats({ added: 0, deleted: 0, modified: 0 });
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
  
  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('Text Comparison')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('Text Comparison Tool')}
        </Typography>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardHeader title={t('Input and Options')} />
          <CardContent>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    value={a}
                    onChange={e => setA(e.target.value)}
                    label={t('Text 1')}
                    multiline
                    rows={8}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiInputBase-root': {
                        fontFamily: 'monospace',
                        fontSize: 12
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    value={b}
                    onChange={e => setB(e.target.value)}
                    label={t('Text 2')}
                    multiline
                    rows={8}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiInputBase-root': {
                        fontFamily: 'monospace',
                        fontSize: 12
                      }
                    }}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={ignoreWhitespace}
                        onChange={e => setIgnoreWhitespace(e.target.checked)}
                      />
                    }
                    label={t('Ignore Whitespace')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={caseSensitive}
                        onChange={e => setCaseSensitive(e.target.checked)}
                      />
                    }
                    label={t('Case Sensitive')}
                  />
                  <Tooltip title={t('Swap texts')}>
                    <IconButton onClick={swapInputs}>
                      <SwapHoriz />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Button
                  variant="contained"
                  onClick={handleCompare}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Compare />}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? t('Comparing...') : t('Compare')}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {feedback.message && (
          <Alert severity={feedback.type} sx={{ mb: 2 }}>
            {feedback.message}
          </Alert>
        )}

        <Card variant="outlined">
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h6">{t('Comparison Result')}</Typography>
                {diffStats.added + diffStats.deleted + diffStats.modified > 0 && (
                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      label={`+${diffStats.added}`}
                      sx={{ bgcolor: 'success.light', color: 'success.contrastText', fontSize: '0.75rem' }}
                    />
                    <Chip
                      size="small"
                      label={`-${diffStats.deleted}`}
                      sx={{ bgcolor: 'error.light', color: 'error.contrastText', fontSize: '0.75rem' }}
                    />
                    {diffStats.modified > 0 && (
                      <Chip
                        size="small"
                        label={`~${diffStats.modified}`}
                        sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', fontSize: '0.75rem' }}
                      />
                    )}
                  </Stack>
                )}
              </Stack>
            }
            action={
              <Stack direction="row" spacing={1}>
                {diffLines.length > 0 && diffStats.added + diffStats.deleted + diffStats.modified > 0 && (
                  <>
                    <Button
                      size="small"
                      onClick={() => navigateToDiff('prev')}
                      disabled={currentDiffIndex <= 0}
                      sx={{ minWidth: 'auto', px: 1 }}
                    >
                      ▲
                    </Button>
                    <Button
                      size="small"
                      onClick={() => navigateToDiff('next')}
                      disabled={currentDiffIndex >= diffLines.length - 1}
                      sx={{ minWidth: 'auto', px: 1 }}
                    >
                      ▼
                    </Button>
                  </>
                )}
                {diffLines.length > 0 && (
                  <Button size="small" onClick={handleCopy} startIcon={<ContentCopy />}>
                    {t('Copy')}
                  </Button>
                )}
              </Stack>
            }
          />
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
                <Stack alignItems="center" spacing={1}>
                  <CircularProgress />
                  <Typography>{t('Comparing texts, please wait...')}</Typography>
                </Stack>
              </Box>
            ) : diffLines.length > 0 ? (
              <Box sx={{ position: 'relative' }}>
                {/* Diff comparison area */}
                  <Box sx={{
                    display: 'flex',
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    maxHeight: 500,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                  {/* Left text */}
                  <Box sx={{
                    flex: 1,
                    borderRight: '2px solid',
                    borderColor: 'divider',
                    overflow: 'auto',
                    boxShadow: 'inset -1px 0 0 0 rgba(0,0,0,0.05)'
                  }}>
                    <Box sx={{
                      bgcolor: 'grey.50',
                      p: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}>
                      {t('Text 1')}
                    </Box>
                    <Box sx={{ fontFamily: 'monospace', fontSize: '13px' }}>
                      {diffLines.map((line, idx) => {
                        const isCurrentDiff = idx === currentDiffIndex;
                        const hasLeftContent = line.left !== '';
                        let bgColor = 'transparent';
                        let borderLeft = 'none';

                        if (line.type === 'del') {
                          bgColor = isCurrentDiff ? '#ffebee' : '#ffeef0';
                          borderLeft = '4px solid #f44336';
                        } else if (line.type === 'add') {
                          bgColor = 'transparent';
                        } else if (line.type !== 'eq') {
                          bgColor = isCurrentDiff ? '#fff3e0' : '#fff8e1';
                          borderLeft = '4px solid #ff9800';
                        }

                        if (isCurrentDiff && line.type !== 'eq') {
                          borderLeft = '5px solid #2196f3';
                        }

                        return (
                          <Box
                            key={idx}
                            data-diff-line={idx}
                            sx={{
                              display: 'flex',
                              backgroundColor: bgColor,
                              borderLeft,
                              minHeight: '22px',
                              '&:hover': {
                                bgcolor: line.type !== 'eq' ? (line.type === 'del' ? '#ffcdd2' : '#fff3e0') : 'grey.50'
                              }
                            }}
                          >
                            <Box sx={{
                              width: '40px',
                              textAlign: 'center',
                              userSelect: 'none',
                              color: 'text.secondary',
                              bgcolor: 'grey.100',
                              borderRight: '1px solid',
                              borderColor: 'divider',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px'
                            }}>
                              {hasLeftContent ? idx + 1 : ''}
                            </Box>
                            <Box sx={{
                              flex: 1,
                              p: '2px 8px',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-all'
                            }}>
                              {line.type === 'eq' || line.type === 'del' ? (
                                <Typography component="span" sx={{ fontSize: 'inherit' }}>
                                  {line.left || ' '}
                                </Typography>
                              ) : line.type === 'add' ? (
                                <Typography component="span" sx={{ color: 'grey.400', fontSize: 'inherit' }}>
                                  {/* Empty line placeholder */}
                                </Typography>
                              ) : (
                                diffWords(line.left, line.right)
                                  .filter(seg => seg.type !== 'add')
                                  .map((seg, i2) => (
                                    <DiffSegment key={i2} segment={seg} index={i2} />
                                  ))
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Right text */}
                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <Box sx={{
                      bgcolor: 'grey.50',
                      p: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}>
                      {t('Text 2')}
                    </Box>
                    <Box sx={{ fontFamily: 'monospace', fontSize: '13px' }}>
                      {diffLines.map((line, idx) => {
                        const isCurrentDiff = idx === currentDiffIndex;
                        const hasRightContent = line.right !== '';
                        let bgColor = 'transparent';
                        let borderLeft = 'none';

                        if (line.type === 'add') {
                          bgColor = isCurrentDiff ? '#e8f5e8' : '#f0f9f0';
                          borderLeft = '4px solid #4caf50';
                        } else if (line.type === 'del') {
                          bgColor = 'transparent';
                        } else if (line.type !== 'eq') {
                          bgColor = isCurrentDiff ? '#fff3e0' : '#fff8e1';
                          borderLeft = '4px solid #ff9800';
                        }

                        if (isCurrentDiff && line.type !== 'eq') {
                          borderLeft = '5px solid #2196f3';
                        }

                        return (
                          <Box
                            key={idx}
                            data-diff-line={idx}
                            sx={{
                              display: 'flex',
                              backgroundColor: bgColor,
                              borderLeft,
                              minHeight: '22px',
                              '&:hover': {
                                bgcolor: line.type !== 'eq' ? (line.type === 'add' ? '#c8e6c9' : '#fff3e0') : 'grey.50'
                              }
                            }}
                          >
                            <Box sx={{
                              width: '40px',
                              textAlign: 'center',
                              userSelect: 'none',
                              color: 'text.secondary',
                              bgcolor: 'grey.100',
                              borderRight: '1px solid',
                              borderColor: 'divider',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px'
                            }}>
                              {hasRightContent ? idx + 1 : ''}
                            </Box>
                            <Box sx={{
                              flex: 1,
                              p: '2px 8px',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-all'
                            }}>
                              {line.type === 'eq' || line.type === 'add' ? (
                                <Typography component="span" sx={{ fontSize: 'inherit' }}>
                                  {line.right || ' '}
                                </Typography>
                              ) : line.type === 'del' ? (
                                <Typography component="span" sx={{ color: 'grey.400', fontSize: 'inherit' }}>
                                  {/* Empty line placeholder */}
                                </Typography>
                              ) : (
                                diffWords(line.left, line.right)
                                  .filter(seg => seg.type !== 'del')
                                  .map((seg, i2) => (
                                    <DiffSegment key={i2} segment={seg} index={i2} />
                                  ))
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                  {t('Comparison result will appear here. Enter text in both fields and click compare.')}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Card>

      <CopySuccessAnimation
        visible={showAnimation}
        onAnimationEnd={handleAnimationEnd}
      />
    </>
  );
} 