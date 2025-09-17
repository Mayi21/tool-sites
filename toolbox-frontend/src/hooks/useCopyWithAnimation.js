import { useState, useRef, useCallback } from 'react';

export default function useCopyWithAnimation() {
  const [showAnimation, setShowAnimation] = useState(false);
  const timeoutRef = useRef(null);

  const copyToClipboard = useCallback(async (text) => {
    if (!text) return false;

    try {
      await navigator.clipboard.writeText(text);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setShowAnimation(true);

      // Set a fallback timeout to ensure animation disappears
      timeoutRef.current = setTimeout(() => {
        setShowAnimation(false);
      }, 2000);

      return true;
    } catch (error) {
      console.error('Failed to copy text: ', error);
      return false;
    }
  }, []);

  const handleAnimationEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowAnimation(false);
  }, []);

  return {
    showAnimation,
    copyToClipboard,
    handleAnimationEnd
  };
} 