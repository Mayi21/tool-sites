import { useEffect, useState } from 'react';

export default function ThemeTransition({ children, theme }) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [theme]);

  return (
    <div 
      className={`theme-transition ${isTransitioning ? 'transitioning' : ''}`}
      style={{
        opacity: isTransitioning ? 0.8 : 1,
        transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.3s ease'
      }}
    >
      {children}
    </div>
  );
} 