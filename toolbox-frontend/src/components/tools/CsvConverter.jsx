import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { ContentCopy, Sync, Clear } from '@mui/icons-material';
import CopySuccessAnimation from '../CopySuccessAnimation';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';

export default function CsvConverter() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [conversionType, setConversionType] = useState('csv2json');
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  function convertData() {
    if (!input.trim()) return;

    try {
      if (conversionType === 'csv2json') {
        const lines = input.trim().split('\n');
        if (lines.length < 2) {
          throw new Error(t('CSV must have at least a header and one data row'));
        }
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {});
        });
        setOutput(JSON.stringify(data, null, 2));
      } else {
        const jsonData = JSON.parse(input);
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          throw new Error(t('JSON must be a non-empty array of objects'));
        }
        const headers = Object.keys(jsonData[0]);
        const csvLines = [headers.join(',')];
        jsonData.forEach(row => {
          const values = headers.map(header => row[header] || '');
          csvLines.push(values.join(','));
        });
        setOutput(csvLines.join('\n'));
      }
    } catch (error) {
      setOutput(error.message || t('Invalid input format'));
    }
  }

  async function copyOutput() {
    if (output) {
      await copyToClipboard(output);
    }
  }

  function clearAll() {
    setInput('');
    setOutput('');
  }

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>{t('CSV ↔ JSON Converter')}</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControl fullWidth>
                  <InputLabel id="conversion-type-label">{t('Conversion')}</InputLabel>
                  <Select
                    labelId="conversion-type-label"
                    value={conversionType}
                    label={t('Conversion')}
                    onChange={(e) => setConversionType(e.target.value)}
                  >
                    <MenuItem value={'csv2json'}>{t('CSV to JSON')}</MenuItem>
                    <MenuItem value={'json2csv'}>{t('JSON to CSV')}</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={convertData} startIcon={<Sync />}>
                  {t('Convert')}
                </Button>
                <Button variant="outlined" onClick={clearAll} startIcon={<Clear />}>
                  {t('Clear')}
                </Button>
              </Stack>
              
              <TextField 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                multiline
                rows={12} 
                label={conversionType === 'csv2json' ? t('Enter CSV data') : t('Enter JSON data')}
                placeholder={conversionType === 'csv2json' ? t('Enter CSV data') : t('Enter JSON data')}
                variant="outlined"
                fullWidth
                sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace' } }}
              />
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{t('Result')}</Typography>
                {output && (
                  <Button size="small" onClick={copyOutput} startIcon={<ContentCopy />}>
                    {t('Copy')}
                  </Button>
                )}
              </Stack>
              
              <TextField 
                value={output} 
                InputProps={{ readOnly: true }}
                multiline
                rows={12} 
                label={t('Converted data will appear here')}
                variant="filled"
                fullWidth
                sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace' } }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Card>
      
      <CopySuccessAnimation 
        visible={showAnimation} 
        onAnimationEnd={handleAnimationEnd} 
      />
    </>
  );
} 