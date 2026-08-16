import { useEffect, useRef } from 'react';

/**
 * 防抖版 useEffect：deps 变化后延迟 delay 毫秒执行 fn，期间再变化则重新计时。
 * fn 可返回清理函数（语义同 useEffect）。
 */
export default function useDebouncedEffect(fn, deps, delay = 250) {
  const cleanupRef = useRef();
  useEffect(() => {
    const timer = setTimeout(() => {
      cleanupRef.current = fn();
    }, delay);
    return () => {
      clearTimeout(timer);
      if (typeof cleanupRef.current === 'function') {
        cleanupRef.current();
        cleanupRef.current = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}
