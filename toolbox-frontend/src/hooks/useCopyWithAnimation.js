import { useState } from 'react';

export default function useCopyWithAnimation() {
  const [showAnimation, setShowAnimation] = useState(false);

  const copyToClipboard = async (text) => {
    if (!text) return false;

    try {
      await navigator.clipboard.writeText(text);
      setShowAnimation(true);
      return true;
    } catch (error) {
      console.error('Failed to copy text: ', error);
      return false;
    }
  };

  const handleAnimationEnd = () => {
    setShowAnimation(false);
  };

  return {
    showAnimation,
    copyToClipboard,
    handleAnimationEnd
  };
} 