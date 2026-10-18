import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { Copy, X } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

// 以 bit 为基准，因子均为 2 的幂（1024 进制），乘除只改指数不改尾数，整数换算无舍入误差
const UNITS = [
  { key: 'bit', cap: 'Bit', factor: 1 },
  { key: 'byte', cap: 'Byte', factor: 8 },
  { key: 'KB', cap: 'KB', factor: 8 * 1024 },
  { key: 'MB', cap: 'MB', factor: 8 * 1024 ** 2 },
  { key: 'GB', cap: 'GB', factor: 8 * 1024 ** 3 },
  { key: 'TB', cap: 'TB', factor: 8 * 1024 ** 4 },
];

const SIG = 13; // 有效数字位数，足以精确显示 2^40 = 1099511627776 这类常见值
const trimZeros = (s) =>
  s.includes('e') ? s : s.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0*$/, '');

// 常规数值保留 13 位有效数字并去掉末尾 0；极端大小改用科学计数法
const formatNumber = (n) => {
  if (!Number.isFinite(n)) return '';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e21 || abs < 1e-6) return trimZeros(n.toExponential(6));
  return trimZeros(String(Number(n.toPrecision(SIG))));
};

// 解析用户输入：容忍千分位逗号，允许 +、1e3、.5，拒绝负数与非有限值
const parseAmount = (raw) => {
  const s = raw.trim().replace(/,/g, '');
  if (s === '') return { empty: true };
  if (!/^\+?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(s)) return { error: true };
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return { error: true };
  return { value: n };
};

export default function DataSizeConverter() {
  const { t } = useTranslation();
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  // 只记录正在编辑的单位与原始输入，其余输入框为派生值，避免回写导致光标跳动
  const [activeUnit, setActiveUnit] = useState(null);
  const [rawInput, setRawInput] = useState('');

  const parsed = useMemo(() => {
    if (activeUnit == null) return { bits: null };
    const p = parseAmount(rawInput);
    if (p.empty) return { bits: null };
    if (p.error) return { bits: null, error: true };
    return { bits: p.value * UNITS.find(u => u.key === activeUnit).factor };
  }, [activeUnit, rawInput]);

  const valueFor = (unit) => (parsed.bits == null ? '' : formatNumber(parsed.bits / unit.factor));
  const clearAll = () => { setActiveUnit(null); setRawInput(''); };

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('data-size.pageHeading')}</h1>
        <p className="text-fg-secondary mb-4">{t('data-size.pageSubheading')}</p>

        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <Button
            size="small"
            variant="text"
            onClick={clearAll}
            disabled={!rawInput}
            startIcon={<X size={16} />}
          >
            {t('Clear')}
          </Button>
          <span className="text-xs text-fg-tertiary">{t('data-size.binaryNote')}</span>
        </div>

        <div className="flex max-w-3xl flex-col gap-3">
          {UNITS.map((unit) => {
            const isActive = activeUnit === unit.key;
            const display = isActive ? rawInput : valueFor(unit);
            return (
              <div key={unit.key} className="flex items-center gap-3">
                <div className="flex flex-1 items-stretch overflow-hidden rounded-lg border border-line bg-paper transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <input
                    value={display}
                    onChange={e => { setActiveUnit(unit.key); setRawInput(e.target.value); }}
                    inputMode="decimal"
                    placeholder="0"
                    aria-label={t(`data-size.unit${unit.cap}`)}
                    className="w-full min-w-0 bg-transparent px-3 py-2 font-mono text-sm text-fg outline-none placeholder:text-fg-tertiary"
                  />
                  <span className="flex w-16 shrink-0 items-center justify-center border-l border-line bg-muted px-2 text-xs font-medium text-fg-secondary">
                    {t(`data-size.unit${unit.cap}`)}
                  </span>
                </div>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => display && copyToClipboard(display)}
                  disabled={!display}
                  startIcon={<Copy size={15} />}
                >
                  {t('Copy')}
                </Button>
              </div>
            );
          })}
        </div>

        {parsed.error && <p className="mt-2 text-xs text-danger">{t('data-size.invalidNumber')}</p>}
      </div>

      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </>
  );
}
