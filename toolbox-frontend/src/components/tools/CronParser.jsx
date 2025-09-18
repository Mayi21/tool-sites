import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, Alert, Box, Stack, CardHeader, CardContent, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { ContentCopy, Schedule } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

import { buildApiUrl, getApiConfig } from '../../config/api';

export default function CronParser() {
  const { t } = useTranslation();
  const [input, setInput] = useState('0 */20 * * * ?');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [nextExecutions, setNextExecutions] = useState([]);
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) {
      setFeedback({ type: 'error', message: t('Please enter a cron expression') });
      return;
    }

    setLoading(true);
    setOutput('');
    setNextExecutions([]);
    setFeedback({ type: '', message: '' });

    try {
      const apiConfig = getApiConfig();
      const response = await fetch(buildApiUrl(apiConfig.ENDPOINTS.CRON_NEXT_TIMES), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expr: input, count: 5 }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const executions = data.times.map((time, index) => ({
          id: index,
          time: new Date(time).toLocaleString()
        }));
        setNextExecutions(executions);

        // Create formatted output for copying
        const formattedOutput = `${t('Cron Expression')}: ${input}\n\n${t('Next Executions')}:\n` +
          executions.map((exec, index) => `${index + 1}. ${exec.time}`).join('\n');
        setOutput(formattedOutput);

        setFeedback({ type: 'success', message: t('Cron expression parsed successfully') });
      } else {
        throw new Error(data.error || t('Unknown error'));
      }
    } catch (e) {
      setFeedback({ type: 'error', message: t('Invalid cron expression: {{error}}', { error: e.message }) });
      setOutput('');
      setNextExecutions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('Cron Expression Parser')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('Parse cron expressions to preview next execution times and validate scheduling syntax.')}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardHeader title={t('Input Options')} />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  name="cronExpression"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  label={t('Cron Expression')}
                  placeholder="0 */20 * * * ?"
                  variant="outlined"
                  fullWidth
                  required
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: 'monospace',
                      fontSize: 14
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Schedule />}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? t('Parsing...') : t('Parse Expression')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </form>

        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

        <Card variant="outlined">
          <CardHeader
            title={t('Parsed Result')}
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
                  <Typography>{t('Parsing cron expression, please wait...')}</Typography>
                </Stack>
              </Box>
            ) : nextExecutions.length > 0 ? (
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
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ fontFamily: 'monospace', fontSize: 14 }}
                        >
                          {row.time}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  {t('Next execution times will appear here. Enter a cron expression and click parse.')}
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