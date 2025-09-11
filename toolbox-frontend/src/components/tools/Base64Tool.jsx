import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card, CardContent, Typography, TextField, Button, Stack, Alert, AlertTitle,
  ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import CopySuccessAnimation from '../CopySuccessAnimation';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';

export default function Base64Tool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [error, setError] = useState(null);
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  function handleConvert() {
    try {
      setError(null);
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch (e) {
      setError(e.message || t('Invalid input'));
      setOutput('');
    }
  }

  async function copyOutput() {
    if (output) {
      await copyToClipboard(output);
    }
  }

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto' }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>{t('base64.mainTitle')}</Typography>
          <Stack spacing={2}>
            <TextField 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              multiline
              rows={6} 
              label={t('Enter text to encode or decode')}
              variant="outlined"
              fullWidth
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <ToggleButtonGroup value={mode} exclusive onChange={handleModeChange} aria-label="text alignment">
                <ToggleButton value="encode" aria-label="left aligned">{t('Encode')}</ToggleButton>
                <ToggleButton value="decode" aria-label="centered">{t('Decode')}</ToggleButton>
              </ToggleButtonGroup>
              <Button variant="contained" onClick={handleConvert}>{t('Convert')}</Button>
            </Stack>
            {error && <Alert severity="error"><AlertTitle>{t('Error')}</AlertTitle>{error}</Alert>}
            {output && (
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">{t('Result')}</Typography>
                  <Button size="small" startIcon={<ContentCopy />} onClick={copyOutput}>{t('Copy')}</Button>
                </Stack>
                <TextField 
                  value={output} 
                  InputProps={{ readOnly: true }} 
                  multiline 
                  rows={6} 
                  variant="filled" 
                  fullWidth 
                  sx={{ 
                    '& .MuiInputBase-root': { 
                      maxHeight: 200, 
                      overflow: 'auto',
                      fontFamily: 'monospace'
                    } 
                  }} 
                />
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </>
  );
} 