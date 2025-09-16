import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, CircularProgress, Box, Alert, Stack, CardHeader, CardContent,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { ContentCopy, Transform } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

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
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('toUnicode');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const modeOptions = [
    { label: t('Chinese to Unicode'), value: 'toUnicode' },
    { label: t('Unicode to Chinese'), value: 'fromUnicode' },
    { label: t('Chinese to Unicode Entity'), value: 'toEntity' },
    { label: t('Unicode Entity to Chinese'), value: 'fromEntity' }
  ];

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!input.trim()) {
      setFeedback({ type: 'error', message: t('Please enter text to convert') });
      return;
    }

    setLoading(true);
    setOutput('');
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        let result = '';
        switch (mode) {
          case 'toUnicode': result = chineseToUnicode(input); break;
          case 'fromUnicode': result = unicodeToChinese(input); break;
          case 'toEntity': result = chineseToUnicodeEntity(input); break;
          case 'fromEntity': result = unicodeEntityToChinese(input); break;
          default: break;
        }
        setOutput(result);
        setFeedback({ type: 'success', message: t('Conversion completed successfully') });
      } catch (e) {
        setFeedback({ type: 'error', message: t('Conversion failed: {{error}}', { error: e.message }) });
        setOutput('');
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const placeholderText =
    mode === 'toUnicode' ? t('Enter Chinese text to convert to Unicode') :
    mode === 'fromUnicode' ? t('Enter Unicode codes (e.g., \\u4e2d\\u6587)') :
    mode === 'toEntity' ? t('Enter Chinese text to convert to Unicode entities') :
    t('Enter Unicode entities (e.g., &#x4E2D;&#x6587;)');

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('Unicode Converter')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('Convert between Chinese characters and Unicode representations.')}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardHeader title={t('Conversion Options')} />
            <CardContent>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="mode-select-label">{t('Conversion Mode')}</InputLabel>
                  <Select
                    labelId="mode-select-label"
                    value={mode}
                    label={t('Conversion Mode')}
                    onChange={e => setMode(e.target.value)}
                    required
                  >
                    {modeOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField
                  name="inputText"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  label={t('Input Text')}
                  placeholder={placeholderText}
                  multiline
                  rows={4}
                  fullWidth
                  required
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: 'monospace',
                      fontSize: 14
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Transform />}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? t('Converting...') : t('Convert')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </form>

        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

        <Card variant="outlined">
          <CardHeader
            title={t('Converted Result')}
            action={
              output && (
                <Button size="small" onClick={handleCopy} startIcon={<ContentCopy />}>
                  {t('Copy')}
                </Button>
              )
            }
          />
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
                <Stack alignItems="center" spacing={1}>
                  <CircularProgress />
                  <Typography>{t('Converting text, please wait...')}</Typography>
                </Stack>
              </Box>
            ) : output ? (
              <TextField
                value={output}
                multiline
                readOnly
                rows={12}
                fullWidth
                variant="filled"
                sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: 12 } }}
              />
            ) : (
              <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  {t('Converted result will appear here. Select conversion mode and enter text to convert.')}
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