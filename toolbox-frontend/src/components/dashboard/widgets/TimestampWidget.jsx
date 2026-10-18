import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy } from 'lucide-react';
import { Input } from '../../ui';
import useCopyWithAnimation from '../../../hooks/useCopyWithAnimation';
import useDebouncedEffect from '../../../hooks/useDebouncedEffect';
import CopySuccessAnimation from '../../CopySuccessAnimation';

const pad = (n) => String(n).padStart(2, '0');
const formatDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

/**
 * 时间戳小组件：S 当前时间戳时钟；M 加时间戳→日期；L 再加日期→时间戳
 */
export default function TimestampWidget({ size }) {
  const { t } = useTranslation();
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  /* 当前时间戳（每秒刷新） */
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const nowTs = Math.floor(now.getTime() / 1000);

  /* 时间戳 → 日期 */
  const [tsInput, setTsInput] = useState('');
  const [tsResult, setTsResult] = useState('');
  const [tsError, setTsError] = useState('');
  useDebouncedEffect(() => {
    const v = tsInput.trim();
    if (!v) { setTsResult(''); setTsError(''); return; }
    if (!/^-?\d+$/.test(v)) { setTsResult(''); setTsError(t('Invalid timestamp')); return; }
    // 10/13 位数字自动识别 秒/毫秒
    const d = new Date(v.length === 13 ? Number(v) : Number(v) * 1000);
    if (isNaN(d.getTime())) { setTsResult(''); setTsError(t('Invalid timestamp')); return; }
    setTsResult(formatDate(d));
    setTsError('');
  }, [tsInput]);

  /* 日期 → 时间戳（仅 L） */
  const [dateInput, setDateInput] = useState('');
  const [dateResult, setDateResult] = useState('');
  const [dateError, setDateError] = useState('');
  useDebouncedEffect(() => {
    const v = dateInput.trim();
    if (!v) { setDateResult(''); setDateError(''); return; }
    // 统一分隔符，兼容 2026-08-16 / 2026/8/16 等写法
    const d = new Date(v.replace(/-/g, '/'));
    if (isNaN(d.getTime())) { setDateResult(''); setDateError(t('Invalid date')); return; }
    setDateResult(String(Math.floor(d.getTime() / 1000)));
    setDateError('');
  }, [dateInput]);

  return (
    <div className="flex h-full flex-col gap-2">
      <button
        type="button"
        onClick={() => copyToClipboard(String(nowTs))}
        title={t('Click to copy timestamp')}
        className="flex w-fit cursor-pointer items-baseline gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-muted"
      >
        <span className="font-mono text-xl font-semibold text-[#fa8c16]">{nowTs}</span>
        <span className="font-mono text-[11px] text-fg-secondary">{formatDate(now)}</span>
      </button>

      {size !== 's' && (
        <div>
          <div className="flex items-center gap-1.5">
            <Input
              value={tsInput}
              onChange={e => setTsInput(e.target.value)}
              placeholder={t('Enter timestamp')}
              className="h-8 flex-1 px-2 py-1 font-mono text-xs"
            />
            <span className="shrink-0 text-xs text-fg-tertiary">→</span>
            <span className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 font-mono text-xs text-fg" title={tsResult}>
              {tsResult || '—'}
            </span>
            <button
              type="button"
              onClick={() => tsResult && copyToClipboard(tsResult)}
              title={t('Copy')}
              className="shrink-0 cursor-pointer rounded-md p-1 text-fg-tertiary transition-colors hover:bg-muted hover:text-fg"
            >
              <Copy size={13} />
            </button>
          </div>
          {tsError && <p className="mt-1 text-xs text-danger">{tsError}</p>}
        </div>
      )}

      {size === 'l' && (
        <div>
          <div className="flex items-center gap-1.5">
            <Input
              value={dateInput}
              onChange={e => setDateInput(e.target.value)}
              placeholder={t('Enter date')}
              className="h-8 flex-1 px-2 py-1 font-mono text-xs"
            />
            <span className="shrink-0 text-xs text-fg-tertiary">→</span>
            <span className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 font-mono text-xs text-fg" title={dateResult}>
              {dateResult || '—'}
            </span>
            <button
              type="button"
              onClick={() => dateResult && copyToClipboard(dateResult)}
              title={t('Copy')}
              className="shrink-0 cursor-pointer rounded-md p-1 text-fg-tertiary transition-colors hover:bg-muted hover:text-fg"
            >
              <Copy size={13} />
            </button>
          </div>
          {dateError && <p className="mt-1 text-xs text-danger">{dateError}</p>}
        </div>
      )}

      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </div>
  );
}
