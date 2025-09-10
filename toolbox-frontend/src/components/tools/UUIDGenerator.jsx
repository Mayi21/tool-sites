import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Typography, Button, Card, Grid, TextField, CircularProgress, Box, Alert, Stack, CardHeader, CardContent 
} from '@mui/material';
import { ContentCopy, Refresh } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function UUIDGenerator() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState('');
  const [count, setCount] = useState(10);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (generatedData) {
      copyToClipboard(generatedData);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setGeneratedData('');
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      let data = [];
      for (let i = 0; i < count; i++) {
        data.push(crypto.randomUUID());
      }
      setGeneratedData(data.join('\n'));
      setLoading(false);
      setFeedback({ type: 'success', message: t('UUIDs generated successfully') });
    }, 500);
  };

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('UUID Generator')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('Generate universally unique identifiers (UUIDs).')}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardHeader title={t('Generation Options')} />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  name="count"
                  label={t('Count')}
                  type="number"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
                  inputProps={{ min: 1, max: 5000 }}
                  required
                  fullWidth
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? t('Generating...') : t('Generate UUIDs')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </form>
        
        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

        <Card variant="outlined">
          <CardHeader 
            title={t('Generated UUIDs')} 
            action={
              generatedData && (
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
                  <Typography>{t('Generating UUIDs, please wait...')}</Typography>
                </Stack>
              </Box>
            ) : generatedData ? (
              <TextField 
                value={generatedData} 
                multiline
                readOnly 
                rows={12} 
                fullWidth
                variant="filled"
                sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: 12 } }}
              />
            ) : (
              <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  {t('Generated UUIDs will appear here. Configure options and click generate.')}
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