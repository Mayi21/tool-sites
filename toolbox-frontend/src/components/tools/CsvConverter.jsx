import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, CircularProgress, Box, Alert, Stack, CardHeader, CardContent,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { ContentCopy, Sync } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function CsvConverter() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [conversionType, setConversionType] = useState('csv2json');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!input.trim()) {
      setFeedback({ type: 'error', message: t('Please enter data to convert') });
      return;
    }

    setLoading(true);
    setOutput('');
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        if (conversionType === 'csv2json') {
          const lines = input.trim().split('\n');
          if (lines.length < 2) {
            throw new Error(t('CSV must have at least a header and one data row'));
          }
          const headers = lines[0].split(',').map(h => h.trim());
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            return headers.reduce((obj, header, index) => {
              obj[header] = values[index] || '';
              return obj;
            }, {});
          });
          setOutput(JSON.stringify(data, null, 2));
        } else {
          const jsonData = JSON.parse(input);
          if (!Array.isArray(jsonData) || jsonData.length === 0) {
            throw new Error(t('JSON must be a non-empty array of objects'));
          }
          const headers = Object.keys(jsonData[0]);
          const csvLines = [headers.join(',')];
          jsonData.forEach(row => {
            const values = headers.map(header => row[header] || '');
            csvLines.push(values.join(','));
          });
          setOutput(csvLines.join('\n'));
        }
        setLoading(false);
        setFeedback({ type: 'success', message: t('Conversion completed successfully') });
      } catch (error) {
        setOutput('');
        setLoading(false);
        setFeedback({ type: 'error', message: error.message || t('Conversion failed, please check your input format') });
      }
    }, 500);
  };

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('CSV ↔ JSON Converter')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('CSV to JSON Converter')}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardHeader title={t('Input and Options')} />
            <CardContent>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="conversion-type-label">{t('Convert')}</InputLabel>
                  <Select
                    labelId="conversion-type-label"
                    value={conversionType}
                    label={t('Convert')}
                    onChange={(e) => setConversionType(e.target.value)}
                  >
                    <MenuItem value="csv2json">{t('CSV to JSON')}</MenuItem>
                    <MenuItem value="json2csv">{t('JSON to CSV')}</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  label={conversionType === 'csv2json' ? t('Enter CSV data') : t('Enter JSON data')}
                  multiline
                  rows={12}
                  fullWidth
                  variant="outlined"
                  placeholder={conversionType === 'csv2json' ?
                    t('Paste or type your text here for processing...') :
                    t('Paste or type your text here for processing...')
                  }
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
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Sync />}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? t('Converting...') : t('Convert')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </form>

        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

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
                  <Typography>{t('Processing...') + t(', please wait...')}</Typography>
                </Stack>
              </Box>
            ) : output ? (
              <TextField
                value={output}
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