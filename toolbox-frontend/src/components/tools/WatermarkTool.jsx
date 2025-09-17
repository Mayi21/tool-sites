import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, CircularProgress, Box, Alert, Stack, CardHeader, CardContent,
  Slider, Grid, Modal
} from '@mui/material';
import { UploadFile, Download, Preview } from '@mui/icons-material';
import { getBase64 } from '../../utils/imageUtils';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80vw',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
};

export default function WatermarkTool() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [watermarkText, setWatermarkText] = useState('Watermark');
  const [watermarkColor, setWatermarkColor] = useState('#000000');
  const [transparency, setTransparency] = useState(0.5);
  const [fontSize, setFontSize] = useState(24);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: t('Please select a valid image file') });
      return;
    }

    setLoading(true);
    try {
      const base64Url = await getBase64(file);
      setImageUrl(base64Url);
      setFeedback({ type: 'success', message: t('Image uploaded successfully') });
    } catch (error) {
      setFeedback({ type: 'error', message: t('Image upload failed, please try again') });
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = () => {
    if (!imageUrl) {
      setFeedback({ type: 'error', message: t('Please upload an image first') });
      return;
    }

    setLoading(true);
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          if (watermarkText.trim()) {
            const rgbaColor = `rgba(${parseInt(watermarkColor.slice(1, 3), 16)}, ${parseInt(watermarkColor.slice(3, 5), 16)}, ${parseInt(watermarkColor.slice(5, 7), 16)}, ${transparency})`;
            ctx.fillStyle = rgbaColor;
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);
          }

          setLoading(false);
          setFeedback({ type: 'success', message: t('Watermark applied successfully') });
        };
        img.onerror = () => {
          setLoading(false);
          setFeedback({ type: 'error', message: t('Image processing failed, please try again') });
        };
      } catch (error) {
        setLoading(false);
        setFeedback({ type: 'error', message: t('Watermark processing failed, please try again') });
      }
    }, 500);
  };

  const handleDownload = () => {
    if (!imageUrl) {
      setFeedback({ type: 'error', message: t('Please upload an image first') });
      return;
    }
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = 'watermarked-image.png';
    link.click();
    setFeedback({ type: 'success', message: t('Watermarked image downloaded successfully') });
  };

  const handlePreview = () => {
    if (!imageUrl) return;
    setPreviewUrl(canvasRef.current.toDataURL('image/png'));
    setPreviewOpen(true);
  };

  // Apply watermark automatically when parameters change
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      if (watermarkText.trim()) {
        const rgbaColor = `rgba(${parseInt(watermarkColor.slice(1, 3), 16)}, ${parseInt(watermarkColor.slice(3, 5), 16)}, ${parseInt(watermarkColor.slice(5, 7), 16)}, ${transparency})`;
        ctx.fillStyle = rgbaColor;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);
      }
    };
  }, [imageUrl, watermarkText, watermarkColor, transparency, fontSize]);

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('Image Watermark')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('Add watermark to image')}
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

              <TextField
                label={t('Enter text to process')}
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                fullWidth
                variant="outlined"
                placeholder={t('Paste or type your text here for processing...')}
              />

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <Typography>{t('Color')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <input
                    type="color"
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'none',
                      width: 60,
                      height: 40,
                      cursor: 'pointer',
                      borderRadius: 4
                    }}
                  />
                </Grid>
              </Grid>

              <Box>
                <Typography gutterBottom>
                  {t('Opacity')}: {(transparency * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={transparency}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(e, val) => setTransparency(val)}
                />
              </Box>

              <Box>
                <Typography gutterBottom>
                  {t('Font Size')}: {fontSize}px
                </Typography>
                <Slider
                  value={fontSize}
                  min={12}
                  max={128}
                  step={1}
                  onChange={(e, val) => setFontSize(val)}
                />
              </Box>

              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UploadFile />}
                disabled={loading || !imageUrl}
                onClick={handleProcess}
                fullWidth
              >
                {loading ? t('Processing...') : t('Apply Watermark')}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

        <Card variant="outlined">
          <CardHeader
            title={t('Watermarked Image')}
            action={
              imageUrl && (
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={handlePreview} startIcon={<Preview />}>
                    {t('Preview')}
                  </Button>
                  <Button size="small" onClick={handleDownload} startIcon={<Download />}>
                    {t('Download')}
                  </Button>
                </Stack>
              )
            }
          />
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Stack alignItems="center" spacing={1}>
                  <CircularProgress />
                  <Typography>{t('Processing watermark, please wait...')}</Typography>
                </Stack>
              </Box>
            ) : imageUrl ? (
              <Box sx={{
                width: '100%',
                minHeight: 400,
                border: '1px dashed',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: 'pointer',
                borderRadius: 1
              }}>
                <canvas
                  ref={canvasRef}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  {t('Processing results will appear here. Enter text above and select an operation.')}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Card>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <Box sx={modalStyle}>
          <img
            src={previewUrl}
            alt="preview"
            loading="lazy"
            style={{
              width: '100%',
              maxHeight: '80vh',
              objectFit: 'contain'
            }}
          />
        </Box>
      </Modal>
    </>
  );
}
