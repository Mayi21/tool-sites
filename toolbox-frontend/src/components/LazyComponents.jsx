import { useState, useEffect, useRef, Suspense } from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * 高级懒加载组件 - 使用Intersection Observer
 * 支持组件、图片、内容的延迟加载
 */
export function LazyComponent({
  children,
  component: Component,
  fallback,
  height = 200,
  threshold = 0.1,
  rootMargin = '50px',
  skeleton = true
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin]);

  // 默认骨架屏组件
  const defaultFallback = skeleton ? (
    <Skeleton
      variant="rectangular"
      height={height}
      animation="wave"
      sx={{ borderRadius: 1 }}
    />
  ) : (
    <Box
      sx={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'grey.100',
        borderRadius: 1,
        fontSize: '0.875rem',
        color: 'text.secondary'
      }}
    >
      Loading...
    </Box>
  );

  return (
    <Box ref={ref} sx={{ minHeight: height }}>
      {isVisible ? (
        <Suspense fallback={fallback || defaultFallback}>
          {Component ? <Component onLoad={() => setIsLoaded(true)} /> : children}
        </Suspense>
      ) : (
        fallback || defaultFallback
      )}
    </Box>
  );
}

/**
 * 懒加载图片组件
 */
export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  style,
  onLoad,
  onError,
  placeholder = true,
  threshold = 0.1,
  rootMargin = '50px'
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin]);

  const handleLoad = (event) => {
    setIsLoaded(true);
    if (onLoad) onLoad(event);
  };

  const handleError = (event) => {
    setError(true);
    if (onError) onError(event);
  };

  const placeholderComponent = placeholder ? (
    <Skeleton
      variant="rectangular"
      width={width}
      height={height}
      animation="wave"
      sx={{ borderRadius: 1 }}
    />
  ) : (
    <Box
      sx={{
        width,
        height,
        backgroundColor: 'grey.200',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 1,
        color: 'text.disabled',
        fontSize: '0.75rem'
      }}
    >
      {error ? 'Failed to load' : 'Loading...'}
    </Box>
  );

  return (
    <Box
      ref={ref}
      sx={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {isVisible ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          style={{
            ...style,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      ) : (
        placeholderComponent
      )}

      {isVisible && !isLoaded && !error && placeholderComponent}
    </Box>
  );
}

/**
 * 懒加载内容区域
 */
export function LazySection({
  children,
  height = 300,
  threshold = 0.1,
  rootMargin = '100px',
  fallback,
  skeleton = true
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin]);

  const defaultFallback = skeleton ? (
    <Box sx={{ width: '100%' }}>
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={height - 80} animation="wave" />
      <Skeleton variant="text" width="40%" height={30} sx={{ mt: 2 }} />
    </Box>
  ) : (
    <Box
      sx={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'grey.50',
        borderRadius: 1,
        border: '1px dashed',
        borderColor: 'grey.300',
        color: 'text.secondary'
      }}
    >
      Content loading...
    </Box>
  );

  return (
    <Box ref={ref} sx={{ minHeight: height }}>
      {isVisible ? children : (fallback || defaultFallback)}
    </Box>
  );
}

/**
 * 懒加载工具卡片优化器
 */
export function LazyToolCard({ children, index = 0 }) {
  // 为不同位置的工具卡片设置不同的延迟
  const delay = Math.min(index * 50, 500); // 最多延迟500ms

  return (
    <LazyComponent
      height={280}
      threshold={0.1}
      rootMargin={`${50 + delay}px`} // 动态调整预加载距离
      skeleton={true}
    >
      {children}
    </LazyComponent>
  );
}

export default LazyComponent;