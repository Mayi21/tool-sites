import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, CircularProgress, Box, Alert, Stack, CardHeader, CardContent,
  Select, MenuItem, FormControl, InputLabel, Grid
} from '@mui/material';
import { ContentCopy, Palette } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

// Color conversion logic
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0');
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export default function ColorConverter() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [inputColor, setInputColor] = useState('#ff6b6b');
  const [convertedColors, setConvertedColors] = useState('');
  const [inputFormat, setInputFormat] = useState('hex');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (convertedColors) {
      copyToClipboard(convertedColors);
    }
  };

  const generateRandomColor = () => {
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setInputColor(randomHex);
    setInputFormat('hex');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!inputColor.trim()) {
      setFeedback({ type: 'error', message: t('Please enter a color value to convert') });
      return;
    }

    setLoading(true);
    setConvertedColors('');
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        let rgb;

        if (inputFormat === 'hex') {
          rgb = hexToRgb(inputColor);
          if (!rgb) throw new Error('Invalid HEX format');
        } else if (inputFormat === 'rgb') {
          const parts = inputColor.replace(/[^\d,]/g, '').split(',').map(s => parseInt(s.trim()));
          if (parts.length !== 3 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
            throw new Error('Invalid RGB format');
          }
          rgb = { r: parts[0], g: parts[1], b: parts[2] };
        } else if (inputFormat === 'hsl') {
          const parts = inputColor.replace(/[^\d,]/g, '').split(',').map(s => parseInt(s.trim()));
          if (parts.length !== 3 || parts.some(p => isNaN(p))) {
            throw new Error('Invalid HSL format');
          }
          rgb = hslToRgb(parts[0], parts[1], parts[2]);
        }

        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        const results = [
          `HEX: ${hex}`,
          `RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
          `HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
          `RGB Values: ${rgb.r}, ${rgb.g}, ${rgb.b}`,
          `HSL Values: ${hsl.h}, ${hsl.s}, ${hsl.l}`
        ];

        setConvertedColors(results.join('\n'));
        setLoading(false);
        setFeedback({ type: 'success', message: t('Color conversion completed successfully') });
      } catch (error) {
        setConvertedColors('');
        setLoading(false);
        setFeedback({ type: 'error', message: error.message || t('Color conversion failed, please check your input format') });
      }
    }, 500);
  };

  const getPreviewColor = () => {
    try {
      if (inputFormat === 'hex') {
        return inputColor;
      } else if (inputFormat === 'rgb') {
        const parts = inputColor.replace(/[^\d,]/g, '').split(',').map(s => parseInt(s.trim()));
        if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
          return rgbToHex(parts[0], parts[1], parts[2]);
        }
      } else if (inputFormat === 'hsl') {
        const parts = inputColor.replace(/[^\d,]/g, '').split(',').map(s => parseInt(s.trim()));
        if (parts.length === 3 && parts.every(p => !isNaN(p))) {
          const rgb = hslToRgb(parts[0], parts[1], parts[2]);
          return rgbToHex(rgb.r, rgb.g, rgb.b);
        }
      }
    } catch (e) {
      // Return default color if parsing fails
    }
    return '#ff6b6b';
  };

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('Color Converter')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('RGB/HEX/HSL Converter')}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardHeader title={t('Input and Options')} />
            <CardContent>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="input-format-label">{t('Input Format')}</InputLabel>
                  <Select
                    labelId="input-format-label"
                    value={inputFormat}
                    label={t('Input Format')}
                    onChange={(e) => setInputFormat(e.target.value)}
                  >
                    <MenuItem value="hex">HEX</MenuItem>
                    <MenuItem value="rgb">RGB</MenuItem>
                    <MenuItem value="hsl">HSL</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{
                  width: '100%',
                  height: 80,
                  backgroundColor: getPreviewColor(),
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  {getPreviewColor()}
                </Box>

                <TextField
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  label={
                    inputFormat === 'hex' ? t('Enter text to process') :
                    inputFormat === 'rgb' ? t('Enter text to process') :
                    t('Enter text to process')
                  }
                  fullWidth
                  variant="outlined"
                  placeholder={
                    inputFormat === 'hex' ? '#ff6b6b' :
                    inputFormat === 'rgb' ? '255, 107, 107' :
                    '0, 100, 67'
                  }
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Palette />}
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? t('Processing...') : t('Convert')}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      startIcon={<Palette />}
                      onClick={generateRandomColor}
                      fullWidth
                    >
                      {t('Random Color')}
                    </Button>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </form>

        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

        <Card variant="outlined">
          <CardHeader
            title={t('Converted Colors')}
            action={
              convertedColors && (
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
                  <Typography>{t('Processing text, please wait...')}</Typography>
                </Stack>
              </Box>
            ) : convertedColors ? (
              <TextField
                value={convertedColors}
                multiline
                readOnly
                rows={8}
                fullWidth
                variant="filled"
                sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: 12 } }}
              />
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