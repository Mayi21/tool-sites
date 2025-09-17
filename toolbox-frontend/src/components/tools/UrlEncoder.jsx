import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, Alert, Box, Stack, CardHeader, CardContent, CircularProgress,
  ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { ContentCopy, Transform, Link, LinkOff } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function UrlEncoder() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  const handleConvert = () => {
    if (!input.trim()) {
      setFeedback({ type: 'error', message: t('Please enter URL to convert') });
      return;
    }

    setLoading(true);
    setOutput('');
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        let result = '';
        if (mode === 'encode') {
          result = encodeURIComponent(input);
          setFeedback({ type: 'success', message: t('URL encoded successfully') });
        } else {
          result = decodeURIComponent(input);
          setFeedback({ type: 'success', message: t('URL decoded successfully') });
        }
        setOutput(result);
      } catch (e) {
        setFeedback({ type: 'error', message: t('Invalid input for URL conversion') });
        setOutput('');
      }
      setLoading(false);
    }, 300);
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
      setOutput('');
      setFeedback({ type: '', message: '' });
    }
  };

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('URL Encoder/Decoder')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('URL Encode/Decode Tool')}
        </Typography>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardHeader title={t('Input and Options')} />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                value={input}
                onChange={e => setInput(e.target.value)}
                multiline
                rows={6}
                label={t('Enter URL to encode or decode')}
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              />

              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <ToggleButtonGroup
                  value={mode}
                  exclusive
                  onChange={handleModeChange}
                  aria-label="conversion mode"
                >
                  <ToggleButton value="encode" aria-label="encode">
                    <Link sx={{ mr: 1 }} />
                    {t('Encode')}
                  </ToggleButton>
                  <ToggleButton value="decode" aria-label="decode">
                    <LinkOff sx={{ mr: 1 }} />
                    {t('Decode')}
                  </ToggleButton>
                </ToggleButtonGroup>

                <Button
                  variant="contained"
                  onClick={handleConvert}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Transform />}
                  disabled={loading || !input.trim()}
                  sx={{ minWidth: 140 }}
                >
                  {loading ? t('Converting...') : t('Convert')}
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
            title={t('Processing Results')}
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
                  <Typography>{t('Converting URL, please wait...')}</Typography>
                </Stack>
              </Box>
            ) : output ? (
              <TextField
                value={output}
                multiline
                readOnly
                rows={8}
                fullWidth
                variant="filled"
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: 12,
                    maxHeight: 240,
                    overflow: 'auto'
                  }
                }}
              />
            ) : (
              <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  {t('Converted URL will appear here. Enter URL and select encode or decode.')}
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