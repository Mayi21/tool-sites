import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Card, TextField, CircularProgress, Box, Alert, Stack, CardHeader, CardContent,
  FormControl, InputLabel, Select, MenuItem, Grid, Chip, IconButton, Tooltip
} from '@mui/material';
import {
  Link, ContentCopy, QrCode2, Analytics, AccessTime, ExpandMore, ExpandLess,
  Delete, Refresh
} from '@mui/icons-material';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';
import UrlShortenerApiService from '../../services/urlShortenerService.js';

export default function UrlShortener() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('shorten'); // 'shorten' | 'expand'
  const [urlInput, setUrlInput] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expireTime, setExpireTime] = useState('never');
  const [password, setPassword] = useState('');
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleQrCode = (shortUrl) => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}`;
    window.open(qrCodeUrl, '_blank');
  };

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!urlInput.trim()) {
      setFeedback({ type: 'error', message: t('Please enter a URL') });
      return;
    }

    const urls = urlInput.split('\n').filter(url => url.trim());

    if (mode === 'shorten') {
      // 验证URL格式
      const hasInvalidUrl = urls.some(url => !UrlShortenerApiService.isValidUrl(url.trim()));
      if (hasInvalidUrl) {
        setFeedback({ type: 'error', message: t('Please enter valid URLs') });
        return;
      }
    }

    setLoading(true);
    setResults([]);
    setFeedback({ type: '', message: '' });

    try {
      if (mode === 'shorten') {
        let apiResult;

        if (urls.length === 1) {
          // 单个URL处理
          apiResult = await UrlShortenerApiService.shortenUrl(urls[0].trim(), {
            alias: customAlias,
            expireTime: expireTime === 'never' ? null : expireTime,
            password: password || undefined
          });

          if (apiResult.success) {
            const resultData = {
              ...apiResult.data,
              clicks: 0,
              created: new Date(apiResult.data.createdAt).toLocaleString()
            };
            setResults([resultData]);
            setFeedback({ type: 'success', message: t('Short URLs generated successfully') });
          } else {
            setFeedback({ type: 'error', message: apiResult.error });
          }
        } else {
          // 批量处理
          apiResult = await UrlShortenerApiService.shortenUrlsBatch(urls, {
            expireTime: expireTime === 'never' ? null : expireTime
          });

          if (apiResult.success) {
            const successfulResults = apiResult.data
              .filter(r => r.success)
              .map(r => ({
                ...r.data,
                clicks: 0,
                created: new Date(r.data.createdAt).toLocaleString()
              }));

            setResults(successfulResults);
            setFeedback({
              type: apiResult.successful === apiResult.total ? 'success' : 'warning',
              message: `${apiResult.successful}/${apiResult.total} URLs processed successfully`
            });
          } else {
            setFeedback({ type: 'error', message: apiResult.error });
          }
        }
      } else {
        // 展开短链
        const shortCodes = urls.map(url => UrlShortenerApiService.extractShortCode(url.trim()));
        const apiResult = await UrlShortenerApiService.expandUrlsBatch(shortCodes);

        if (apiResult.success) {
          const successfulResults = apiResult.data
            .filter(r => r.success)
            .map(r => ({
              shortUrl: r.inputUrl,
              originalUrl: r.data.originalUrl,
              title: 'Expanded URL', // 可以通过额外API获取页面标题
              description: '',
              clicks: r.data.clicks || 0,
              created: new Date(r.data.createdAt).toLocaleString()
            }));

          setResults(successfulResults);
          setFeedback({
            type: apiResult.successful === apiResult.total ? 'success' : 'warning',
            message: `${apiResult.successful}/${apiResult.total} URLs expanded successfully`
          });
        } else {
          setFeedback({ type: 'error', message: apiResult.error });
        }
      }
    } catch (error) {
      setFeedback({ type: 'error', message: t('Operation failed, please try again') });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    copyToClipboard(text);
  };

  const handleCopyAll = () => {
    const allUrls = results.map(r => mode === 'shorten' ? r.shortUrl : r.originalUrl).join('\n');
    copyToClipboard(allUrls);
  };

  const handleClear = () => {
    setUrlInput('');
    setCustomAlias('');
    setPassword('');
    setResults([]);
    setFeedback({ type: '', message: '' });
  };

  const detectMode = (input) => {
    if (!input.trim()) return;

    const urls = input.split('\n').filter(url => url.trim());
    if (urls.length > 0) {
      const firstUrl = urls[0].trim();
      if (UrlShortenerApiService.isShortUrl(firstUrl)) {
        setMode('expand');
      } else if (UrlShortenerApiService.isValidUrl(firstUrl)) {
        setMode('shorten');
      }
    }
  };

  return (
    <>
      <Card sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" component="h1">{t('URL Shortener')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('URL Shortener Tool')}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardHeader title={t('Input and Options')} />
            <CardContent>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="mode-label">{t('Mode')}</InputLabel>
                  <Select
                    labelId="mode-label"
                    value={mode}
                    label={t('Mode')}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <MenuItem value="shorten">{t('Shorten URL')}</MenuItem>
                    <MenuItem value="expand">{t('Expand URL')}</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    detectMode(e.target.value);
                  }}
                  label={mode === 'shorten' ? t('Enter URLs to shorten') : t('Enter short URLs to expand')}
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  placeholder={mode === 'shorten'
                    ? t('https://example.com/very/long/url\nhttps://another-example.com/path')
                    : t('https://bit.ly/3abc123\nhttps://t.co/xyz789')
                  }
                  helperText={t('Enter one URL per line for batch processing')}
                />

                {mode === 'shorten' && (
                  <>
                    <Button
                      variant="text"
                      startIcon={showAdvanced ? <ExpandLess /> : <ExpandMore />}
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {t('Advanced Options')}
                    </Button>

                    {showAdvanced && (
                      <Stack spacing={2} sx={{ pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                        <TextField
                          value={customAlias}
                          onChange={(e) => setCustomAlias(e.target.value)}
                          label={t('Custom Alias (Optional)')}
                          fullWidth
                          variant="outlined"
                          placeholder="my-custom-link"
                          helperText={t('Leave empty for auto-generated short code')}
                        />

                        <FormControl fullWidth>
                          <InputLabel id="expire-label">{t('Expiration')}</InputLabel>
                          <Select
                            labelId="expire-label"
                            value={expireTime}
                            label={t('Expiration')}
                            onChange={(e) => setExpireTime(e.target.value)}
                          >
                            <MenuItem value="never">{t('Never')}</MenuItem>
                            <MenuItem value="1hour">{t('1 Hour')}</MenuItem>
                            <MenuItem value="1day">{t('1 Day')}</MenuItem>
                            <MenuItem value="1week">{t('1 Week')}</MenuItem>
                            <MenuItem value="1month">{t('1 Month')}</MenuItem>
                            <MenuItem value="1year">{t('1 Year')}</MenuItem>
                          </Select>
                        </FormControl>

                        <TextField
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          label={t('Password Protection (Optional)')}
                          type="password"
                          fullWidth
                          variant="outlined"
                          placeholder={t('Enter password to protect this URL')}
                          helperText={t('Leave empty for no password protection')}
                        />
                      </Stack>
                    )}
                  </>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Link />}
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? t('Processing...') : (mode === 'shorten' ? t('Shorten URLs') : t('Expand URLs'))}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      startIcon={<Delete />}
                      onClick={handleClear}
                      fullWidth
                    >
                      {t('Clear')}
                    </Button>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </form>

        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

        <Card variant="outlined">
          <CardHeader
            title={t('Processing Results')}
            action={
              results.length > 0 && (
                <Button size="small" onClick={handleCopyAll} startIcon={<ContentCopy />}>
                  {t('Copy All')}
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
            ) : results.length > 0 ? (
              <Stack spacing={2}>
                {results.map((result, index) => (
                  <Card key={index} variant="outlined" sx={{ p: 2 }}>
                    {mode === 'shorten' ? (
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {t('Original URL')}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              wordBreak: 'break-all',
                              fontSize: '0.8rem',
                              backgroundColor: 'grey.50',
                              p: 1,
                              borderRadius: 1
                            }}
                          >
                            {result.originalUrl}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {t('Short URL')}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontFamily: 'monospace',
                                backgroundColor: 'primary.light',
                                color: 'primary.contrastText',
                                p: 1,
                                borderRadius: 1,
                                flexGrow: 1
                              }}
                            >
                              {result.shortUrl}
                            </Typography>
                            <Tooltip title={t('Copy')}>
                              <IconButton size="small" onClick={() => handleCopy(result.shortUrl)}>
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('QR Code')}>
                              <IconButton size="small" onClick={() => handleQrCode(result.shortUrl)}>
                                <QrCode2 fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Chip size="small" icon={<Analytics />} label={`${result.clicks} clicks`} />
                            <Chip size="small" icon={<AccessTime />} label={result.created} />
                          </Stack>
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {t('Short URL')}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              fontFamily: 'monospace',
                              backgroundColor: 'grey.50',
                              p: 1,
                              borderRadius: 1
                            }}
                          >
                            {result.shortUrl}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {t('Original URL')}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                wordBreak: 'break-all',
                                fontSize: '0.8rem',
                                backgroundColor: 'success.light',
                                color: 'success.contrastText',
                                p: 1,
                                borderRadius: 1,
                                flexGrow: 1
                              }}
                            >
                              {result.originalUrl}
                            </Typography>
                            <Tooltip title={t('Copy')}>
                              <IconButton size="small" onClick={() => handleCopy(result.originalUrl)}>
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Chip size="small" icon={<Analytics />} label={`${result.clicks} clicks`} />
                            <Chip size="small" icon={<AccessTime />} label={result.created} />
                          </Stack>
                        </Grid>
                      </Grid>
                    )}
                  </Card>
                ))}
              </Stack>
            ) : (
              <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  {t('Short URLs will appear here. Enter URLs above and click generate.')}
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