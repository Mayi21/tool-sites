import React, { useState, useRef, useEffect } from 'react';

export default function OptimizedImage({ 
  src, 
  alt, 
  className, 
  style,
  width,
  height,
  loading = 'lazy'
}) {
  const [imageSrc, setImageSrc] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    // 检测WebP支持
    const checkWebPSupport = () => {
      return new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = function () {
          resolve(webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      });
    };

    checkWebPSupport().then((supportsWebP) => {
      if (supportsWebP && src.includes('.')) {
        // 如果支持WebP，尝试WebP版本
        const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        setImageSrc(webpSrc);
      } else {
        setImageSrc(src);
      }
    });
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    // WebP加载失败，回退到原格式
    if (imageSrc.includes('.webp')) {
      setImageSrc(src);
    }
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
      width={width}
      height={height}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}