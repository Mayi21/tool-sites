import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, RefreshCw } from 'lucide-react';
import { Checkbox, Slider } from '../../ui';
import useCopyWithAnimation from '../../../hooks/useCopyWithAnimation';
import CopySuccessAnimation from '../../CopySuccessAnimation';

// 以下两个纯函数与 PasswordGenerator.jsx 保持一致（复制而非重构，避免影响已上线工具页）
const CHARSETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const generatePassword = (length, options) => {
  let charset = '';
  let password = '';
  options.forEach(opt => {
    charset += CHARSETS[opt];
    password += CHARSETS[opt][Math.floor(Math.random() * CHARSETS[opt].length)];
  });
  if (!charset) return '';
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

const strengthScore = (password) => {
  let score = 0;
  if (password.length >= 12) score += 2; else if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 2;
  if (/(.)\1{2,}/.test(password)) score -= 2;
  return score;
};

/**
 * 密码小组件：S 一条密码；M 加长度滑杆；L 再加字符集与强度条
 */
export default function PasswordWidget({ size }) {
  const { t } = useTranslation();
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const [length, setLength] = useState(16);
  const [sets, setSets] = useState({ lowercase: true, uppercase: true, numbers: true, symbols: true });
  const [password, setPassword] = useState(() =>
    generatePassword(16, Object.keys(CHARSETS))
  );

  // 长度或字符集变化时即时重新生成
  useEffect(() => {
    const opts = Object.keys(sets).filter(k => sets[k]);
    setPassword(generatePassword(length, opts.length ? opts : ['lowercase']));
  }, [length, sets]);

  const score = strengthScore(password);
  const strength = score >= 7
    ? { label: t('Strong'), barClass: 'bg-success', textClass: 'text-success', width: 100 }
    : score >= 4
      ? { label: t('Medium'), barClass: 'bg-amber-500', textClass: 'text-amber-600 dark:text-amber-400', width: 60 }
      : { label: t('Weak'), barClass: 'bg-danger', textClass: 'text-danger', width: 30 };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 font-mono text-sm text-fg" title={password}>
          {password}
        </span>
        <button
          type="button"
          onClick={() => {
            const opts = Object.keys(sets).filter(k => sets[k]);
            setPassword(generatePassword(length, opts.length ? opts : ['lowercase']));
          }}
          title={t('Regenerate')}
          className="shrink-0 cursor-pointer rounded-md p-1.5 text-fg-tertiary transition-colors hover:bg-muted hover:text-fg"
        >
          <RefreshCw size={14} />
        </button>
        <button
          type="button"
          onClick={() => copyToClipboard(password)}
          title={t('Copy')}
          className="shrink-0 cursor-pointer rounded-md p-1.5 text-fg-tertiary transition-colors hover:bg-muted hover:text-fg"
        >
          <Copy size={14} />
        </button>
      </div>

      {size !== 's' && (
        <div>
          <p className="mb-1 text-xs text-fg-secondary">{t('Password Length')}: {length}</p>
          <Slider min={8} max={32} value={length} onChange={e => setLength(Number(e.target.value))} aria-label={t('Password Length')} />
        </div>
      )}

      {size === 'l' && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {Object.keys(CHARSETS).map(key => (
              <Checkbox
                key={key}
                checked={sets[key]}
                onChange={() => setSets(s => ({ ...s, [key]: !s[key] }))}
                label={t(key === 'symbols' ? 'Symbols (!@#$...)' : key === 'numbers' ? 'Numbers (0-9)' : key === 'uppercase' ? 'Uppercase (A-Z)' : 'Lowercase (a-z)')}
                className="text-xs"
              />
            ))}
          </div>
          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs">
              <span className={strength.textClass}>{strength.label}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full transition-all ${strength.barClass}`} style={{ width: `${strength.width}%` }} />
            </div>
          </div>
        </div>
      )}

      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </div>
  );
}
