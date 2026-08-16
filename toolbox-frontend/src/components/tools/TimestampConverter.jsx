import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Select } from '../ui';
import { Copy, Pause, Play } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import useDebouncedEffect from '../../hooks/useDebouncedEffect.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

const pad = (n) => String(n).padStart(2, '0');
const formatDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

function UnitSelect({ value, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="w-24 shrink-0">
      <Select value={value} onChange={e => onChange(e.target.value)} aria-label="unit">
        <option value="s">{t('timestamp.unitSecond')}</option>
        <option value="ms">{t('timestamp.unitMilli')}</option>
      </Select>
    </div>
  );
}

function ResultBox({ value, onCopy, wide }) {
  const { t } = useTranslation();
  return (
    <>
      <input
        readOnly
        value={value}
        placeholder={t('Converted result will appear here')}
        className={`${wide ? 'w-64' : 'w-52'} shrink-0 rounded-lg border border-line bg-muted px-3 py-2 font-mono text-sm text-fg outline-none`}
      />
      <Button size="small" variant="text" onClick={onCopy} disabled={!value} startIcon={<Copy size={15} />}>
        {t('Copy')}
      </Button>
    </>
  );
}

export default function TimestampConverter() {
  const { t } = useTranslation();
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  /* 1. 当前时间戳（每秒刷新，可暂停） */
  const [now, setNow] = useState(() => new Date());
  const [running, setRunning] = useState(true);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [running]);
  const nowTs = Math.floor(now.getTime() / 1000);

  /* 2. 时间戳 → 时间 */
  const [tsInput, setTsInput] = useState('');
  const [tsUnit, setTsUnit] = useState('s');
  const [tsResult, setTsResult] = useState('');
  const [tsError, setTsError] = useState('');
  // 10/13 位数字自动识别 秒/毫秒
  useEffect(() => {
    const digits = tsInput.trim();
    if (/^\d{13}$/.test(digits)) setTsUnit('ms');
    else if (/^\d{10}$/.test(digits)) setTsUnit('s');
  }, [tsInput]);
  useDebouncedEffect(() => {
    const v = tsInput.trim();
    if (!v) { setTsResult(''); setTsError(''); return; }
    if (!/^-?\d+$/.test(v)) { setTsResult(''); setTsError(t('timestamp.invalidTs')); return; }
    const ms = tsUnit === 'ms' ? Number(v) : Number(v) * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) { setTsResult(''); setTsError(t('timestamp.invalidTs')); return; }
    setTsResult(formatDate(d));
    setTsError('');
  }, [tsInput, tsUnit]);

  /* 3. 时间字符串 → 时间戳 */
  const [dateInput, setDateInput] = useState('');
  const [dateUnit, setDateUnit] = useState('s');
  const [dateResult, setDateResult] = useState('');
  const [dateError, setDateError] = useState('');
  useDebouncedEffect(() => {
    const v = dateInput.trim();
    if (!v) { setDateResult(''); setDateError(''); return; }
    // 统一分隔符，兼容 2026-08-16 / 2026/8/16 等写法
    const d = new Date(v.replace(/-/g, '/'));
    if (isNaN(d.getTime())) { setDateResult(''); setDateError(t('timestamp.invalidDate')); return; }
    setDateResult(String(dateUnit === 'ms' ? d.getTime() : Math.floor(d.getTime() / 1000)));
    setDateError('');
  }, [dateInput, dateUnit]);

  /* 4. 年月日时分秒 → 时间戳 */
  const [fields, setFields] = useState({ y: String(new Date().getFullYear()), M: '', d: '', h: '', m: '', s: '' });
  const [fieldsUnit, setFieldsUnit] = useState('s');
  const [fieldsResult, setFieldsResult] = useState('');
  const [fieldsError, setFieldsError] = useState('');
  const setField = (key) => (e) => setFields(f => ({ ...f, [key]: e.target.value }));
  useDebouncedEffect(() => {
    const { y, M, d, h, m, s } = fields;
    if (!y.trim()) { setFieldsResult(''); setFieldsError(''); return; }
    const date = new Date(
      Number(y), (Number(M) || 1) - 1, Number(d) || 1,
      Number(h) || 0, Number(m) || 0, Number(s) || 0
    );
    if (isNaN(date.getTime())) { setFieldsResult(''); setFieldsError(t('timestamp.invalidDate')); return; }
    setFieldsResult(String(fieldsUnit === 'ms' ? date.getTime() : Math.floor(date.getTime() / 1000)));
    setFieldsError('');
  }, [fields, fieldsUnit]);

  const fieldDefs = [
    { key: 'y', label: t('timestamp.year'), width: 'w-20' },
    { key: 'M', label: t('timestamp.month'), width: 'w-14' },
    { key: 'd', label: t('timestamp.day'), width: 'w-14' },
    { key: 'h', label: t('timestamp.hour'), width: 'w-14' },
    { key: 'm', label: t('timestamp.minute'), width: 'w-14' },
    { key: 's', label: t('timestamp.second'), width: 'w-14' },
  ];

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('Timestamp Converter')}</h1>
        <p className="text-fg-secondary mb-4">{t('Unix Timestamp Converter')}</p>

        {/* 1. 当前时间戳 */}
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
          <span className="text-sm font-medium text-fg">{t('timestamp.nowLabel')}</span>
          <span className="rounded-lg border border-line bg-paper px-3 py-1.5 font-mono text-xl font-semibold text-[#fa8c16]">
            {nowTs}
          </span>
          <Button
            size="small"
            variant="text"
            onClick={() => { if (!running) setNow(new Date()); setRunning(r => !r); }}
            startIcon={running ? <Pause size={15} /> : <Play size={15} />}
          >
            {running ? t('timestamp.pause') : t('timestamp.resume')}
          </Button>
          <Button size="small" variant="text" onClick={() => copyToClipboard(String(nowTs))} startIcon={<Copy size={15} />}>
            {t('Copy')}
          </Button>
          <span className="ml-auto font-mono text-sm text-fg-secondary">{formatDate(now)}</span>
        </div>

        {/* 2. 时间戳 → 时间 */}
        <div className="mt-4 border-t border-line pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-28 shrink-0 text-sm text-fg-secondary">{t('timestamp.tsLabel')}</span>
            <div className="w-56 shrink-0">
              <Input
                value={tsInput}
                onChange={e => setTsInput(e.target.value)}
                placeholder="1786847109"
                className="font-mono"
              />
            </div>
            <UnitSelect value={tsUnit} onChange={setTsUnit} />
            <span className="text-fg-tertiary">→</span>
            <ResultBox value={tsResult} onCopy={() => tsResult && copyToClipboard(tsResult)} wide />
          </div>
          {tsError && <p className="mt-1 pl-32 text-xs text-danger">{tsError}</p>}
        </div>

        {/* 3. 时间字符串 → 时间戳 */}
        <div className="mt-4 border-t border-line pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-28 shrink-0 text-sm text-fg-secondary">{t('timestamp.dateLabel')}</span>
            <div className="w-56 shrink-0">
              <Input
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                placeholder="2026-08-16 12:00:00"
                className="font-mono"
              />
            </div>
            <span className="text-fg-tertiary">→</span>
            <ResultBox value={dateResult} onCopy={() => dateResult && copyToClipboard(dateResult)} />
            <UnitSelect value={dateUnit} onChange={setDateUnit} />
          </div>
          {dateError && <p className="mt-1 pl-32 text-xs text-danger">{dateError}</p>}
        </div>

        {/* 4. 年月日时分秒 → 时间戳 */}
        <div className="mt-4 border-t border-line pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-28 shrink-0 text-sm text-fg-secondary">{t('timestamp.fieldsLabel')}</span>
            {fieldDefs.map(({ key, label, width }) => (
              <span key={key} className="flex items-center gap-1">
                <input
                  value={fields[key]}
                  onChange={setField(key)}
                  inputMode="numeric"
                  className={`${width} rounded-lg border border-line bg-paper px-2 py-2 text-center font-mono text-sm text-fg outline-none focus:border-primary`}
                />
                <span className="text-sm text-fg-secondary">{label}</span>
              </span>
            ))}
            <span className="text-fg-tertiary">→</span>
            <ResultBox value={fieldsResult} onCopy={() => fieldsResult && copyToClipboard(fieldsResult)} />
            <UnitSelect value={fieldsUnit} onChange={setFieldsUnit} />
          </div>
          {fieldsError && <p className="mt-1 pl-32 text-xs text-danger">{fieldsError}</p>}
        </div>
      </div>

      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </>
  );
}
