import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, Alert, Box, Stack, CardHeader, CardContent, CircularProgress,
  Tabs, Tab, Chip
} from '@mui/material';
import { ContentCopy, Lock, VpnKey, Fingerprint, PlayArrow } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function JwtDecoder() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [decoded, setDecoded] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  const handleCopyPart = (part) => {
    if (decoded) {
      copyToClipboard(decoded[part]);
    }
  };

  const handleDecode = () => {
    if (!input.trim()) {
      setFeedback({ type: 'error', message: t('Please enter JWT token') });
      return;
    }

    setLoading(true);
    setOutput('');
    setDecoded(null);
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        const parts = input.trim().split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid JWT format - must have 3 parts');
        }

        const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

        const decodedData = {
          header: JSON.stringify(header, null, 2),
          payload: JSON.stringify(payload, null, 2),
          signature: parts[2]
        };

        setDecoded(decodedData);

        // Create formatted output
        const formattedOutput = `=== JWT HEADER ===\n${decodedData.header}\n\n=== JWT PAYLOAD ===\n${decodedData.payload}\n\n=== JWT SIGNATURE ===\n${decodedData.signature}`;
        setOutput(formattedOutput);

        setFeedback({ type: 'success', message: t('JWT decoded successfully') });
      } catch (e) {
        setFeedback({ type: 'error', message: t('Invalid JWT format: {{error}}', { error: e.message }) });
        setOutput('');
        setDecoded(null);
      }
      setLoading(false);
    }, 300);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('JWT Decoder')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('JWT Token Decoder')}
        </Typography>
        
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardHeader title={t('Input and Options')} />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                value={input}
                onChange={e => setInput(e.target.value)}
                label={t('Enter JWT token')}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: 12
                  }
                }}
              />

              <Button
                variant="contained"
                onClick={handleDecode}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VpnKey />}
                disabled={loading || !input.trim()}
                fullWidth
              >
                {loading ? t('Decoding...') : t('Decode JWT')}
              </Button>
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
            title={t('Decoded Result')}
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
                  <Typography>{t('Decoding JWT token, please wait...')}</Typography>
                </Stack>
              </Box>
            ) : decoded ? (
              <Box>
                <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Lock fontSize="small" />
                        {t('Header')}
                      </Box>
                    }
                  />
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Fingerprint fontSize="small" />
                        {t('Payload')}
                      </Box>
                    }
                  />
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VpnKey fontSize="small" />
                        {t('Signature')}
                      </Box>
                    }
                  />
                </Tabs>

                {activeTab === 0 && (
                  <Card variant="outlined">
                    <CardHeader
                      title={t('JWT Header')}
                      action={
                        <Button size="small" onClick={() => handleCopyPart('header')} startIcon={<ContentCopy />}>
                          {t('Copy')}
                        </Button>
                      }
                    />
                    <CardContent>
                      <TextField
                        value={decoded.header}
                        multiline
                        readOnly
                        rows={8}
                        fullWidth
                        variant="filled"
                        sx={{
                          '& .MuiInputBase-root': {
                            fontFamily: 'monospace',
                            fontSize: 12
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                )}

                {activeTab === 1 && (
                  <Card variant="outlined">
                    <CardHeader
                      title={t('JWT Payload')}
                      action={
                        <Button size="small" onClick={() => handleCopyPart('payload')} startIcon={<ContentCopy />}>
                          {t('Copy')}
                        </Button>
                      }
                    />
                    <CardContent>
                      <TextField
                        value={decoded.payload}
                        multiline
                        readOnly
                        rows={8}
                        fullWidth
                        variant="filled"
                        sx={{
                          '& .MuiInputBase-root': {
                            fontFamily: 'monospace',
                            fontSize: 12
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                )}

                {activeTab === 2 && (
                  <Card variant="outlined">
                    <CardHeader
                      title={t('JWT Signature')}
                      action={
                        <Button size="small" onClick={() => handleCopyPart('signature')} startIcon={<ContentCopy />}>
                          {t('Copy')}
                        </Button>
                      }
                    />
                    <CardContent>
                      <TextField
                        value={decoded.signature}
                        readOnly
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
                    </CardContent>
                  </Card>
                )}
              </Box>
            ) : (
              <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                  {t('JWT token parts will appear here. Enter a valid JWT token and click Decode JWT.')}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Card>
      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </>
  );
} 