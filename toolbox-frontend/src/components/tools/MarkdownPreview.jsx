import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, CircularProgress, Box, Alert, Stack, CardHeader, CardContent,
  Paper
} from '@mui/material';
import { ContentCopy, Preview, Refresh } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

// Basic markdown renderer, kept as is.
function renderMarkdown(text) {
  // A more robust solution would use a library like Marked or react-markdown
  const html = text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/^\s*[-*] (.*$)/gim, '<ul>\n<li>$1</li>\n</ul>')
    .replace(/<\/ul>\n<ul>/gim, '') // Merge consecutive lists
    .replace(/\n\n/gim, '</p><p>')
    .replace(/^<p>(.*)<\/p>$/gim, '$1'); // Avoid wrapping everything in <p>

  return `<p>${html}</p>`;
}

export default function MarkdownPreview() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState(`# ${t('Hello World')}

${t('This is')} **${t('bold')}** ${t('and')} *${t('italic')}* ${t('text')}.

- ${t('List item')} 1
- ${t('List item')} 2

\`\`\`javascript
console.log("${t('Hello World')}");
\`\`\``);
  const [renderedHtml, setRenderedHtml] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handlePreview = () => {
    if (!markdown.trim()) {
      setFeedback({ type: 'error', message: t('Please enter markdown text to preview') });
      return;
    }

    setLoading(true);
    setRenderedHtml('');
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        const html = renderMarkdown(markdown);
        setRenderedHtml(html);
        setLoading(false);
        setFeedback({ type: 'success', message: t('Markdown preview generated successfully') });
      } catch (error) {
        setFeedback({ type: 'error', message: t('Preview generation failed, please try again') });
        setLoading(false);
      }
    }, 300);
  };

  const handleCopy = () => {
    if (markdown) {
      copyToClipboard(markdown);
    }
  };

  // Auto-preview when markdown changes (with debounce)
  const debouncedPreview = useCallback(() => {
    const timer = setTimeout(() => {
      if (markdown.trim()) {
        const html = renderMarkdown(markdown);
        setRenderedHtml(html);
      } else {
        setRenderedHtml('');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [markdown]);

  // Effect for auto-preview
  useEffect(() => {
    const cleanup = debouncedPreview();
    return cleanup;
  }, [debouncedPreview]);

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('Markdown Preview')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('Markdown Preview Tool')}
        </Typography>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardHeader title={t('Input Text')} />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                label={t('Enter text to process')}
                multiline
                rows={12}
                fullWidth
                variant="outlined"
                placeholder={t('Paste or type your text here for processing...')}
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: 14
                  }
                }}
              />

              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Preview />}
                disabled={loading || !markdown.trim()}
                onClick={handlePreview}
                fullWidth
              >
                {loading ? t('Previewing...') : t('Preview')}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

        <Card variant="outlined">
          <CardHeader
            title={t('Markdown Preview')}
            action={
              renderedHtml && (
                <Button size="small" onClick={handleCopy} startIcon={<ContentCopy />}>
                  {t('Copy')}
                </Button>
              )
            }
          />
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Stack alignItems="center" spacing={1}>
                  <CircularProgress />
                  <Typography>{t('Generating preview, please wait...')}</Typography>
                </Stack>
              </Box>
            ) : renderedHtml ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  minHeight: 400,
                  overflow: 'auto',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    mt: 2,
                    mb: 1,
                    color: 'text.primary',
                    fontWeight: 'bold'
                  },
                  '& p': {
                    my: 1,
                    color: 'text.primary',
                    lineHeight: 1.6
                  },
                  '& ul': {
                    pl: 3,
                    my: 1
                  },
                  '& li': {
                    color: 'text.primary',
                    mb: 0.5
                  },
                  '& pre': {
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.875rem',
                    border: '1px solid',
                    borderColor: 'grey.300'
                  },
                  '& code': {
                    fontFamily: 'monospace',
                    bgcolor: 'grey.100',
                    px: 1,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontSize: '0.875rem'
                  },
                  '& pre code': {
                    bgcolor: 'transparent',
                    px: 0,
                    py: 0
                  },
                  '& strong': {
                    fontWeight: 'bold',
                    color: 'text.primary'
                  },
                  '& em': {
                    fontStyle: 'italic',
                    color: 'text.secondary'
                  }
                }}
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            ) : (
              <Box sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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