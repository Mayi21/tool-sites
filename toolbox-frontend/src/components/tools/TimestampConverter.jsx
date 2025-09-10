import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card, Typography, TextField, Button, Stack, Grid, Paper, Box, InputAdornment, IconButton, Alert
} from '@mui/material';
import { ContentCopy, Schedule, Update } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';
import CopySuccessAnimation from '../CopySuccessAnimation';

const StatisticDisplay = ({ title, value, icon }) => (
  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
      {icon}
      <Typography variant="h6" color="text.secondary">{title}</Typography>
    </Stack>
    <Typography variant="h5" sx={{ mt: 1, fontFamily: 'monospace' }}>{value}</Typography>
  </Paper>
);

export default function TimestampConverter() {
  const { t } = useTranslation();
  const [timestamp, setTimestamp] = useState('');
  const [date, setDate] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [error, setError] = useState(null);
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  function convertTimestampToDate() {
    if (!timestamp) return;
    const ts = parseInt(timestamp.length > 10 ? timestamp : timestamp + '000'); // Handle seconds and ms
    if (isNaN(ts)) {
      setError(t('Invalid timestamp'));
      return;
    }
    setDate(new Date(ts).toLocaleString());
    setError(null);
  }

  function convertDateToTimestamp() {
    if (!date) return;
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      setError(t('Invalid date'));
      return;
    }
    setTimestamp(dateObj.getTime().toString());
    setError(null);
  }

  function setCurrentTimestamp() {
    setTimestamp(currentTime.toString());
  }

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>{t('Timestamp Converter')}</Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <StatisticDisplay title={t('Current Timestamp')} value={currentTime} icon={<Schedule fontSize="small" />} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatisticDisplay title={t('Current Date')} value={new Date(currentTime).toLocaleString()} />
          </Grid>
        </Grid>
        
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <TextField 
                  label={t('Timestamp')}
                  value={timestamp} 
                  onChange={e => setTimestamp(e.target.value)} 
                  placeholder={t('Enter timestamp')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => copyToClipboard(timestamp)} edge="end">
                          <ContentCopy />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Button variant="contained" onClick={convertTimestampToDate}>{t('Convert to Date')}</Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <TextField 
                  label={t('Date')}
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  placeholder={t('Enter date')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => copyToClipboard(date)} edge="end">
                          <ContentCopy />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Button variant="outlined" onClick={convertDateToTimestamp}>{t('Convert to Timestamp')}</Button>
              </Stack>
            </Grid>
          </Grid>
          
          <Button onClick={setCurrentTimestamp} startIcon={<Update />}>{t('Set Current Timestamp')}</Button>
        </Stack>
      </Card>
      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </>
  );
} 