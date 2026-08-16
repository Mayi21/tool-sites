import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * 复制成功提示：底部居中的轻量 pill，淡入淡出，不遮挡内容
 */
export default function CopySuccessAnimation({ visible, onAnimationEnd }) {
  const { t } = useTranslation();
  const [state, setState] = useState('hidden'); // hidden | showing | hiding

  useEffect(() => {
    if (visible) {
      setState('showing');
      const hideTimer = setTimeout(() => setState('hiding'), 1000);
      const endTimer = setTimeout(() => {
        setState('hidden');
        onAnimationEnd && onAnimationEnd();
      }, 1200);
      return () => {
        clearTimeout(hideTimer);
        clearTimeout(endTimer);
      };
    }
    setState('hidden');
  }, [visible, onAnimationEnd]);

  if (state === 'hidden') return null;

  return (
    <div
      className={`pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transition-all duration-200 ${
        state === 'showing' ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <div className="flex items-center gap-1.5 rounded-full bg-fg/90 px-4 py-2 text-sm text-bg shadow-lg">
        <Check size={15} className="text-success" />
        {t('Copied to clipboard')}
      </div>
    </div>
  );
}
