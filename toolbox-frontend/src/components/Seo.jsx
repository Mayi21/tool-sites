import React from 'react';
import { Helmet } from 'react-helmet-async';

// props: title, description, canonical, ogImage, lang, structuredData, keywords
export default function Seo({ 
  title, 
  description, 
  canonical, 
  ogImage, 
  lang = 'zh-CN', 
  structuredData,
  keywords,
  author = 'ToolifyHub',
  robots = 'index,follow'
}) {
  const safeTitle = title || 'Multi-function Toolbox';
  const safeDesc = description || 'Multi-function online toolbox';
  const safeCanonical = canonical || (typeof window !== 'undefined' ? window.location.href : '/') ;
  const safeOgImage = ogImage || '/toolbox-icon.svg';

  // 生成工具页面的结构化数据
  const generateToolStructuredData = (toolName, toolDescription) => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": toolName,
    "description": toolDescription,
    "url": safeCanonical,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "ToolifyHub",
      "url": "https://toolifyhub.top"
    },
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "inLanguage": lang,
    "isAccessibleForFree": true,
    "browserRequirements": "Requires JavaScript. Requires HTML5."
  });

  // 主页的结构化数据
  const generateWebsiteStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ToolifyHub - Multi-function Online Toolbox",
    "description": safeDesc,
    "url": "https://toolifyhub.top",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://toolifyhub.top/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ToolifyHub",
      "url": "https://toolifyhub.top"
    }
  });

  // 自动生成结构化数据
  const finalStructuredData = structuredData || 
    (safeCanonical === 'https://toolifyhub.top/' ? 
      generateWebsiteStructuredData() : 
      generateToolStructuredData(safeTitle, safeDesc)
    );

  return (
    <Helmet>
      <html lang={lang} />
      <title>{safeTitle}</title>
      <meta name="description" content={safeDesc} />
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={safeCanonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={safeDesc} />
      <meta property="og:url" content={safeCanonical} />
      <meta property="og:image" content={safeOgImage} />
      <meta property="og:site_name" content="ToolifyHub" />
      <meta property="og:locale" content={lang === 'zh-CN' ? 'zh_CN' : 'en_US'} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={safeTitle} />
      <meta name="twitter:description" content={safeDesc} />
      <meta name="twitter:image" content={safeOgImage} />
      <meta name="twitter:site" content="@toolifyhub" />

      {/* Hreflang for internationalization - Simplified version */}
      <link rel="alternate" hreflang="zh-CN" href={safeCanonical} />
      <link rel="alternate" hreflang="en" href={safeCanonical} />
      <link rel="alternate" hreflang="x-default" href={safeCanonical} />

      {/* Additional SEO tags */}
      <meta name="theme-color" content="#1677ff" />
      <meta name="msapplication-TileColor" content="#1677ff" />
      
      {/* Structured Data */}
      {finalStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(finalStructuredData)}
        </script>
      )}
    </Helmet>
  );
}
