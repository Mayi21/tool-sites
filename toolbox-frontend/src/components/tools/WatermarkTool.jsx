import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, CardContent, TextField, Button, Grid, Slider, Box, Modal, Typography, Stack, Alert, CircularProgress, Tooltip
} from '@mui/material';
import { UploadFile, Download } from '@mui/icons-material';
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
  const [imageUrl, setImageUrl] = useState(null);
  const [watermarkText, setWatermarkText] = useState('Watermark');
  const [watermarkColor, setWatermarkColor] = useState('#000000');
  const [transparency, setTransparency] = useState(0.5);
  const [fontSize, setFontSize] = useState(24);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const base64Url = await getBase64(file);
      setImageUrl(base64Url);
      setFeedback({ type: 'success', message: t('watermarkTool.successUpload') });
    } catch (error) {
      setFeedback({ type: 'error', message: t('watermarkTool.failUpload') });
    } finally {
      setLoading(false);
    }
  };

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
    img.onerror = () => setFeedback({ type: 'error', message: t('watermarkTool.failProcess') });
  }, [imageUrl, watermarkText, watermarkColor, transparency, fontSize, t]);

  const handleDownload = () => {
    if (!imageUrl) {
      setFeedback({ type: 'warning', message: t('watermarkTool.warnUpload') });
      return;
    }
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = 'watermarked-image.png';
    link.click();
    setFeedback({ type: 'success', message: t('watermarkTool.successWatermark') });
  };

  const handleDoubleClickPreview = () => {
    if (!imageUrl) return;
    setPreviewUrl(canvasRef.current.toDataURL('image/png'));
    setPreviewOpen(true);
  };

  return (
    <>
      <Card sx={{ p: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>{t('watermarkTool.title')}</Typography>
        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
              <Button variant="outlined" onClick={() => fileInputRef.current.click()} startIcon={<UploadFile />} sx={{ p: 3, borderStyle: 'dashed' }}>
                {t('watermarkTool.upload')}
              </Button>
              <TextField label={t('watermarkTool.enterWatermark')} value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} multiline rows={2} fullWidth />
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography>{t('watermarkTool.color')}</Typography>
                <input type="color" value={watermarkColor} onChange={(e) => setWatermarkColor(e.target.value)} style={{ border: 'none', background: 'none', width: 40, height: 40, cursor: 'pointer' }} />
              </Stack>
              <Box>
                <Typography gutterBottom>{t('watermarkTool.transparency')} ({(transparency * 100).toFixed(0)}%)</Typography>
                <Slider value={transparency} min={0} max={1} step={0.01} onChange={(e, val) => setTransparency(val)} />
              </Box>
              <Box>
                <Typography gutterBottom>{t('watermarkTool.fontSize')} ({fontSize}px)</Typography>
                <Slider value={fontSize} min={12} max={128} step={1} onChange={(e, val) => setFontSize(val)} />
              </Box>
              <Button variant="contained" startIcon={<Download />} onClick={handleDownload} disabled={loading} fullWidth size="large">
                {loading ? <CircularProgress size={24} /> : t('watermarkTool.addWatermarkAndDownload')}
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md={16}>
            <Tooltip title={t('Double-click to preview')} arrow>
              <Box onDoubleClick={handleDoubleClickPreview} sx={{ width: '100%', height: 465, border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: imageUrl ? 'zoom-in' : 'default' }}>
                <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </Box>
            </Tooltip>
          </Grid>
        </Grid>
      </Card>
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <Box sx={modalStyle}>
          <img
            src={previewUrl}
            alt="preview"
            loading="lazy" // 添加懒加载优化
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
