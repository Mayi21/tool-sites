import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card, Typography, TextField, Button, Stack, Grid, Select, MenuItem, FormControl, InputLabel, Alert
} from '@mui/material';
import { ContentCopy, SwapHoriz, Clear } from '@mui/icons-material';
import CopySuccessAnimation from '../CopySuccessAnimation';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';

// Conversion logic remains the same
function chineseToUnicode(text) {
  return text.split('').map(char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`).join('');
}
function unicodeToChinese(text) {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
}
function chineseToUnicodeEntity(text) {
  return text.split('').map(char => `&#x${char.charCodeAt(0).toString(16).toUpperCase()};`).join('');
}
function unicodeEntityToChinese(text) {
  return text.replace(/&#x([0-9a-fA-F]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export default function UnicodeConverter() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('toUnicode');
  const [error, setError] = useState(null);
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const modeOptions = [
    { label: t('Chinese to Unicode'), value: 'toUnicode' },
    { label: t('Unicode to Chinese'), value: 'fromUnicode' },
    { label: t('Chinese to Unicode Entity'), value: 'toEntity' },
    { label: t('Unicode Entity to Chinese'), value: 'fromEntity' }
  ];

  function handleConvert() {
    try {
      setError(null);
      let result = '';
      switch (mode) {
        case 'toUnicode': result = chineseToUnicode(input); break;
        case 'fromUnicode': result = unicodeToChinese(input); break;
        case 'toEntity': result = chineseToUnicodeEntity(input); break;
        case 'fromEntity': result = unicodeEntityToChinese(input); break;
        default: break;
      }
      setOutput(result);
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }

  async function copyOutput() {
    if (output) await copyToClipboard(output);
  }

  function clearAll() {
    setInput('');
    setOutput('');
    setError(null);
  }

  function swapContent() {
    if (output) {
      setInput(output);
      setOutput('');
      setError(null);
    }
  }

  const placeholderText =
    mode === 'toUnicode' ? t('Enter Chinese text to convert to Unicode') :
    mode === 'fromUnicode' ? t('Enter Unicode codes (e.g., \\u4e2d\\u6587)') :
    mode === 'toEntity' ? t('Enter Chinese text to convert to Unicode entities') :
    t('Enter Unicode entities (e.g., &#x4E2D;&#x6587;)');

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>{t('Chinese ↔ Unicode Converter')}</Typography>
        <Stack spacing={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="mode-select-label">{t('Conversion Mode')}</InputLabel>
                  <Select labelId="mode-select-label" value={mode} label={t('Conversion Mode')} onChange={e => setMode(e.target.value)}>
                    {modeOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField value={input} onChange={e => setInput(e.target.value)} multiline rows={8} label={t('Input')} placeholder={placeholderText} fullWidth />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{mode.includes('to') ? t('Unicode Result') : t('Chinese Result')}</Typography>
                  {output && <Button size="small" onClick={copyOutput} startIcon={<ContentCopy />}>{t('Copy')}</Button>}
                </Stack>
                <TextField value={output} InputProps={{ readOnly: true }} multiline rows={8} label={t('Result')} placeholder={t('Result will appear here')} variant="filled" fullWidth sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace' } }} />
              </Stack>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} justifyContent="center">
            <Button variant="contained" onClick={handleConvert} size="large">{t('Convert')}</Button>
            <Button variant="outlined" startIcon={<SwapHoriz />} onClick={swapContent} disabled={!output}>{t('Swap')}</Button>
            <Button variant="outlined" startIcon={<Clear />} onClick={clearAll}>{t('Clear')}</Button>
          </Stack>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Stack>
      </Card>
      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </>
  );
} 