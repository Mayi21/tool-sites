import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, Typography, TextField, Button, Stack, Alert, AlertTitle, IconButton } from '@mui/material';
import { ContentCopy, Visibility } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';
import CopySuccessAnimation from '../CopySuccessAnimation';

const DecodedPart = ({ title, content, onCopy }) => (
  <Card variant="outlined">
    <CardHeader
      title={title}
      action={
        <Button size="small" startIcon={<ContentCopy />} onClick={onCopy}>
          Copy
        </Button>
      }
      titleTypographyProps={{ variant: 'subtitle2' }}
    />
    <CardContent>
      <TextField
        value={content}
        multiline
        rows={content.split('\n').length > 8 ? 8 : 4}
        fullWidth
        InputProps={{ readOnly: true, style: { fontFamily: 'monospace' } }}
        variant="filled"
      />
    </CardContent>
  </Card>
);

export default function JwtDecoder() {
  const { t } = useTranslation();
  const [jwt, setJwt] = useState('');
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState(null);
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  function decodeJwt() {
    if (!jwt) return;

    try {
      setError(null);
      const parts = jwt.split('.');
      if (parts.length !== 3) {
        throw new Error(t('Invalid JWT format'));
      }

      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      setDecoded({
        header: JSON.stringify(header, null, 2),
        payload: JSON.stringify(payload, null, 2),
        signature: parts[2]
      });
    } catch (e) {
      setError(e.message);
      setDecoded(null);
    }
  }

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
          {t('JWT Decoder')}
        </Typography>
        
        <Stack spacing={2}>
          <TextField 
            value={jwt} 
            onChange={e => setJwt(e.target.value)} 
            label={t('Enter JWT token')}
            variant="outlined"
            fullWidth
          />
          
          <Button variant="contained" onClick={decodeJwt} startIcon={<Visibility />}>
            {t('Decode')}
          </Button>
          
          {error && (
            <Alert severity="error">
              <AlertTitle>{t('Error')}</AlertTitle>
              {error}
            </Alert>
          )}
          
          {decoded && (
            <Stack spacing={2}>
              <DecodedPart title={t('Header')} content={decoded.header} onCopy={() => copyToClipboard(decoded.header)} />
              <DecodedPart title={t('Payload')} content={decoded.payload} onCopy={() => copyToClipboard(decoded.payload)} />
              
              <Card variant="outlined">
                <CardHeader 
                  title={t('Signature')} 
                  action={
                    <Button size="small" startIcon={<ContentCopy />} onClick={() => copyToClipboard(decoded.signature)}>
                      Copy
                    </Button>
                  }
                  titleTypographyProps={{ variant: 'subtitle2' }}
                />
                <CardContent>
                  <TextField
                    value={decoded.signature}
                    fullWidth
                    InputProps={{ readOnly: true, style: { fontFamily: 'monospace' } }}
                    variant="filled"
                  />
                </CardContent>
              </Card>
            </Stack>
          )}
        </Stack>
      </Card>
      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </>
  );
} 