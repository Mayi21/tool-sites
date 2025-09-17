import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, Alert, Box, Stack, CardHeader, CardContent, CircularProgress
} from '@mui/material';
import { ContentCopy, Download, FormatAlignLeft, Compress } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function JsonFormatter() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  function formatJson() {
    setLoading(true);
    setError(null);
    setOutput('');
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 2);
        setOutput(formatted);
        setFeedback({ type: 'success', message: t('JSON formatted successfully') });
      } catch (e) {
        setError(t('Invalid JSON format'));
        setOutput('');
      }
      setLoading(false);
    }, 300);
  }

  function minifyJson() {
    setLoading(true);
    setError(null);
    setOutput('');
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        setOutput(minified);
        setFeedback({ type: 'success', message: t('JSON minified successfully') });
      } catch (e) {
        setError(t('Invalid JSON format'));
        setOutput('');
      }
      setLoading(false);
    }, 300);
  }

  async function copyToClipboardHandler() {
    if (output) {
      await copyToClipboard(output);
    }
  }

  function downloadJson() {
    if (output) {
      const blob = new Blob([output], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formatted.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('JSON Formatter')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('JSON Format/Minify Tool')}
        </Typography>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardHeader title={t('Input and Options')} />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                value={input}
                onChange={e => setInput(e.target.value)}
                multiline
                rows={8}
                label={t('Enter JSON to format')}
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: 12
                  }
                }}
              />

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={formatJson}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FormatAlignLeft />}
                  disabled={loading || !input.trim()}
                  fullWidth
                >
                  {loading ? t('Processing...') : t('Format')}
                </Button>

                <Button
                  variant="outlined"
                  onClick={minifyJson}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Compress />}
                  disabled={loading || !input.trim()}
                  fullWidth
                >
                  {loading ? t('Processing...') : t('Minify')}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {feedback.message && (
          <Alert severity={feedback.type} sx={{ mb: 2 }}>
            {feedback.message}
          </Alert>
        )}

        <Card variant="outlined">
          <CardHeader
            title={t('Processing Results')}
            action={
              output && (
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={copyToClipboardHandler} startIcon={<ContentCopy />}>
                    {t('Copy')}
                  </Button>
                  <Button size="small" onClick={downloadJson} startIcon={<Download />}>
                    {t('Download')}
                  </Button>
                </Stack>
              )
            }
          />
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
                <Stack alignItems="center" spacing={1}>
                  <CircularProgress />
                  <Typography>{t('Processing JSON, please wait...')}</Typography>
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
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: 12,
                    maxHeight: 400,
                    overflow: 'auto'
                  }
                }}
              />
            ) : (
              <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  {t('Formatted JSON will appear here. Enter valid JSON and click Format or Minify.')}
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