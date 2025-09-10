import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card, CardContent, Typography, TextField, Button, Stack, Grid, Alert, AlertTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { PlayCircleOutline, Clear, Schedule } from '@mui/icons-material';

import { buildApiUrl, getApiConfig } from '../../config/api';

export default function CronParser() {
  const { t } = useTranslation();
  const [cronExpression, setCronExpression] = useState('0 */20 * * * ?');
  const [nextExecutions, setNextExecutions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!cronExpression.trim()) {
        setError(t('Please enter a cron expression'));
        return;
      }

      const apiConfig = getApiConfig();
      const response = await fetch(buildApiUrl(apiConfig.ENDPOINTS.CRON_NEXT_TIMES), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expr: cronExpression, count: 5 }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({})); // Catch if body is not json
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setNextExecutions(data.times.map((time, index) => ({ id: index, time: new Date(time).toLocaleString() })));
      } else {
        setError(data.error || t('Unknown error'));
        setNextExecutions([]);
      }
    } catch (e) {
      setError(e.message);
      setNextExecutions([]);
    } finally {
      setLoading(false);
    }
  };

  function clearAll() {
    setCronExpression('');
    setNextExecutions([]);
    setError(null);
  }

  return (
    <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Schedule sx={{ mr: 1 }} />
        {t('Cron Expression Parser')}
      </Typography>
      
      <Stack spacing={3}>
        <TextField
          label={t('Cron Expression')}
          value={cronExpression}
          onChange={e => setCronExpression(e.target.value)}
          placeholder={'0 */20 * * * ?'}
          fullWidth
        />

        <Stack direction="row" spacing={1}>
          <Button 
            variant="contained" 
            startIcon={<PlayCircleOutline />} 
            onClick={handleParse}
            disabled={loading}
          >
            {loading ? t('Parsing...') : t('Parse Expression')}
          </Button>
          <Button 
            variant="outlined"
            startIcon={<Clear />} 
            onClick={clearAll}
          >
            {t('Clear')}
          </Button>
        </Stack>

        {error && (
          <Alert severity="error">
            <AlertTitle>{t('Parse Error')}</AlertTitle>
            {error}
          </Alert>
        )}

        {nextExecutions.length > 0 && (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" aria-label="next executions table">
              <TableHead>
                <TableRow>
                  <TableCell>{t('Execution Time')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nextExecutions.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      {row.time}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </Card>
  );
}