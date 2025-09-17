import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, Alert, Box, Stack, CardHeader, CardContent, CircularProgress,
  ToggleButton, ToggleButtonGroup, Chip
} from '@mui/material';
import { ContentCopy, AccessTime, CalendarToday, Transform } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function TimestampConverter() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('toTimestamp');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [currentTime, setCurrentTime] = useState(Date.now());
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  const handleConvert = () => {
    if (!input.trim()) {
      setFeedback({ type: 'error', message: t('Please enter input to convert') });
      return;
    }

    setLoading(true);
    setOutput('');
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        let result = '';
        if (mode === 'toDate') {
          // Convert timestamp to date
          const ts = parseInt(input.length > 10 ? input : input + '000');
          if (isNaN(ts)) {
            throw new Error('Invalid timestamp');
          }
          result = new Date(ts).toLocaleString();
          setFeedback({ type: 'success', message: t('Timestamp converted successfully') });
        } else {
          // Convert date to timestamp
          const dateObj = new Date(input);
          if (isNaN(dateObj.getTime())) {
            throw new Error('Invalid date');
          }
          result = dateObj.getTime().toString();
          setFeedback({ type: 'success', message: t('Date converted successfully') });
        }
        setOutput(result);
      } catch (e) {
        setFeedback({ type: 'error', message: t('Invalid input format') });
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

  const handleCopyCurrentTimestamp = () => {
    copyToClipboard(currentTime.toString());
  };

  const handleCopyCurrentDate = () => {
    copyToClipboard(new Date(currentTime).toLocaleString());
  };

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('Timestamp Converter')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('Convert between Unix timestamps and human-readable dates bidirectionally.')}
        </Typography>

        {/* Current Time Display */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip
            icon={<AccessTime />}
            label={`${t('Current Timestamp')}: ${currentTime}`}
            variant="outlined"
            clickable
            onClick={handleCopyCurrentTimestamp}
            sx={{
              fontFamily: 'monospace',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText'
              }
            }}
            title={t('Click to copy timestamp')}
          />
          <Chip
            icon={<CalendarToday />}
            label={`${t('Current Date')}: ${new Date(currentTime).toLocaleString()}`}
            variant="outlined"
            clickable
            onClick={handleCopyCurrentDate}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText'
              }
            }}
            title={t('Click to copy date')}
          />
        </Box>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardHeader title={t('Input')} />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                value={input}
                onChange={e => setInput(e.target.value)}
                label={mode === 'toDate' ? t('Enter timestamp') : t('Enter date')}
                placeholder={mode === 'toDate' ? '1640995200000' : '2022-01-01 12:00:00'}
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: mode === 'toDate' ? 'monospace' : 'inherit',
                    fontSize: 12
                  }
                }}
              />

              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <ToggleButtonGroup
                  value={mode}
                  exclusive
                  onChange={handleModeChange}
                  aria-label="conversion mode"
                >
                  <ToggleButton value="toDate" aria-label="timestamp to date">
                    <AccessTime sx={{ mr: 1 }} />
                    {t('To Date')}
                  </ToggleButton>
                  <ToggleButton value="toTimestamp" aria-label="date to timestamp">
                    <CalendarToday sx={{ mr: 1 }} />
                    {t('To Timestamp')}
                  </ToggleButton>
                </ToggleButtonGroup>

                <Button
                  variant="contained"
                  onClick={handleConvert}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Transform />}
                  disabled={loading || !input.trim()}
                  sx={{ minWidth: 120 }}
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
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
                <Stack alignItems="center" spacing={1}>
                  <CircularProgress />
                  <Typography>{t('Converting timestamp, please wait...')}</Typography>
                </Stack>
              </Box>
            ) : output ? (
              <TextField
                value={output}
                multiline
                readOnly
                rows={4}
                fullWidth
                variant="filled"
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: 14,
                    textAlign: 'center'
                  }
                }}
              />
            ) : (
              <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                  {mode === 'toDate'
                    ? t('Converted date will appear here. Enter timestamp and click convert.')
                    : t('Converted timestamp will appear here. Enter date and click convert.')
                  }
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