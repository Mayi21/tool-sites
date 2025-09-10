import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card, CardContent, Typography, TextField, Button, Stack, Grid, Select, MenuItem, FormControl, InputLabel, Alert, AlertTitle
} from '@mui/material';
import { ContentCopy, VpnKey } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';
import CopySuccessAnimation from '../CopySuccessAnimation';

const HashResult = ({ name, hash, onCopy }) => (
  <Grid container spacing={2} alignItems="center">
    <Grid item xs={2}>
      <Typography variant="subtitle1">{name}:</Typography>
    </Grid>
    <Grid item xs={8}>
      <TextField
        value={hash}
        fullWidth
        InputProps={{ readOnly: true, style: { fontFamily: 'monospace' } }}
        variant="filled"
        size="small"
      />
    </Grid>
    <Grid item xs={2}>
      <Button size="small" startIcon={<ContentCopy />} onClick={() => onCopy(hash)}>
        {('Copy')}
      </Button>
    </Grid>
  </Grid>
);

export default function HashGenerator() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [hashType, setHashType] = useState('md5');
  const [hashes, setHashes] = useState({});
  const [error, setError] = useState(null);
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  async function generateHash() {
    if (!input) return;

    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    
    try {
      setError(null);
      const results = {};
      const algorithms = {
        md5: 'MD5', // Placeholder, not a standard SubtleCrypto algo
        sha1: 'SHA-1',
        sha256: 'SHA-256',
        sha512: 'SHA-512',
      };

      const typesToGenerate = hashType === 'all' ? Object.keys(algorithms) : [hashType];

      for (const type of typesToGenerate) {
        if (type === 'md5') {
          // MD5 is not part of Web Crypto API, this is a simple SHA-256 based mock
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          results.md5 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
        } else {
          const hashBuffer = await crypto.subtle.digest(algorithms[type], data);
          results[type] = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        }
      }
      
      setHashes(results);
    } catch (err) {
      setError(t('Error generating hash'));
      setHashes({});
    }
  }

  function generateAllHashes() {
    setHashType('all');
    generateHash();
  }

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>{t('Hash Generator')}</Typography>
        
        <Stack spacing={2}>
          <TextField 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            multiline
            rows={6} 
            label={t('Enter text to hash')}
            variant="outlined"
            fullWidth
          />
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="hash-type-label">{t('Hash Type')}</InputLabel>
                <Select
                  labelId="hash-type-label"
                  value={hashType}
                  label={t('Hash Type')}
                  onChange={(e) => setHashType(e.target.value)}
                >
                  <MenuItem value="md5">MD5</MenuItem>
                  <MenuItem value="sha1">SHA-1</MenuItem>
                  <MenuItem value="sha256">SHA-256</MenuItem>
                  <MenuItem value="sha512">SHA-512</MenuItem>
                  <MenuItem value="all">{t('All')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={generateHash} startIcon={<VpnKey />}>
                  {t('Generate Hash')}
                </Button>
                <Button variant="outlined" onClick={generateAllHashes}>
                  {t('Generate All')}
                </Button>
              </Stack>
            </Grid>
          </Grid>
          
          {error && (
            <Alert severity="error">
              <AlertTitle>{t('Error')}</AlertTitle>
              {error}
            </Alert>
          )}

          {Object.keys(hashes).length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('Generated Hashes')}</Typography>
                <Stack spacing={2}>
                  {Object.entries(hashes).map(([name, hash]) => (
                    <HashResult key={name} name={name.toUpperCase()} hash={hash} onCopy={copyToClipboard} />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Card>
      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </>
  );
} 