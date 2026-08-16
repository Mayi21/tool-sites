import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Textarea, Alert, Tabs, Tab } from '../ui';
import { Copy, Lock, KeyRound, Fingerprint, X } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import useDebouncedEffect from '../../hooks/useDebouncedEffect.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

export default function JwtDecoder() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [decoded, setDecoded] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  const handleCopyPart = (part) => {
    if (decoded) {
      copyToClipboard(decoded[part]);
    }
  };

  // 输入变化时实时解码
  useDebouncedEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setDecoded(null);
      setError('');
      return;
    }
    try {
      const parts = input.trim().split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format - must have 3 parts');
      }

      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      const decodedData = {
        header: JSON.stringify(header, null, 2),
        payload: JSON.stringify(payload, null, 2),
        signature: parts[2]
      };

      setDecoded(decodedData);
      setOutput(`=== JWT HEADER ===\n${decodedData.header}\n\n=== JWT PAYLOAD ===\n${decodedData.payload}\n\n=== JWT SIGNATURE ===\n${decodedData.signature}`);
      setError('');
    } catch (e) {
      setOutput('');
      setDecoded(null);
      setError(t('Invalid JWT format: {{error}}', { error: e.message }));
    }
  }, [input]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('JWT Decoder')}</h1>
        <p className="text-fg-secondary mb-3">
          {t('JWT Token Decoder')}
        </p>

        {/* 工具栏：所有操作集中 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <div className="flex gap-1">
            <Button size="small" variant="text" onClick={() => setInput('')} disabled={!input} startIcon={<X size={16} />}>
              {t('Clear')}
            </Button>
            <Button size="small" variant="text" onClick={handleCopy} disabled={!output} startIcon={<Copy size={16} />}>
              {t('Copy')}
            </Button>
          </div>
        </div>

        {error && (
          <Alert severity="error" className="mb-3">
            {error}
          </Alert>
        )}

        {/* 左输入 / 右结果 */}
        <div className="grid grid-cols-2 gap-4">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            label={t('Enter JWT token')}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
            rows={18}
            className="h-[calc(100vh-250px)] min-h-[320px] text-xs"
          />
          <div>
            {decoded ? (
              <div>
                <Tabs value={activeTab} onChange={handleTabChange} className="mb-4">
                  <Tab
                    value={0}
                    label={
                      <span className="inline-flex items-center gap-2">
                        <Lock size={16} />
                        {t('Header')}
                      </span>
                    }
                  />
                  <Tab
                    value={1}
                    label={
                      <span className="inline-flex items-center gap-2">
                        <Fingerprint size={16} />
                        {t('Payload')}
                      </span>
                    }
                  />
                  <Tab
                    value={2}
                    label={
                      <span className="inline-flex items-center gap-2">
                        <KeyRound size={16} />
                        {t('Signature')}
                      </span>
                    }
                  />
                </Tabs>

                {activeTab === 0 && (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      value={decoded.header}
                      readOnly
                      rows={12}
                      label={t('JWT Header')}
                      className="bg-muted text-xs"
                    />
                    <div className="flex justify-end">
                      <Button variant="text" size="small" onClick={() => handleCopyPart('header')} startIcon={<Copy size={16} />}>
                        {t('Copy')}
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 1 && (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      value={decoded.payload}
                      readOnly
                      rows={12}
                      label={t('JWT Payload')}
                      className="bg-muted text-xs"
                    />
                    <div className="flex justify-end">
                      <Button variant="text" size="small" onClick={() => handleCopyPart('payload')} startIcon={<Copy size={16} />}>
                        {t('Copy')}
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 2 && (
                  <div className="flex flex-col gap-2">
                    <Input
                      value={decoded.signature}
                      readOnly
                      label={t('JWT Signature')}
                      className="bg-muted font-mono text-center"
                    />
                    <div className="flex justify-end">
                      <Button variant="text" size="small" onClick={() => handleCopyPart('signature')} startIcon={<Copy size={16} />}>
                        {t('Copy')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[280px] flex items-center justify-center rounded-lg border border-line bg-muted">
                <p className="text-fg-secondary text-center">
                  {t('JWT token parts will appear here. Enter a valid JWT token and click Decode JWT.')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </>
  );
}
