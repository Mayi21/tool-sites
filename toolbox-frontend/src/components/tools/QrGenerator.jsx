import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, CircularProgress, Box, Alert, Stack, CardHeader, CardContent
} from '@mui/material';
import { QrCode2, Download, ContentCopy } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function QrGenerator() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (text) {
      copyToClipboard(text);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!text.trim()) {
      setFeedback({ type: 'error', message: t('Please enter text or URL to generate QR code') });
      return;
    }

    setLoading(true);
    setQrCodeUrl('');
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
        setQrCodeUrl(qrUrl);
        setLoading(false);
        setFeedback({ type: 'success', message: t('QR code generated successfully') });
      } catch (error) {
        setQrCodeUrl('');
        setLoading(false);
        setFeedback({ type: 'error', message: t('QR code generation failed, please try again') });
      }
    }, 500);
  };

  const downloadQR = () => {
    if (qrCodeUrl) {
      fetch(qrCodeUrl)
        .then(response => response.blob())
        .then(blob => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'qrcode.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }).catch(() => setFeedback({ type: 'error', message: t('Failed to download QR code') }));
    }
  };

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('QR Code Generator')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('QR Code Generator Tool')}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardHeader title={t('Input and Options')} />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  label={t('Enter text to process')}
                  fullWidth
                  variant="outlined"
                  placeholder={t('Paste or type your text here for processing...')}
                />

                <TextField
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value) || 200)}
                  label={t('Size')}
                  type="number"
                  inputProps={{ min: 100, max: 500, step: 10 }}
                  fullWidth
                  variant="outlined"
                />

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <QrCode2 />}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? t('Processing...') : t('Generate')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </form>

        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

        <Card variant="outlined">
          <CardHeader
            title={t('Processing Results')}
            action={
              qrCodeUrl && (
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={handleCopy} startIcon={<ContentCopy />}>
                    {t('Copy Text')}
                  </Button>
                  <Button size="small" onClick={downloadQR} startIcon={<Download />}>
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
                  <Typography>{t('Processing text, please wait...')}</Typography>
                </Stack>
              </Box>
            ) : qrCodeUrl ? (
              <Box sx={{ textAlign: 'center', minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  loading="lazy"
                  style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: 8,
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: '400px'
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  {t('Processing results will appear here. Enter text above and select an operation.')}
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