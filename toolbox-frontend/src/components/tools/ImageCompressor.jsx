import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, CircularProgress, Box, Alert, Stack, CardHeader, CardContent,
  Slider, Grid
} from '@mui/material';
import { UploadFile, Compress, Download } from '@mui/icons-material';

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function ImageCompressor() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(80);
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: t('Please select a valid image file') });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(e.target.result);
        setOriginalSize(file.size);
        setCompressedImage(null);
        setCompressedSize(0);
        setFeedback({ type: 'success', message: t('Image uploaded successfully') });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCompress = () => {
    if (!originalImage) {
      setFeedback({ type: 'error', message: t('Please upload an image first') });
      return;
    }

    setLoading(true);
    setCompressedImage(null);
    setCompressedSize(0);
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            const compressedUrl = URL.createObjectURL(blob);
            setCompressedImage(compressedUrl);
            setCompressedSize(blob.size);
            setLoading(false);
            const reduction = originalSize > 0 ? Math.round((1 - blob.size / originalSize) * 100) : 0;
            setFeedback({
              type: 'success',
              message: t('Image compressed successfully') + ` (${reduction}% ${t('reduction')})`
            });
          }, 'image/jpeg', quality / 100);
        };
        img.src = originalImage;
      } catch (error) {
        setLoading(false);
        setFeedback({ type: 'error', message: t('Image compression failed, please try again') });
      }
    }, 500);
  };

  const downloadCompressed = () => {
    if (compressedImage) {
      const link = document.createElement('a');
      link.href = compressedImage;
      link.download = 'compressed-image.jpg';
      link.click();
    }
  };

  const reduction = originalSize > 0 && compressedSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('Image Compressor')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('Online Image Compressor')}
        </Typography>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardHeader title={t('Input and Options')} />
          <CardContent>
            <Stack spacing={3}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
              <Button
                variant="outlined"
                startIcon={<UploadFile />}
                onClick={() => fileInputRef.current.click()}
                fullWidth
                size="large"
              >
                {t('Select Image')}
              </Button>

              <Box>
                <Typography gutterBottom>{t('Quality')}: {quality}%</Typography>
                <Slider
                  value={quality}
                  onChange={(e, newValue) => setQuality(newValue)}
                  aria-labelledby="quality-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  min={10}
                  max={100}
                />
              </Box>

              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Compress />}
                disabled={loading || !originalImage}
                onClick={handleCompress}
                fullWidth
              >
                {loading ? t('Processing...') : t('Process')}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

        <Card variant="outlined">
          <CardHeader
            title={t('Processing Results')}
            action={
              compressedImage && (
                <Button size="small" onClick={downloadCompressed} startIcon={<Download />}>
                  {t('Download')}
                </Button>
              )
            }
          />
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Stack alignItems="center" spacing={1}>
                  <CircularProgress />
                  <Typography>{t('Processing text, please wait...')}</Typography>
                </Stack>
              </Box>
            ) : originalImage ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader title={t('Original Image')} titleTypographyProps={{ variant: 'h6' }} />
                    <CardContent>
                      <img
                        src={originalImage}
                        alt="Original"
                        style={{
                          width: '100%',
                          maxHeight: 300,
                          objectFit: 'contain',
                          borderRadius: 4
                        }}
                      />
                      <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                        {t('Size')}: {formatFileSize(originalSize)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader title={t('Compressed Image')} titleTypographyProps={{ variant: 'h6' }} />
                    <CardContent>
                      {compressedImage ? (
                        <>
                          <img
                            src={compressedImage}
                            alt="Compressed"
                            style={{
                              width: '100%',
                              maxHeight: 300,
                              objectFit: 'contain',
                              borderRadius: 4
                            }}
                          />
                          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                            {t('Size')}: {formatFileSize(compressedSize)}
                            <br />
                            {t('Reduction')}: {reduction}%
                          </Typography>
                        </>
                      ) : (
                        <Box sx={{
                          height: 300,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px dashed',
                          borderColor: 'divider',
                          borderRadius: 1
                        }}>
                          <Typography color="text.secondary">
                            {t('Compressed image will appear here after compression')}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  {t('Processing results will appear here. Enter text above and select an operation.')}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </Card>
    </>
  );
} 