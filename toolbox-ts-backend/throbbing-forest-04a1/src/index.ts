import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { TaskCreate } from "./endpoints/taskCreate";
import { TaskDelete } from "./endpoints/taskDelete";
import { TaskFetch } from "./endpoints/taskFetch";
import { TaskList } from "./endpoints/taskList";
import { AnalyticsRecordVisit } from "./endpoints/analyticsRecordVisit";
import { AnalyticsGetStats } from "./endpoints/analyticsGetStats";
import { AnalyticsToolUsage } from "./endpoints/analyticsToolUsage";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// 配置CORS中间件
app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'https://tool-sites.pages.dev',
    'https://*.pages.dev'
  ],
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

// Analytics endpoints
openapi.post("/api/analytics/visit", AnalyticsRecordVisit);
openapi.get("/api/analytics/stats", AnalyticsGetStats);
openapi.post("/api/analytics/tool-usage", AnalyticsToolUsage);

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
