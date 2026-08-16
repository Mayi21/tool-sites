import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Alert, Input, Textarea, Select,
  Chip, IconButton, Tooltip, Spinner, ToggleButtonGroup
} from '../ui';
import {
  Link, Copy, QrCode, BarChart3, Clock, ChevronDown, ChevronUp, Trash2
} from 'lucide-react';
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
    } catch {
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

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) setMode(newMode);
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
      <div className="w-full">
        <h1 className="text-xl font-semibold text-fg">{t('URL Shortener')}</h1>
        <p className="text-fg-secondary mb-3">
          {t('URL Shortener Tool')}
        </p>

        {/* 工具栏：所有操作集中 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <ToggleButtonGroup
            value={mode}
            onChange={handleModeChange}
            aria-label="url shortener mode"
            options={[
              { value: 'shorten', label: t('Shorten URL') },
              { value: 'expand', label: t('Expand URL') },
            ]}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            startIcon={loading ? <Spinner size={16} /> : <Link size={16} />}
            disabled={loading}
          >
            {loading ? t('Processing...') : (mode === 'shorten' ? t('Shorten URLs') : t('Expand URLs'))}
          </Button>
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <div className="flex gap-1">
            <Button size="small" variant="text" onClick={handleClear} disabled={!urlInput && results.length === 0} startIcon={<Trash2 size={16} />}>
              {t('Clear')}
            </Button>
            <Button size="small" variant="text" onClick={handleCopyAll} disabled={results.length === 0} startIcon={<Copy size={16} />}>
              {t('Copy All')}
            </Button>
          </div>
        </div>

        {feedback.message && <Alert severity={feedback.type} className="mb-4">{feedback.message}</Alert>}

        {/* 输入区 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Textarea
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              detectMode(e.target.value);
            }}
            label={mode === 'shorten' ? t('Enter URLs to shorten') : t('Enter short URLs to expand')}
            rows={4}
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
                size="small"
                startIcon={showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="self-start"
              >
                {t('Advanced Options')}
              </Button>

              {showAdvanced && (
                <div className="flex flex-col gap-4 border-l-2 border-line pl-4">
                  <Input
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    label={t('Custom Alias (Optional)')}
                    placeholder="my-custom-link"
                    helperText={t('Leave empty for auto-generated short code')}
                  />

                  <Select
                    label={t('Expiration')}
                    value={expireTime}
                    onChange={(e) => setExpireTime(e.target.value)}
                  >
                    <option value="never">{t('Never')}</option>
                    <option value="1hour">{t('1 Hour')}</option>
                    <option value="1day">{t('1 Day')}</option>
                    <option value="1week">{t('1 Week')}</option>
                    <option value="1month">{t('1 Month')}</option>
                    <option value="1year">{t('1 Year')}</option>
                  </Select>

                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    label={t('Password Protection (Optional)')}
                    type="password"
                    placeholder={t('Enter password to protect this URL')}
                    helperText={t('Leave empty for no password protection')}
                  />
                </div>
              )}
            </>
          )}
        </form>

        {/* 结果列表 */}
        <div className="mt-4 border-t border-line pt-4">
          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Spinner />
                <p className="text-fg">{t('Processing text, please wait...')}</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-4">
              {results.map((result, index) => (
                <div key={index} className="rounded-md border border-line p-4">
                  {mode === 'shorten' ? (
                    <div className="grid grid-cols-2 items-center gap-4">
                      <div>
                        <p className="mb-1 text-sm text-fg-secondary">
                          {t('Original URL')}
                        </p>
                        <p className="break-all rounded bg-muted p-2 text-xs text-fg">
                          {result.originalUrl}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-sm text-fg-secondary">
                          {t('Short URL')}
                        </p>
                        <div className="mb-2 flex items-center gap-2">
                          <p className="flex-grow rounded bg-primary p-2 font-mono text-white">
                            {result.shortUrl}
                          </p>
                          <Tooltip title={t('Copy')}>
                            <IconButton onClick={() => handleCopy(result.shortUrl)}>
                              <Copy size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('QR Code')}>
                            <IconButton onClick={() => handleQrCode(result.shortUrl)}>
                              <QrCode size={16} />
                            </IconButton>
                          </Tooltip>
                        </div>
                        <div className="flex gap-2">
                          <Chip label={<span className="inline-flex items-center gap-1"><BarChart3 size={12} />{`${result.clicks} clicks`}</span>} />
                          <Chip label={<span className="inline-flex items-center gap-1"><Clock size={12} />{result.created}</span>} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 items-center gap-4">
                      <div>
                        <p className="mb-1 text-sm text-fg-secondary">
                          {t('Short URL')}
                        </p>
                        <p className="rounded bg-muted p-2 font-mono text-fg">
                          {result.shortUrl}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-sm text-fg-secondary">
                          {t('Original URL')}
                        </p>
                        <div className="mb-2 flex items-center gap-2">
                          <p className="flex-grow break-all rounded bg-success p-2 text-xs text-white">
                            {result.originalUrl}
                          </p>
                          <Tooltip title={t('Copy')}>
                            <IconButton onClick={() => handleCopy(result.originalUrl)}>
                              <Copy size={16} />
                            </IconButton>
                          </Tooltip>
                        </div>
                        <div className="flex gap-2">
                          <Chip label={<span className="inline-flex items-center gap-1"><BarChart3 size={12} />{`${result.clicks} clicks`}</span>} />
                          <Chip label={<span className="inline-flex items-center gap-1"><Clock size={12} />{result.created}</span>} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center">
              <p className="text-fg-secondary">
                {t('Short URLs will appear here. Enter URLs above and click generate.')}
              </p>
            </div>
          )}
        </div>
      </div>

      <CopySuccessAnimation
        visible={showAnimation}
        onAnimationEnd={handleAnimationEnd}
      />
    </>
  );
}
