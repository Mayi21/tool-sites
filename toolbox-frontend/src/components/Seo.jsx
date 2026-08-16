import { useEffect } from 'react';
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
    '/image-compressor': 'Design Tools',
    '/image-watermark': 'Design Tools'
  };

  return categoryMap[path] || null;
};

/* ---------- 原生 head 标签管理（替代 react-helmet-async） ---------- */

function setMeta(attr, key, content) {
  if (content == null) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel, href, hreflang) {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"][data-seo]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    else el.setAttribute('data-seo', '');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

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
  const safeTitle = title || 'Multi-function Toolbox';
  const safeDesc = description || 'Multi-function online toolbox';
  const safeCanonical = canonical || (typeof window !== 'undefined' ? window.location.href : '/');
  const safeOgImage = ogImage || '/toolbox-icon.svg';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = safeTitle;
    setMeta('name', 'description', safeDesc);
    setMeta('name', 'author', author);
    setMeta('name', 'robots', robots);
    if (keywords) setMeta('name', 'keywords', keywords);
    setLink('canonical', safeCanonical);

    // Open Graph
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:title', safeTitle);
    setMeta('property', 'og:description', safeDesc);
    setMeta('property', 'og:url', safeCanonical);
    setMeta('property', 'og:image', safeOgImage);
    setMeta('property', 'og:site_name', 'ToolifyHub');
    setMeta('property', 'og:locale', lang === 'zh-CN' ? 'zh_CN' : 'en_US');

    // Twitter
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', safeTitle);
    setMeta('name', 'twitter:description', safeDesc);
    setMeta('name', 'twitter:image', safeOgImage);
    setMeta('name', 'twitter:site', '@toolifyhub');

    // Hreflang
    setLink('alternate', safeCanonical, 'zh-CN');
    setLink('alternate', safeCanonical, 'en');
    setLink('alternate', safeCanonical, 'x-default');
  }, [safeTitle, safeDesc, safeCanonical, safeOgImage, lang, keywords, author, robots]);

  // 主结构化数据（SoftwareApplication）
  useEffect(() => {
    const data = structuredData || {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": safeTitle,
      "description": safeDesc,
      "url": safeCanonical,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web Browser",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "creator": { "@type": "Organization", "name": "ToolifyHub", "url": "https://toolifyhub.top" },
      "inLanguage": lang,
      "isAccessibleForFree": true,
      "browserRequirements": "Requires JavaScript. Requires HTML5."
    };
    setJsonLd('seo-jsonld-main', data);
  }, [structuredData, safeTitle, safeDesc, safeCanonical, lang]);

  // 面包屑结构化数据
  useEffect(() => {
    let data = null;
    if (toolPath && toolPath !== '/') {
      const category = getToolCategory(toolPath);
      const tool = tools.find(item => item.path === toolPath);
      if (tool) {
        const breadcrumbs = [
          { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://toolifyhub.top/" }
        ];
        if (category) {
          breadcrumbs.push({
            "@type": "ListItem",
            "position": 2,
            "name": category,
            "item": `https://toolifyhub.top/#${category.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`
          });
        }
        breadcrumbs.push({
          "@type": "ListItem",
          "position": category ? 3 : 2,
          "name": tool.nameKey || tool.path.replace('/', ''),
          "item": `https://toolifyhub.top${toolPath}`
        });
        data = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": breadcrumbs };
      }
    }
    setJsonLd('seo-jsonld-breadcrumb', data);
  }, [toolPath]);

  return null;
}
