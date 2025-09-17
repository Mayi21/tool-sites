import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, CircularProgress, Box, Alert, Stack, CardHeader, CardContent,
  Grid, Chip, Divider
} from '@mui/material';
import { ContentCopy, Analytics, Refresh } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function TextAnalyzer() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const analyzeText = useCallback((inputText) => {
    if (!inputText.trim()) {
      setAnalysis(null);
      return;
    }

    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const lines = inputText.split('\n').length;
    const sentences = inputText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    const paragraphs = inputText.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;

    const wordArray = inputText.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(wordArray).size;
    const averageWordLength = wordArray.length > 0
      ? (wordArray.reduce((sum, word) => sum + word.length, 0) / wordArray.length).toFixed(1)
      : 0;

    // Reading time estimation (average 200 words per minute)
    const readingTime = Math.ceil(words / 200);

    // Word frequency analysis
    const frequency = {};
    wordArray.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    const wordFrequency = Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    setAnalysis({
      characters,
      charactersNoSpaces,
      words,
      lines,
      sentences,
      paragraphs,
      uniqueWords,
      averageWordLength: parseFloat(averageWordLength),
      readingTime,
      wordFrequency
    });
  }, []);

  const handleAnalyze = () => {
    if (!text.trim()) {
      setFeedback({ type: 'error', message: t('Please enter text to analyze') });
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        analyzeText(text);
        setLoading(false);
        setFeedback({ type: 'success', message: t('Text analysis completed successfully') });
      } catch (error) {
        setFeedback({ type: 'error', message: t('Analysis failed, please try again') });
        setLoading(false);
      }
    }, 500);
  };

  const handleCopy = () => {
    if (analysis) {
      const analysisText = `${t('Text Analysis Report')}:
${t('Characters')}: ${analysis.characters}
${t('Characters (no spaces)')}: ${analysis.charactersNoSpaces}
${t('Words')}: ${analysis.words}
${t('Lines')}: ${analysis.lines}
${t('Sentences')}: ${analysis.sentences}
${t('Paragraphs')}: ${analysis.paragraphs}
${t('Unique Words')}: ${analysis.uniqueWords}
${t('Average Word Length')}: ${analysis.averageWordLength}
${t('Reading Time')}: ${analysis.readingTime} ${t('minutes')}

${t('Top 10 Most Frequent Words')}:
${analysis.wordFrequency.map(({ word, count }) => `${word}: ${count}`).join('\n')}`;

      copyToClipboard(analysisText);
    }
  };

  // Auto-analyze when text changes (with debounce effect)
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeText(text);
    }, 300);
    return () => clearTimeout(timer);
  }, [text, analyzeText]);

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('Text Analyzer')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('Text Statistics Tool')}
        </Typography>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardHeader title={t('Input and Options')} />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                value={text}
                onChange={(e) => setText(e.target.value)}
                label={t('Enter text to analyze')}
                multiline
                rows={8}
                fullWidth
                variant="outlined"
                placeholder={t('Paste or type your text here for analysis...')}
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: 14
                  }
                }}
              />
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Analytics />}
                disabled={loading || !text.trim()}
                onClick={handleAnalyze}
                fullWidth
              >
                {loading ? t('Processing...') : t('Analyze')}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

        <Card variant="outlined">
          <CardHeader
            title={t('Processing Results')}
            action={
              analysis && (
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
                  <Typography>{t('Analyzing text, please wait...')}</Typography>
                </Stack>
              </Box>
            ) : analysis ? (
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="h4" color="primary">{analysis.characters.toLocaleString()}</Typography>
                      <Typography variant="body2" color="text.secondary">{t('Characters')}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="h4" color="primary">{analysis.words.toLocaleString()}</Typography>
                      <Typography variant="body2" color="text.secondary">{t('Words')}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="h4" color="primary">{analysis.lines}</Typography>
                      <Typography variant="body2" color="text.secondary">{t('Lines')}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="h4" color="primary">{analysis.sentences}</Typography>
                      <Typography variant="body2" color="text.secondary">{t('Sentences')}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider />

                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', color: 'info.contrastText', borderRadius: 1 }}>
                      <Typography variant="h4">{analysis.charactersNoSpaces.toLocaleString()}</Typography>
                      <Typography variant="body2">{t('Characters (no spaces)')}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 1 }}>
                      <Typography variant="h4">{analysis.paragraphs}</Typography>
                      <Typography variant="body2">{t('Paragraphs')}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', color: 'warning.contrastText', borderRadius: 1 }}>
                      <Typography variant="h4">{analysis.uniqueWords}</Typography>
                      <Typography variant="body2">{t('Unique Words')}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.light', color: 'secondary.contrastText', borderRadius: 1 }}>
                      <Typography variant="h4">{analysis.averageWordLength}</Typography>
                      <Typography variant="body2">{t('Avg Word Length')}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider />

                <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
                  <Typography variant="h3">{analysis.readingTime}</Typography>
                  <Typography variant="h6">{t('Reading Time (minutes)')}</Typography>
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                    {t('Based on 200 words per minute average reading speed')}
                  </Typography>
                </Box>

                {analysis.wordFrequency.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="h6" gutterBottom>{t('Most Frequent Words')}</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {analysis.wordFrequency.map(({ word, count }, index) => (
                          <Chip
                            key={word}
                            label={`${word} (${count})`}
                            color={index === 0 ? 'primary' : index < 3 ? 'secondary' : 'default'}
                            variant={index < 3 ? 'filled' : 'outlined'}
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </>
                )}
              </Stack>
            ) : (
              <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
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