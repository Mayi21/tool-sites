import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, RefreshCw } from 'lucide-react';
import { Button, Input } from '../../ui';
import useCopyWithAnimation from '../../../hooks/useCopyWithAnimation';
import CopySuccessAnimation from '../../CopySuccessAnimation';

const makeUuids = (count) => Array.from({ length: count }, () => crypto.randomUUID());

/**
 * UUID 小组件：S 一条；M 最近 3 条；L 数量输入 + 最多 10 条列表
 */
export default function UUIDWidget({ size }) {
  const { t } = useTranslation();
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const [uuids, setUuids] = useState(() => makeUuids(3));
  const [count, setCount] = useState(5);

  const shown = size === 's' ? uuids.slice(0, 1) : size === 'm' ? uuids.slice(0, 3) : uuids.slice(0, 10);

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 font-mono text-xs text-fg" title={shown[0]}>
          {shown[0]}
        </span>
        <button
          type="button"
          onClick={() => setUuids(makeUuids(size === 'l' ? count : size === 'm' ? 3 : 1))}
          title={t('Regenerate')}
          className="shrink-0 cursor-pointer rounded-md p-1.5 text-fg-tertiary transition-colors hover:bg-muted hover:text-fg"
        >
          <RefreshCw size={14} />
        </button>
        <button
          type="button"
          onClick={() => copyToClipboard(shown[0])}
          title={t('Copy')}
          className="shrink-0 cursor-pointer rounded-md p-1.5 text-fg-tertiary transition-colors hover:bg-muted hover:text-fg"
        >
          <Copy size={14} />
        </button>
      </div>

      {size !== 's' && (
        <ul className="m-0 flex-1 list-none overflow-y-auto p-0">
          {shown.slice(1).map(uuid => (
            <li key={uuid}>
              <button
                type="button"
                onClick={() => copyToClipboard(uuid)}
                title={t('Click to copy')}
                className="block w-full cursor-pointer truncate rounded-md px-1 py-1 text-left font-mono text-xs text-fg-secondary transition-colors hover:bg-muted hover:text-fg"
              >
                {uuid}
              </button>
            </li>
          ))}
        </ul>
      )}

      {size === 'l' && (
        <div className="flex items-center gap-2">
          <div className="w-20">
            <Input
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={e => setCount(Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1)))}
              className="h-8 px-2 py-1 text-xs"
            />
          </div>
          <Button size="small" variant="text" onClick={() => setUuids(makeUuids(count))} startIcon={<RefreshCw size={14} />}>
            {t('Generate')}
          </Button>
        </div>
      )}

      <CopySuccessAnimation visible={showAnimation} onAnimationEnd={handleAnimationEnd} />
    </div>
  );
}
