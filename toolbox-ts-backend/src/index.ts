import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { TaskCreate } from "./endpoints/taskCreate";
import { TaskDelete } from "./endpoints/taskDelete";
import { TaskFetch } from "./endpoints/taskFetch";
import { TaskList } from "./endpoints/taskList";
import { CronNextTimes } from './endpoints/cronNextTimes';

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// 配置CORS中间件：从环境变量 FRONTEND_DOMAIN 读取允许的来源
// 支持：
// - 单个完整来源（如 https://example.com）
// - 逗号分隔多个来源
// - 通配符域名（如 https://*.pages.dev）
app.use('*', cors({
  origin: (requestOrigin, c) => {
    const configured = c.env.FRONTEND_DOMAIN?.trim();

    console.log('[CORS] Request Origin:', requestOrigin);
    console.log('[CORS] Configured FRONTEND_DOMAIN:', configured);

    // 开发环境未配置时允许本地常用端口
    if (!configured) {
      console.log('[CORS] No FRONTEND_DOMAIN set, using dev whitelist.');
      const devAllowed = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175'
      ];
      if (!requestOrigin) {
        console.log('[CORS] No request origin, denying.');
        return false;
      }
      const allowed = devAllowed.includes(requestOrigin);
      console.log('[CORS] Dev whitelist match:', allowed);
      return allowed ? requestOrigin : false;
    }

    console.log('[CORS] FRONTEND_DOMAIN configured, checking match...');
    const allowed = configured.split(',').map(s => s.trim()).filter(Boolean);
    if (!requestOrigin) {
      console.log('[CORS] No request origin, denying.');
      return false;
    }

    try {
      const originUrl = new URL(requestOrigin);
      const originHost = originUrl.host;
      const isAllowed = allowed.some(pattern => {
        if (pattern === requestOrigin) return requestOrigin;
        if (!pattern.startsWith('http')) {
          if (originHost === pattern || originHost.endsWith(pattern)) return requestOrigin;
        }
        if (pattern.includes('*')) {
          const regex = new RegExp('^' + pattern
            .replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
            .replace(/\*/g, '.*') + '$');
          return regex.test(requestOrigin) ? requestOrigin : false;
        }
        return requestOrigin.replace(/\/$/, '') === pattern.replace(/\/$/, '') ? requestOrigin : false; // Corrected line
      });
      console.log('[CORS] Allowed match:', isAllowed);
      // When credentials: true, we must return the specific origin string, not true/'*'
      return isAllowed ? requestOrigin : false;
    } catch (err) {
      console.error('[CORS] Error parsing origin:', err);
      return false;
    }
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Reflect or allow any requested headers to avoid preflight failures
  allowHeaders: ['*'],
  credentials: true
}));


// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register OpenAPI endpoints
openapi.get("/api/tasks", TaskList);
openapi.post("/api/tasks", TaskCreate);
openapi.get("/api/tasks/:taskSlug", TaskFetch);
openapi.delete("/api/tasks/:taskSlug", TaskDelete);

// 已移除 Analytics 端点
openapi.post('/api/cron/next-times', CronNextTimes);

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app

app.get('/robots.txt', (c) => {
  const baseUrl = c.env.FRONTEND_DOMAIN || 'https://toolifyhub.top';
  return c.text(`User-agent: *
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Block common bot paths (if you have these)
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /node_modules/

# Allow important crawling
Allow: /base64
Allow: /json-formatter
Allow: /regex-tester
Allow: /url-encoder
Allow: /timestamp
Allow: /hash-generator
Allow: /qr-generator

# Crawl-delay for aggressive bots
User-agent: SemrushBot
Crawl-delay: 10

User-agent: AhrefsBot
Crawl-delay: 10`);
});

app.get('/sitemap.xml', (c) => {
  const baseUrl = c.env.FRONTEND_DOMAIN || 'https://toolifyhub.top';
  const today = new Date().toISOString().split('T')[0];
  
  // 工具按重要程度分类（优先级不同）
  const highPriorityTools = [
    "/base64",
    "/json-formatter", 
    "/regex-tester",
    "/url-encoder",
    "/timestamp"
  ];
  
  const mediumPriorityTools = [
    "/hash-generator",
    "/jwt-decoder",
    "/color-converter",
    "/qr-generator",
    "/diff"
  ];
  
  const normalPriorityTools = [
    "/text-analyzer",
    "/text-processor", 
    "/markdown-preview",
    "/csv-converter",
    "/image-compressor",
    "/unicode-converter",
    "/cron-parser",
    "/image-watermark",
    "/uuid-generator",
    "/password-generator"
  ];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // 添加首页
  sitemap += `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

  // 添加高优先级工具
  highPriorityTools.forEach(path => {
    sitemap += `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
  });

  // 添加中等优先级工具
  mediumPriorityTools.forEach(path => {
    sitemap += `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  // 添加普通优先级工具
  normalPriorityTools.forEach(path => {
    sitemap += `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;

  return c.text(sitemap.trim(), 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=86400' // 缓存1天
  });
});

export default app;