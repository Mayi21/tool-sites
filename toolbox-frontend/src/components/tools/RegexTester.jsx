import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, Alert, Box, Stack, CardHeader, CardContent, CircularProgress,
  Checkbox, FormControlLabel, FormGroup, Chip, Divider
} from '@mui/material';
import { ContentCopy, PlayArrow, Search, Flag } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function RegexTester() {
  const { t } = useTranslation();
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [flags, setFlags] = useState({
    g: true,  // global
    i: false, // ignoreCase
    m: false, // multiline
  });
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  const handleFlagChange = (event) => {
    setFlags({
      ...flags,
      [event.target.name]: event.target.checked,
    });
    // Clear results when flags change
    setOutput('');
    setFeedback({ type: '', message: '' });
  };

  const handleTest = () => {
    if (!pattern.trim()) {
      setFeedback({ type: 'error', message: t('Please enter a regex pattern') });
      return;
    }
    if (!testText.trim()) {
      setFeedback({ type: 'error', message: t('Please enter test text') });
      return;
    }

    setLoading(true);
    setOutput('');
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        const flagString = Object.keys(flags).filter(key => flags[key]).join('');
        const regex = new RegExp(pattern, flagString);
        const results = [];
        let match;

        if (flags.g) {
          while ((match = regex.exec(testText)) !== null) {
            results.push({ match: match[0], index: match.index, groups: match.slice(1) });
          }
        } else {
          match = regex.exec(testText);
          if (match) {
            results.push({ match: match[0], index: match.index, groups: match.slice(1) });
          }
        }

        if (results.length > 0) {
          const resultText = results.map((result, index) =>
            `Match ${index + 1}:\n` +
            `  Text: "${result.match}"\n` +
            `  Position: ${result.index}\n` +
            (result.groups.length > 0 ? `  Groups: [${result.groups.map(g => `"${g}"`).join(', ')}]\n` : '') +
            '\n'
          ).join('');

          setOutput(resultText);
          setFeedback({ type: 'success', message: t('Found {{count}} matches', { count: results.length }) });
        } else {
          setOutput(t('No matches found'));
          setFeedback({ type: 'info', message: t('No matches found for the given pattern') });
        }
      } catch (e) {
        setFeedback({ type: 'error', message: t('Invalid regex pattern: {{error}}', { error: e.message }) });
        setOutput('');
      }
      setLoading(false);
    }, 300);
  };

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('Regex Tester')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('Regex Testing Tool')}
        </Typography>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardHeader title={t('Input and Options')} />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                label={t('Enter regex pattern')}
                placeholder="^[a-zA-Z0-9]+$"
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: 12
                  }
                }}
              />

              {/* Regex Flags */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Flag fontSize="small" />
                  {t('Regex Flags')}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <FormControlLabel
                    control={<Checkbox checked={flags.g} onChange={handleFlagChange} name="g" size="small" />}
                    label="Global (g)"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={flags.i} onChange={handleFlagChange} name="i" size="small" />}
                    label="Ignore Case (i)"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={flags.m} onChange={handleFlagChange} name="m" size="small" />}
                    label="Multiline (m)"
                  />
                </Stack>
              </Box>

              <Divider />

              <TextField
                value={testText}
                onChange={e => setTestText(e.target.value)}
                multiline
                rows={6}
                label={t('Enter text to test')}
                placeholder="Sample text to test your regex pattern against..."
                variant="outlined"
                fullWidth
              />

              <Button
                variant="contained"
                onClick={handleTest}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                disabled={loading || !pattern.trim() || !testText.trim()}
                fullWidth
              >
                {loading ? t('Testing...') : t('Test Regex')}
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
                  <Typography>{t('Testing regex pattern, please wait...')}</Typography>
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
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: 12,
                    maxHeight: 400,
                    overflow: 'auto'
                  }
                }}
              />
            ) : (
              <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                  {t('Test results will appear here. Enter a regex pattern and test text, then click Test Regex.')}
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