import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, Alert, Stack, CardHeader, CardContent, Box,
  ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { ContentCopy, Transform } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function Base64Tool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [processing, setProcessing] = useState(false);

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  const handleConvert = () => {
    if (!input.trim()) {
      setFeedback({ type: 'error', message: t('Please enter text to convert') });
      return;
    }

    setProcessing(true);
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        let result = '';
        if (mode === 'encode') {
          result = btoa(unescape(encodeURIComponent(input)));
          setFeedback({ type: 'success', message: t('Text encoded successfully') });
        } else {
          result = decodeURIComponent(escape(atob(input)));
          setFeedback({ type: 'success', message: t('Text decoded successfully') });
        }
        setOutput(result);
      } catch (e) {
        setFeedback({ type: 'error', message: e.message || t('Invalid input for decoding') });
        setOutput('');
      }
      setProcessing(false);
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
        <Typography variant="h5" component="h1">{t('Base64 Encoder/Decoder')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('Encode text to Base64 or decode Base64 to text.')}
        </Typography>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardHeader title={t('Input Text')} />
          <CardContent>
            <TextField
              value={input}
              onChange={e => setInput(e.target.value)}
              multiline
              rows={8}
              label={t('Enter text to encode or decode')}
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
                  {t('Encode')}
                </ToggleButton>
                <ToggleButton value="decode" aria-label="decode">
                  {t('Decode')}
                </ToggleButton>
              </ToggleButtonGroup>

              <Button
                variant="contained"
                onClick={handleConvert}
                startIcon={<Transform />}
                disabled={processing || !input.trim()}
                sx={{ minWidth: 140 }}
              >
                {processing ? t('Converting...') : t('Convert')}
              </Button>
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
            {output ? (
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
                    maxHeight: 200,
                    overflow: 'auto'
                  }
                }}
              />
            ) : (
              <Box sx={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  {t('Converted result will appear here. Enter text and click convert.')}
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