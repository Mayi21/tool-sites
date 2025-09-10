import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Typography, TextField, Button, Stack, Alert, AlertTitle } from '@mui/material';
import { ContentCopy, Download } from '@mui/icons-material';
import CopySuccessAnimation from '../CopySuccessAnimation';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';

export default function JsonFormatter() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  function formatJson() {
    try {
      setError(null);
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
    } catch (e) {
      setError(t('Invalid JSON format'));
      setOutput('');
    }
  }

  function minifyJson() {
    try {
      setError(null);
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
    } catch (e) {
      setError(t('Invalid JSON format'));
      setOutput('');
    }
  }

  async function copyToClipboardHandler() {
    if (output) {
      await copyToClipboard(output);
    }
  }

  function downloadJson() {
    if (output) {
      const blob = new Blob([output], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formatted.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
          {t('JSON Formatter')}
        </Typography>
        
        <Stack spacing={2}>
          <TextField 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            multiline
            rows={8} 
            label={t('Enter JSON to format')}
            variant="outlined"
            fullWidth
          />
          
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={formatJson}>
              {t('Format')}
            </Button>
            <Button variant="outlined" onClick={minifyJson}>
              {t('Minify')}
            </Button>
          </Stack>
          
          {error && (
            <Alert severity="error">
              <AlertTitle>{t('Error')}</AlertTitle>
              {error}
            </Alert>
          )}
          
          {output && (
            <Stack spacing={1}>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<ContentCopy />} onClick={copyToClipboardHandler}>
                  {t('Copy')}
                </Button>
                <Button variant="outlined" startIcon={<Download />} onClick={downloadJson}>
                  {t('Download')}
                </Button>
              </Stack>
              
              <TextField 
                value={output} 
                InputProps={{
                  readOnly: true,
                  style: { fontFamily: 'monospace' }
                }}
                multiline
                rows={12} 
                variant="filled"
                fullWidth
              />
            </Stack>
          )}
        </Stack>
      </Card>
      
      <CopySuccessAnimation 
        visible={showAnimation} 
        onAnimationEnd={handleAnimationEnd} 
      />
    </>
  );
} 