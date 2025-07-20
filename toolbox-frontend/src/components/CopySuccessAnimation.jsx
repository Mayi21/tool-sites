import { useState, useEffect } from 'react';
import { CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export default function CopySuccessAnimation({ visible, onAnimationEnd }) {
  const { t } = useTranslation();
  const [animationState, setAnimationState] = useState('hidden');

  useEffect(() => {
    if (visible) {
      setAnimationState('showing');
      const timer = setTimeout(() => {
        setAnimationState('hiding');
        setTimeout(() => {
          setAnimationState('hidden');
          onAnimationEnd && onAnimationEnd();
        }, 300);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [visible, onAnimationEnd]);

  if (animationState === 'hidden') return null;

  const containerStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
    pointerEvents: 'none',
  };

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--success-bg, #f6ffed)',
    border: '2px solid var(--success-border, #52c41a)',
    borderRadius: '12px',
    padding: '20px 24px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    minWidth: '120px',
    opacity: animationState === 'showing' ? 1 : 0,
    transform: animationState === 'showing' 
      ? 'translate(-50%, -50%) scale(1)' 
      : 'translate(-50%, -50%) scale(0.8)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const iconContainerStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'var(--success-color, #52c41a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    animation: animationState === 'showing' ? 'copySuccessBounceIn 0.6s ease-out' : 'none',
  };

  const iconStyle = {
    fontSize: '24px',
    color: 'white',
    animation: animationState === 'showing' ? 'copySuccessCheckmark 0.4s ease-out 0.2s both' : 'none',
  };

  const textStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--success-text, #52c41a)',
    textAlign: 'center',
    animation: animationState === 'showing' ? 'copySuccessFadeInUp 0.4s ease-out 0.3s both' : 'none',
  };

  return (
    <>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={iconContainerStyle}>
            <CheckOutlined style={iconStyle} />
          </div>
          <div style={textStyle}>
            {t('Copied to clipboard')}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes copySuccessBounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes copySuccessCheckmark {
          0% {
            transform: scale(0) rotate(-45deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(-45deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes copySuccessFadeInUp {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
} 