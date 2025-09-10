import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card, Typography, TextField, Button, Stack, Grid, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { ContentCopy, Clear } from '@mui/icons-material';
import CopySuccessAnimation from '../CopySuccessAnimation';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';

export default function TextProcessor() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [operation, setOperation] = useState('uppercase');
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const operations = [
    { value: 'uppercase', label: t('Uppercase') },
    { value: 'lowercase', label: t('Lowercase') },
    { value: 'capitalize', label: t('Capitalize') },
    { value: 'titleCase', label: t('Title Case') },
    { value: 'removeDuplicates', label: t('Remove Duplicate Lines') },
    { value: 'removeExtraSpaces', label: t('Remove Extra Spaces') },
    { value: 'removeEmptyLines', label: t('Remove Empty Lines') },
    { value: 'reverse', label: t('Reverse Text') },
    { value: 'sortLines', label: t('Sort Lines') },
    { value: 'sortLinesReverse', label: t('Sort Lines (Reverse)') },
    { value: 'countWords', label: t('Count Words') },
    { value: 'countCharacters', label: t('Count Characters') },
    { value: 'countLines', label: t('Count Lines') }
  ];

  function processText() {
    if (!input) return;
    let result;
    switch (operation) {
      case 'uppercase': result = input.toUpperCase(); break;
      case 'lowercase': result = input.toLowerCase(); break;
      case 'capitalize': result = input.replace(/\b\w/g, l => l.toUpperCase()); break;
      case 'titleCase': result = input.replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()); break;
      case 'removeDuplicates': result = [...new Set(input.split('\n'))].join('\n'); break;
      case 'removeExtraSpaces': result = input.replace(/\s+/g, ' ').trim(); break;
      case 'removeEmptyLines': result = input.split('\n').filter(line => line.trim() !== '').join('\n'); break;
      case 'reverse': result = input.split('').reverse().join(''); break;
      case 'sortLines': result = input.split('\n').sort().join('\n'); break;
      case 'sortLinesReverse': result = input.split('\n').sort().reverse().join('\n'); break;
      case 'countWords': result = `${t('Word count')}: ${input.trim() ? input.trim().split(/\s+/).length : 0}`; break;
      case 'countCharacters': result = `${t('Character count')}: ${input.length}`; break;
      case 'countLines': result = `${t('Line count')}: ${input.split('\n').length}`; break;
      default: result = input;
    }
    setOutput(result);
  }

  async function copyOutput() {
    if (output) await copyToClipboard(output);
  }

  function clearAll() {
    setInput('');
    setOutput('');
  }

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>{t('Text Processor')}</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="h6">{t('Input')}</Typography>
              <TextField
                value={input}
                onChange={e => setInput(e.target.value)}
                multiline
                rows={12}
                label={t('Enter text to process')}
                fullWidth
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id="operation-select-label">{t('Operation')}</InputLabel>
                  <Select
                    labelId="operation-select-label"
                    value={operation}
                    label={t('Operation')}
                    onChange={e => setOperation(e.target.value)}
                  >
                    {operations.map(op => <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>)}
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={processText}>{t('Process')}</Button>
                <Button variant="outlined" onClick={clearAll} startIcon={<Clear />}>{t('Clear')}</Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{t('Result')}</Typography>
                {output && <Button size="small" onClick={copyOutput} startIcon={<ContentCopy />}>{t('Copy')}</Button>}
              </Stack>
              <TextField
                value={output}
                InputProps={{ readOnly: true }}
                multiline
                rows={12}
                label={t('Processed text will appear here')}
                variant="filled"
                fullWidth
                sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace' } }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Card>
      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </>
  );
} 