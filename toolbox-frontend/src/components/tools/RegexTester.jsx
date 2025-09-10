import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card, CardContent, Typography, TextField, Button, Stack, Grid, Alert, AlertTitle, 
  Checkbox, FormControlLabel, FormGroup, Paper, InputAdornment, IconButton
} from '@mui/material';
import { Search, ContentCopy } from '@mui/icons-material';

export default function RegexTester() {
  const { t } = useTranslation();
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [flags, setFlags] = useState({
    g: true,  // global
    i: false, // ignoreCase
    m: false, // multiline
  });

  const handleFlagChange = (event) => {
    setFlags({
      ...flags,
      [event.target.name]: event.target.checked,
    });
  };

  function testRegex() {
    if (!pattern || !testText) return;

    try {
      setError(null);
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
      setMatches(results);
    } catch (e) {
      setError(e.message);
      setMatches([]);
    }
  }

  return (
    <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 2 }}>{t('Regex Tester')}</Typography>
      
      <Stack spacing={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField 
              value={pattern} 
              onChange={e => setPattern(e.target.value)} 
              label={t('Enter regex pattern')}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => navigator.clipboard.writeText(pattern)} edge="end">
                      <ContentCopy />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormGroup row>
              <FormControlLabel control={<Checkbox checked={flags.g} onChange={handleFlagChange} name="g" />} label="Global (g)" />
              <FormControlLabel control={<Checkbox checked={flags.i} onChange={handleFlagChange} name="i" />} label="Ignore Case (i)" />
              <FormControlLabel control={<Checkbox checked={flags.m} onChange={handleFlagChange} name="m" />} label="Multiline (m)" />
            </FormGroup>
          </Grid>
        </Grid>
        
        <TextField 
          value={testText} 
          onChange={e => setTestText(e.target.value)} 
          multiline
          rows={6} 
          label={t('Enter text to test')}
          fullWidth
        />
        
        <Button variant="contained" onClick={testRegex}>{t('Test')}</Button>
        
        {error && (
          <Alert severity="error">
            <AlertTitle>{t('Error')}</AlertTitle>
            {error}
          </Alert>
        )}
        
        {matches.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>{`${t('Matches')} (${matches.length})`}</Typography>
            <Stack spacing={1}>
              {matches.map((match, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="body2"><strong>{t('Match')}:</strong> {match.match}</Typography>
                  <Typography variant="body2"><strong>{t('Index')}:</strong> {match.index}</Typography>
                  {match.groups.length > 0 && (
                    <Typography variant="body2"><strong>{t('Groups')}:</strong> {match.groups.join(', ')}</Typography>
                  )}
                </Paper>
              ))}
            </Stack>
          </Paper>
        )}
      </Stack>
    </Card>
  );
} 