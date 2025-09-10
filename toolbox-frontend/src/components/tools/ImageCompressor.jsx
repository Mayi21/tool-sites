import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card, CardContent, Typography, Button, Stack, Grid, Slider, Box, CardMedia, CardHeader
} from '@mui/material';
import { UploadFile, Compress, Download } from '@mui/icons-material';

const ImagePreviewCard = ({ title, imageSrc, size, reduction }) => (
  <Card variant="outlined">
    <CardHeader title={title} titleTypographyProps={{ variant: 'h6' }} />
    <CardContent>
      {imageSrc ? (
        <>
          <CardMedia
            component="img"
            src={imageSrc}
            alt={title}
            sx={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
          />
          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            {('Size')}: {formatFileSize(size)}
            {reduction && <><br />{('Reduction')}: {reduction}%</>}
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
          <Typography color="text.secondary">{('Compressed image will appear here')}</Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function ImageCompressor() {
  const { t } = useTranslation();
  const [quality, setQuality] = useState(80);
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(e.target.result);
        setOriginalSize(file.size);
        setCompressedImage(null);
        setCompressedSize(0);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function compressImage() {
    if (!originalImage) return;

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
      }, 'image/jpeg', quality / 100);
    };
    img.src = originalImage;
  }

  function downloadCompressed() {
    if (compressedImage) {
      const link = document.createElement('a');
      link.href = compressedImage;
      link.download = 'compressed-image.jpg';
      link.click();
    }
  }

  return (
    <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 2 }}>{t('Image Compressor')}</Typography>
      
      <Stack spacing={3}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
            <Button 
              variant="contained" 
              startIcon={<UploadFile />} 
              onClick={() => fileInputRef.current.click()}
              fullWidth
              size="large"
            >
              {t('Select Image')}
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
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
          </Grid>
        </Grid>
        
        {originalImage && (
          <Stack spacing={2}>
            <Button 
              variant="contained"
              onClick={compressImage} 
              startIcon={<Compress />}
              fullWidth
            >
              {t('Compress Image')}
            </Button>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <ImagePreviewCard title={t('Original Image')} imageSrc={originalImage} size={originalSize} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <ImagePreviewCard 
                  title={t('Compressed Image')} 
                  imageSrc={compressedImage} 
                  size={compressedSize}
                  reduction={originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0}
                />
                {compressedImage && (
                  <Button 
                    variant="contained"
                    onClick={downloadCompressed} 
                    startIcon={<Download />}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    {t('Download')}
                  </Button>
                )}
              </Grid>
            </Grid>
          </Stack>
        )}
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </Stack>
    </Card>
  );
} 