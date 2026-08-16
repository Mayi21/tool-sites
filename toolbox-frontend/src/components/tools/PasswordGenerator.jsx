import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Alert, Input, Textarea, Checkbox, Slider, Spinner } from '../ui';
import { Copy, RefreshCw, KeyRound, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';
import CopySuccessAnimation from '../CopySuccessAnimation';

// Helper functions (calculatePasswordStrength, generatePassword) remain the same
const calculatePasswordStrength = (password, t) => {
  let score = 0;
  if (password.length >= 12) score += 2; else if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 2;
  if (/(.)\1{2,}/.test(password)) score -= 2;
  if (score >= 7) return { level: 'strong', score: 100, textClass: 'text-success', barClass: 'bg-success', text: t('Strong'), icon: <CheckCircle2 size={20} className="text-success" /> };
  if (score >= 4) return { level: 'medium', score: 60, textClass: 'text-amber-600 dark:text-amber-400', barClass: 'bg-amber-500', text: t('Medium'), icon: <AlertTriangle size={20} className="text-amber-500" /> };
  return { level: 'weak', score: 30, textClass: 'text-danger', barClass: 'bg-danger', text: t('Weak'), icon: <XCircle size={20} className="text-danger" /> };
};

const generatePassword = (length, options) => {
  const charsets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };
  let charset = '';
  let password = '';
  options.forEach(opt => {
    charset += charsets[opt];
    password += charsets[opt][Math.floor(Math.random() * charsets[opt].length)];
  });
  if (!charset) return '';
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

export default function PasswordGenerator() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [generatedPasswords, setGeneratedPasswords] = useState([]);
  const [options, setOptions] = useState({ count: 5, length: 12, lowercase: true, uppercase: true, numbers: true, symbols: true });
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleOptionsChange = (event) => {
    const { name, value, type, checked } = event.target;
    setOptions(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleGenerate = () => {
    const selectedOptions = Object.keys(options).filter(key => options[key] === true);
    if (selectedOptions.length === 0) {
      setFeedback({ type: 'error', message: t('Please select at least one character type') });
      return;
    }
    setLoading(true);
    setGeneratedPasswords([]);
    setFeedback({ type: '', message: '' });
    setTimeout(() => {
      const passwords = Array.from({ length: options.count }, () => generatePassword(options.length, selectedOptions));
      setGeneratedPasswords(passwords);
      setLoading(false);
      setFeedback({ type: 'success', message: t('Passwords generated successfully') });
    }, 500);
  };

  const overallStrength = generatedPasswords.length > 0
    ? calculatePasswordStrength(generatedPasswords.join(''), t)
    : null;

  return (
    <>
      <div className="w-full">
        <div className="mb-2 flex items-center gap-2">
          <KeyRound size={22} className="text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('Password Generator')}</h1>
        </div>
        <p className="text-fg-secondary mb-3">
          {t('Password Generator Tool')}
        </p>

        {/* 工具栏：选项 + 操作 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <div className="w-24">
            <Input label={t('Number of Passwords')} type="number" name="count" value={options.count} onChange={handleOptionsChange} min={1} max={200} />
          </div>
          <div className="w-44">
            <p className="mb-1 text-sm text-fg">{t('Password Length')}: {options.length}</p>
            <Slider name="length" value={options.length} onChange={handleOptionsChange} min={6} max={128} aria-label="Password Length" />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Checkbox checked={options.lowercase} onChange={handleOptionsChange} name="lowercase" label={t('Lowercase (a-z)')} />
            <Checkbox checked={options.uppercase} onChange={handleOptionsChange} name="uppercase" label={t('Uppercase (A-Z)')} />
            <Checkbox checked={options.numbers} onChange={handleOptionsChange} name="numbers" label={t('Numbers (0-9)')} />
            <Checkbox checked={options.symbols} onChange={handleOptionsChange} name="symbols" label={t('Symbols (!@#$...)')} />
          </div>
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <div className="flex gap-1">
            <Button
              size="small"
              variant="text"
              onClick={handleGenerate}
              disabled={loading}
              startIcon={loading ? <Spinner size={16} /> : <RefreshCw size={16} />}
            >
              {loading ? t('Generating...') : t('Generate Passwords')}
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={() => copyToClipboard(generatedPasswords.join('\n'))}
              disabled={generatedPasswords.length === 0}
              startIcon={<Copy size={16} />}
            >
              {t('Copy')}
            </Button>
          </div>
        </div>

        {feedback.message && <Alert severity={feedback.type} className="mb-4">{feedback.message}</Alert>}

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Spinner />
              <p className="text-fg">{t('Processing text, please wait...')}</p>
            </div>
          </div>
        ) : generatedPasswords.length > 0 ? (
          <>
            <Textarea
              value={generatedPasswords.join('\n')}
              readOnly
              rows={10}
              label={t('Processing Results')}
              className="bg-muted text-xs"
            />
            {overallStrength && (
              <div className="mt-4">
                <p className="mb-2 font-medium text-fg">{t('Password Strength Analysis')}</p>
                <div className="flex items-center gap-2">
                  {overallStrength.icon}
                  <span className={`font-medium ${overallStrength.textClass}`}>{overallStrength.text}</span>
                  <span className="text-fg-secondary">({Math.round(overallStrength.score)}/100)</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${overallStrength.barClass}`}
                    style={{ width: `${overallStrength.score}%` }}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-line">
            <p className="text-fg-secondary">{t('Processing results will appear here. Enter text above and select an operation.')}</p>
          </div>
        )}
      </div>
      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </>
  );
}
