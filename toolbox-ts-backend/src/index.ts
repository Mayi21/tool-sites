import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { TaskCreate } from "./endpoints/taskCreate";
import { TaskDelete } from "./endpoints/taskDelete";
import { TaskFetch } from "./endpoints/taskFetch";
import { TaskList } from "./endpoints/taskList";
import { CronNextTimes } from './endpoints/cronNextTimes';
import { createQuestionnaire } from './endpoints/questionnaire/createQuestionnaire';
import { getQuestionnaire } from './endpoints/questionnaire/getQuestionnaire';
import { submitQuestionnaire } from './endpoints/questionnaire/submitQuestionnaire';
import { getQuestionnaireResults } from './endpoints/questionnaire/getQuestionnaireResults';
import { closeQuestionnaire } from './endpoints/questionnaire/closeQuestionnaire';

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
    // 开发环境未配置时允许本地常用端口
    if (!configured) {
      const devAllowed = ['http://localhost:5173','http://localhost:5174','http://localhost:5175'];
      if (!requestOrigin) return false;
      return devAllowed.includes(requestOrigin) ? requestOrigin : false;
    }
    const allowed = configured.split(',').map(s => s.trim()).filter(Boolean);
    if (!requestOrigin) return false;
    try {
      const originUrl = new URL(requestOrigin);
      const originHost = originUrl.host; // includes hostname:port
      return allowed.some(pattern => {
        // exact match
        if (pattern === requestOrigin) return requestOrigin;
        // allow specifying domain without scheme
        if (!pattern.startsWith('http')) {
          // match host (with optional port)
          if (originHost === pattern || originHost.endsWith(pattern)) return requestOrigin;
        }
        // wildcard like https://*.pages.dev
        if (pattern.includes('*')) {
          const regex = new RegExp('^' + pattern
            .replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
            .replace(/\\\*/g, '.*') + '$');
          return regex.test(requestOrigin) ? requestOrigin : false;
        }
        // scheme+host compare ignoring trailing slashes
        return requestOrigin.replace(/\/$/, '') === pattern.replace(/\/$/, '') ? requestOrigin : false;
      });
    } catch {
      return false;
    }
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
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
export default app;
