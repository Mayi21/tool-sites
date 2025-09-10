import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Typography, TextField, Button, Stack } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import CopySuccessAnimation from '../CopySuccessAnimation';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';

export default function UrlEncoder() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  function encodeUrl() {
    try {
      const encoded = encodeURIComponent(input);
      setOutput(encoded);
    } catch (e) {
      setOutput('');
    }
  }

  function decodeUrl() {
    try {
      const decoded = decodeURIComponent(input);
      setOutput(decoded);
    } catch (e) {
      setOutput('');
    }
  }

  async function copyToClipboardHandler() {
    if (output) {
      await copyToClipboard(output);
    }
  }

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
          {t('URL Encoder/Decoder')}
        </Typography>
        
        <Stack spacing={2}>
          <TextField 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            multiline
            rows={6} 
            label={t('Enter URL to encode or decode')}
            variant="outlined"
            fullWidth
          />
          
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={encodeUrl}>
              {t('Encode')}
            </Button>
            <Button variant="outlined" onClick={decodeUrl}>
              {t('Decode')}
            </Button>
            {output && (
              <Button variant="outlined" startIcon={<ContentCopy />} onClick={copyToClipboardHandler}>
                {t('Copy')}
              </Button>
            )}
          </Stack>
          
          {output && (
            <TextField 
              value={output} 
              InputProps={{
                readOnly: true,
              }}
              multiline
              rows={6} 
              label={t('Result will appear here')}
              variant="outlined"
              fullWidth
            />
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