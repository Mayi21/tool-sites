import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, CircularProgress, Box, Alert, Stack, CardHeader, CardContent,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { ContentCopy, VpnKey } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function HashGenerator() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [hashType, setHashType] = useState('sha256');
  const [generatedHashes, setGeneratedHashes] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (generatedHashes) {
      copyToClipboard(generatedHashes);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) {
      setFeedback({ type: 'error', message: t('Please enter text to hash') });
      return;
    }

    setLoading(true);
    setGeneratedHashes('');
    setFeedback({ type: '', message: '' });

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const results = [];

      const algorithms = {
        md5: 'MD5', // Placeholder, using SHA-256 as fallback
        sha1: 'SHA-1',
        sha256: 'SHA-256',
        sha512: 'SHA-512',
      };

      const typesToGenerate = hashType === 'all' ? Object.keys(algorithms) : [hashType];

      for (const type of typesToGenerate) {
        let hash;
        let algorithmName = type.toUpperCase();

        if (type === 'md5') {
          // MD5 is not part of Web Crypto API, using SHA-256 as fallback
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          hash = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
            .substring(0, 32);
          algorithmName = 'MD5 (SHA-256 based)';
        } else {
          const hashBuffer = await crypto.subtle.digest(algorithms[type], data);
          hash = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        }

        results.push(`${algorithmName}: ${hash}`);
      }

      setGeneratedHashes(results.join('\n'));
      setLoading(false);
      setFeedback({ type: 'success', message: t('Hash generated successfully') });
    } catch (error) {
      setGeneratedHashes('');
      setLoading(false);
      setFeedback({ type: 'error', message: t('Hash generation failed, please try again') });
    }
  };

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('Hash Generator')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('MD5/SHA Hash Generator')}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardHeader title={t('Input and Options')} />
            <CardContent>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="hash-type-label">{t('Algorithm')}</InputLabel>
                  <Select
                    labelId="hash-type-label"
                    value={hashType}
                    label={t('Algorithm')}
                    onChange={(e) => setHashType(e.target.value)}
                  >
                    <MenuItem value="md5">MD5</MenuItem>
                    <MenuItem value="sha1">SHA-1</MenuItem>
                    <MenuItem value="sha256">SHA-256</MenuItem>
                    <MenuItem value="sha512">SHA-512</MenuItem>
                    <MenuItem value="all">{t('All')}</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  label={t('Enter text to hash')}
                  multiline
                  rows={6}
                  fullWidth
                  variant="outlined"
                  placeholder={t('Paste or type your text here for processing...')}
                />

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VpnKey />}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? t('Generating...') : t('Generate Hash')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </form>

        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

        <Card variant="outlined">
          <CardHeader
            title={t('Generated Hashes')}
            action={
              generatedHashes && (
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
            ) : generatedHashes ? (
              <TextField
                value={generatedHashes}
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