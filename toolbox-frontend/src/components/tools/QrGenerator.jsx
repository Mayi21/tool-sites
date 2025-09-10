import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card, CardContent, Typography, TextField, Button, Stack, Grid, Box, Alert
} from '@mui/material';
import { QrCode2, Download } from '@mui/icons-material';

export default function QrGenerator() {
  const { t } = useTranslation();
  const [text, setText] = useState('https://example.com');
  const [size, setSize] = useState(200);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');

  function generateQR() {
    if (!text) {
      setError(t('Please enter text or URL'));
      setQrCodeUrl('');
      return;
    }
    setError('');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
    setQrCodeUrl(qrUrl);
  }

  function downloadQR() {
    if (qrCodeUrl) {
      // To bypass CORS issues with direct download, fetch as blob and create object URL
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
        }).catch(() => setError(t('Failed to download QR code')));
    }
  }

  return (
    <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 2 }}>{t('QR Code Generator')}</Typography>
      
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField 
              label={t('Enter text or URL')}
              value={text} 
              onChange={e => setText(e.target.value)} 
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label={t('Size')}
              value={size}
              onChange={e => setSize(Number(e.target.value))}
              type="number"
              inputProps={{ min: 100, max: 500, step: 10 }}
              fullWidth
              variant="outlined"
            />
          </Grid>
        </Grid>
        
        <Button variant="contained" onClick={generateQR} startIcon={<QrCode2 />}>
          {t('Generate QR Code')}
        </Button>

        {error && <Alert severity="error">{error}</Alert>}
        
        {qrCodeUrl && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>{t('Generated QR Code')}</Typography>
              <Box sx={{ textAlign: 'center', my: 2 }}>
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  style={{ border: '1px solid #d9d9d9', borderRadius: 8 }}
                />
              </Box>
              
              <Button 
                variant="contained" 
                onClick={downloadQR} 
                startIcon={<Download />}
                fullWidth
              >
                {t('Download QR Code')}
              </Button>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Card>
  );
} 