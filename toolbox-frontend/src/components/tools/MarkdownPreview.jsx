import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card, CardContent, Typography, TextField, Button, Stack, Grid, Paper
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';
import CopySuccessAnimation from '../CopySuccessAnimation';

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
  const [markdown, setMarkdown] = useState(`# Hello World

This is **bold** and *italic* text.

- List item 1
- List item 2

\`\`\`javascript
console.log("Hello World");
\`\`\``);
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  async function copyMarkdown() {
    if (markdown) {
      await copyToClipboard(markdown);
    }
  }

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>{t('Markdown Preview')}</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{t('Markdown')}</Typography>
                <Button size="small" onClick={copyMarkdown} startIcon={<ContentCopy />}>
                  {t('Copy')}
                </Button>
              </Stack>
              
              <TextField 
                value={markdown} 
                onChange={e => setMarkdown(e.target.value)} 
                multiline
                rows={20} 
                label={t('Enter markdown text')}
                variant="outlined"
                fullWidth
                sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace' } }}
              />
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="h6">{t('Preview')}</Typography>
              
              <Paper 
                variant="outlined"
                sx={{
                  p: 2,
                  minHeight: 480,
                  overflow: 'auto',
                  textAlign: 'left',
                  '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1 },
                  '& p': { my: 1 },
                  '& ul': { pl: 3 },
                  '& pre': { p: 1, bgcolor: 'action.hover', borderRadius: 1, whiteSpace: 'pre-wrap' },
                  '& code': { fontFamily: 'monospace' }
                }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Card>
      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </>
  );
} 