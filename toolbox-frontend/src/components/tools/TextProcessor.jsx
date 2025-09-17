import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, CircularProgress, Box, Alert, Stack, CardHeader, CardContent,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { ContentCopy, Transform, Clear } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function TextProcessor() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [operation, setOperation] = useState('uppercase');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const operations = [
    { value: 'uppercase', label: t('Uppercase') },
    { value: 'lowercase', label: t('Lowercase') },
    { value: 'capitalize', label: t('Capitalize') },
    { value: 'titleCase', label: t('Title Case') },
    { value: 'removeDuplicates', label: t('Remove Duplicate Lines') },
    { value: 'removeExtraSpaces', label: t('Remove Extra Spaces') },
    { value: 'removeEmptyLines', label: t('Remove Empty Lines') },
    { value: 'reverse', label: t('Reverse Text') },
    { value: 'sortLines', label: t('Sort Lines') },
    { value: 'sortLinesReverse', label: t('Sort Lines (Reverse)') },
    { value: 'countWords', label: t('Count Words') },
    { value: 'countCharacters', label: t('Count Characters') },
    { value: 'countLines', label: t('Count Lines') }
  ];

  const processText = useCallback((inputText, selectedOperation) => {
    if (!inputText.trim()) return '';

    let result;
    switch (selectedOperation) {
      case 'uppercase':
        result = inputText.toUpperCase();
        break;
      case 'lowercase':
        result = inputText.toLowerCase();
        break;
      case 'capitalize':
        result = inputText.replace(/\b\w/g, l => l.toUpperCase());
        break;
      case 'titleCase':
        result = inputText.replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
        break;
      case 'removeDuplicates':
        result = [...new Set(inputText.split('\n'))].join('\n');
        break;
      case 'removeExtraSpaces':
        result = inputText.replace(/\s+/g, ' ').trim();
        break;
      case 'removeEmptyLines':
        result = inputText.split('\n').filter(line => line.trim() !== '').join('\n');
        break;
      case 'reverse':
        result = inputText.split('').reverse().join('');
        break;
      case 'sortLines':
        result = inputText.split('\n').sort().join('\n');
        break;
      case 'sortLinesReverse':
        result = inputText.split('\n').sort().reverse().join('\n');
        break;
      case 'countWords':
        result = `${t('Word count')}: ${inputText.trim() ? inputText.trim().split(/\s+/).length : 0}`;
        break;
      case 'countCharacters':
        result = `${t('Character count')}: ${inputText.length}`;
        break;
      case 'countLines':
        result = `${t('Line count')}: ${inputText.split('\n').length}`;
        break;
      default:
        result = inputText;
    }
    return result;
  }, [t]);

  const handleProcess = () => {
    if (!input.trim()) {
      setFeedback({ type: 'error', message: t('Please enter text to process') });
      return;
    }

    setLoading(true);
    setOutput('');
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        const result = processText(input, operation);
        setOutput(result);
        setLoading(false);
        setFeedback({ type: 'success', message: t('Text processing completed successfully') });
      } catch (error) {
        setFeedback({ type: 'error', message: t('Processing failed, please try again') });
        setLoading(false);
      }
    }, 500);
  };

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setFeedback({ type: '', message: '' });
  };

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('Text Processor')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('Process text with various operations including case conversion, formatting, and statistical analysis.')}
        </Typography>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardHeader title={t('Input and Options')} />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                value={input}
                onChange={(e) => setInput(e.target.value)}
                label={t('Enter text to process')}
                multiline
                rows={8}
                fullWidth
                variant="outlined"
                placeholder={t('Paste or type your text here for processing...')}
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: 14
                  }
                }}
              />

              <Stack direction="row" spacing={2} alignItems="center">
                <FormControl sx={{ minWidth: 250, flex: 1 }}>
                  <InputLabel id="operation-select-label">{t('Processing Operation')}</InputLabel>
                  <Select
                    labelId="operation-select-label"
                    value={operation}
                    label={t('Processing Operation')}
                    onChange={(e) => setOperation(e.target.value)}
                  >
                    {operations.map(op => (
                      <MenuItem key={op.value} value={op.value}>
                        {op.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Transform />}
                  disabled={loading || !input.trim()}
                  onClick={handleProcess}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? t('Processing...') : t('Process')}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={handleClear}
                  sx={{ minWidth: 100 }}
                >
                  {t('Clear')}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

        <Card variant="outlined">
          <CardHeader
            title={t('Processing Results')}
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
                  <Typography>{t('Processing text, please wait...')}</Typography>
                </Stack>
              </Box>
            ) : output ? (
              <TextField
                value={output}
                InputProps={{ readOnly: true }}
                multiline
                rows={12}
                fullWidth
                variant="filled"
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: 14,
                    backgroundColor: 'grey.50'
                  }
                }}
              />
            ) : (
              <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
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