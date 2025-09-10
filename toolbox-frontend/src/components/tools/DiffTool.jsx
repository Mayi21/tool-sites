import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card, CardContent, Typography, TextField, Button, Stack, Grid, Switch, Tooltip, FormControlLabel, Box, Paper, IconButton
} from '@mui/material';
import { ContentCopy, Difference, SwapHoriz } from '@mui/icons-material';
import CopySuccessAnimation from '../CopySuccessAnimation';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';

// Core diffing logic remains the same
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

function diffChars(a, b) {
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
      if (bi < bLines.length) push('add', bArr[bi++]);
    }
  }
  return out;
}

export default function DiffTool() {
  const { t } = useTranslation();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [diffLines, setDiffLines] = useState([]);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();
  
  const handleCompare = () => {
    setDiffLines(computeLineDiff(a, b, { ignoreWhitespace, caseSensitive }));
  };

  async function copyDiff() {
    if (!diffLines.length) return;
    const text = diffLines.map(l => (l.type === 'eq' ? `  ${l.left}` : l.type === 'del' ? `- ${l.left}` : `+ ${l.right}`)).join('\n');
    await copyToClipboard(text);
  }

  const swapInputs = () => { setA(b); setB(a); setDiffLines([]); };
  
  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>{t('Text Comparison')}</Typography>
        
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField value={a} onChange={e => setA(e.target.value)} multiline rows={8} label={t('Text 1')} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField value={b} onChange={e => setB(e.target.value)} multiline rows={8} label={t('Text 2')} fullWidth />
            </Grid>
          </Grid>
          
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Button variant="contained" startIcon={<Difference />} onClick={handleCompare}>{t('Compare')}</Button>
            <Tooltip title={t('Swap')}>
              <IconButton onClick={swapInputs}><SwapHoriz /></IconButton>
            </Tooltip>
            <FormControlLabel control={<Switch checked={ignoreWhitespace} onChange={e => setIgnoreWhitespace(e.target.checked)} />} label={t('Ignore Whitespace')} />
            <FormControlLabel control={<Switch checked={caseSensitive} onChange={e => setCaseSensitive(e.target.checked)} />} label={t('Case Sensitive')} />
          </Stack>
          
          {diffLines.length > 0 && (
            <Paper variant="outlined">
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">{t('Diff Result')}</Typography>
                <Button size="small" onClick={copyDiff} startIcon={<ContentCopy />}>{t('Copy')}</Button>
              </Stack>
              <Box sx={{ display: 'flex', gap: 1, maxHeight: 400, overflow: 'auto', p: 1 }}>
                {[0, 1].map(col => (
                  <Box key={col} sx={{ flex: 1, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>
                    {diffLines.map((line, idx) => {
                      const content = col === 0 ? line.left : line.right;
                      const type = line.type;
                      const bg = type === 'eq' ? 'transparent' : (col === 0 && type === 'del') || (col === 1 && type === 'add') ? 'rgba(255,0,0,0.08)' : (type !== 'eq' ? 'rgba(255,165,0,0.08)' : 'transparent');
                      const charDiff = type === 'eq' ? [{ type: 'eq', text: content }] : diffChars(line.left, line.right);
                      return (
                        <Box key={idx} sx={{ display: 'flex', backgroundColor: bg }}>
                          <Box sx={{ width: '20px', textAlign: 'center', userSelect: 'none', color: 'text.secondary' }}>{idx + 1}</Box>
                          <Box component="code" sx={{ flex: 1 }}>
                            {charDiff
                              .filter(seg => (col === 0 ? seg.type !== 'add' : seg.type !== 'del'))
                              .map((seg, i2) => (
                                <Typography component="span" key={i2} sx={{
                                  backgroundColor: seg.type === 'eq' ? 'transparent' : (seg.type === 'add' ? 'rgba(82,196,26,0.2)' : 'rgba(255,77,79,0.2)')
                                }}>{seg.text}</Typography>
                              ))}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Stack>
      </Card>
      
      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </>
  );
} 