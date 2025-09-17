import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, Grid, TextField, CircularProgress, Box, Alert, Stack, CardHeader, CardContent,
  Checkbox, FormControlLabel, FormGroup, LinearProgress, Slider
} from '@mui/material';
import { ContentCopy, Refresh, VpnKey, CheckCircle, Warning, Error } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';
import CopySuccessAnimation from '../CopySuccessAnimation';

// Helper functions (calculatePasswordStrength, generatePassword) remain the same
const calculatePasswordStrength = (password, t) => {
  let score = 0;
  if (password.length >= 12) score += 2; else if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 2;
  if (/(.)\1{2,}/.test(password)) score -= 2;
  if (score >= 7) return { level: 'strong', score: 100, color: 'success.main', text: t('Strong'), icon: <CheckCircle color="success"/>, progressColor: 'success' };
  if (score >= 4) return { level: 'medium', score: 60, color: 'warning.main', text: t('Medium'), icon: <Warning color="warning"/>, progressColor: 'warning' };
  return { level: 'weak', score: 30, color: 'error.main', text: t('Weak'), icon: <Error color="error"/>, progressColor: 'error' };
};

const generatePassword = (length, options) => {
  const charsets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };
  let charset = '';
  let password = '';
  options.forEach(opt => { 
    charset += charsets[opt];
    password += charsets[opt][Math.floor(Math.random() * charsets[opt].length)];
  });
  if (!charset) return '';
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

export default function PasswordGenerator() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [generatedPasswords, setGeneratedPasswords] = useState([]);
  const [options, setOptions] = useState({ count: 5, length: 12, lowercase: true, uppercase: true, numbers: true, symbols: true });
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleOptionsChange = (event) => {
    const { name, value, type, checked } = event.target;
    setOptions(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const selectedOptions = Object.keys(options).filter(key => options[key] === true);
    if (selectedOptions.length === 0) {
      setFeedback({ type: 'error', message: t('Please select at least one character type') });
      return;
    }
    setLoading(true);
    setGeneratedPasswords([]);
    setFeedback({ type: '', message: '' });
    setTimeout(() => {
      const passwords = Array.from({ length: options.count }, () => generatePassword(options.length, selectedOptions));
      setGeneratedPasswords(passwords);
      setLoading(false);
      setFeedback({ type: 'success', message: t('Passwords generated successfully') });
    }, 500);
  };

  const overallStrength = generatedPasswords.length > 0 
    ? calculatePasswordStrength(generatedPasswords.join(''), t) 
    : null;

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <VpnKey color="primary"/>
          <Typography variant="h5" component="h1">{t('Password Generator')}</Typography>
        </Stack>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('Password Generator Tool')}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardHeader title={t('Input and Options')} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label={t('Number of Passwords')} type="number" name="count" value={options.count} onChange={handleOptionsChange} fullWidth InputProps={{ inputProps: { min: 1, max: 200 } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>{t('Password Length')}: {options.length}</Typography>
                  <Slider name="length" value={options.length} onChange={handleOptionsChange} min={6} max={128} aria-label="Password Length" />
                </Grid>
                <Grid item xs={12}>
                  <FormGroup row>
                    <FormControlLabel control={<Checkbox checked={options.lowercase} onChange={handleOptionsChange} name="lowercase" />} label={t('Lowercase (a-z)')} />
                    <FormControlLabel control={<Checkbox checked={options.uppercase} onChange={handleOptionsChange} name="uppercase" />} label={t('Uppercase (A-Z)')} />
                    <FormControlLabel control={<Checkbox checked={options.numbers} onChange={handleOptionsChange} name="numbers" />} label={t('Numbers (0-9)')} />
                    <FormControlLabel control={<Checkbox checked={options.symbols} onChange={handleOptionsChange} name="symbols" />} label={t('Symbols (!@#$...)')} />
                  </FormGroup>
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Refresh />} disabled={loading} fullWidth>
                    {loading ? t('Generating...') : t('Generate Passwords')}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </form>

        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

        {overallStrength && (
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardHeader title={t('Password Strength Analysis')} />
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                {overallStrength.icon}
                <Typography variant="subtitle1" color={overallStrength.color}>{overallStrength.text}</Typography>
                <Typography color="text.secondary">({Math.round(overallStrength.score)}/100)</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={overallStrength.score} color={overallStrength.progressColor} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        )}

        <Card variant="outlined">
          <CardHeader
            title={t('Processing Results')}
            action={
              generatedPasswords.length > 0 && (
                <Button size="small" onClick={() => copyToClipboard(generatedPasswords.join('\n'))} startIcon={<ContentCopy />}>
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
            ) : generatedPasswords.length > 0 ? (
              <TextField
                value={generatedPasswords.join('\n')}
                multiline
                readOnly
                rows={10}
                fullWidth
                variant="filled"
                sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: 12 } }}
              />
            ) : (
              <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography color="text.secondary">{t('Processing results will appear here. Enter text above and select an operation.')}</Typography></Box>
            )}
          </CardContent>
        </Card>
      </Card>
      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </>
  );
}
