import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { getToolDetails } from './ToolDetailDescription';
import tools from '../tools';

// 工具分类映射（从BreadcrumbNav中复用）
const getToolCategory = (path) => {
  const categoryMap = {
    '/base64': 'Development Tools',
    '/json-formatter': 'Development Tools',
    '/regex-tester': 'Development Tools',
    '/url-encoder': 'Development Tools',
    '/timestamp': 'Development Tools',
    '/jwt-decoder': 'Development Tools',
    '/cron-parser': 'Development Tools',
    '/diff': 'Text Processing',
    '/text-analyzer': 'Text Processing',
    '/text-processor': 'Text Processing',
    '/markdown-preview': 'Text Processing',
    '/unicode-converter': 'Text Processing',
    '/csv-converter': 'Data Conversion',
    '/uuid-generator': 'Data Conversion',
    '/hash-generator': 'Security & Encryption',
    '/password-generator': 'Security & Encryption',
    '/color-converter': 'Design Tools',
    '/qr-generator': 'Design Tools',
    '/image-compressor': 'Design Tools',
    '/image-watermark': 'Design Tools'
  };

  return categoryMap[path] || null;
};

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
  robots = 'index,follow',
  toolPath = null
}) {
  const { t } = useTranslation();
  const safeTitle = title || 'Multi-function Toolbox';
  const safeDesc = description || 'Multi-function online toolbox';
  const safeCanonical = canonical || (typeof window !== 'undefined' ? window.location.href : '/') ;
  const safeOgImage = ogImage || '/toolbox-icon.svg';

  // 生成面包屑结构化数据
  const generateBreadcrumbStructuredData = (toolPath) => {
    if (!toolPath || toolPath === '/') return null;

    const category = getToolCategory(toolPath);
    const tool = tools.find(t => t.path === toolPath);

    if (!tool) return null;

    const breadcrumbs = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "首页",
        "item": "https://toolifyhub.top/"
      }
    ];

    if (category) {
      breadcrumbs.push({
        "@type": "ListItem",
        "position": 2,
        "name": category,
        "item": `https://toolifyhub.top/#${category.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`
      });
    }

    // 获取工具名称（优先使用配置中的nameKey）
    const toolName = tool.nameKey || tool.path.replace('/', '');

    breadcrumbs.push({
      "@type": "ListItem",
      "position": category ? 3 : 2,
      "name": toolName,
      "item": `https://toolifyhub.top${toolPath}`
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs
    };
  };

  // 生成FAQ结构化数据
  const generateFAQStructuredData = (toolPath) => {
    if (!toolPath) return null;

    const toolDetails = getToolDetails(toolPath, t);
    if (!toolDetails || !toolDetails.faq || toolDetails.faq.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": toolDetails.faq.map(faqItem => ({
        "@type": "Question",
        "name": faqItem.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faqItem.a
        }
      }))
    };
  };

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

  // 生成FAQ结构化数据
  const faqStructuredData = generateFAQStructuredData(toolPath);

  // 生成面包屑结构化数据
  const breadcrumbStructuredData = generateBreadcrumbStructuredData(toolPath);

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

      {/* Main Structured Data (SoftwareApplication/WebSite) */}
      {finalStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(finalStructuredData)}
        </script>
      )}

      {/* FAQ Structured Data */}
      {faqStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      )}

      {/* Breadcrumb Structured Data */}
      {breadcrumbStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      )}
    </Helmet>
  );
}
