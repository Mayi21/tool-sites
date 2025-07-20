# 数据库设置指南

## 📊 访问记录数据库设计

本项目使用 Cloudflare D1 数据库来存储用户访问记录和分析数据。

## 🗄️ 数据库表结构

### 1. 访问记录主表 (visit_records)
存储所有页面访问和工具使用的详细记录。

**主要字段：**
- `id`: 唯一标识符
- `session_id`: 会话ID
- `page_path`: 页面路径
- `page_name`: 页面名称
- `ip`: 访问者IP地址
- `user_agent`: 用户代理
- `country`, `region`, `city`: 地理位置信息
- `browser`, `os`: 设备和浏览器信息
- `tool`, `tool_action`: 工具使用信息
- `timestamp`: 访问时间
- `duration`: 停留时长
- `status`: 访问状态

### 2. 会话记录表 (session_records)
记录用户会话信息。

**主要字段：**
- `id`: 会话ID
- `start_time`, `end_time`: 会话开始和结束时间
- `duration`: 会话时长
- `page_views`: 页面浏览量
- `tool_usage`: 工具使用次数

### 3. 工具使用记录表 (tool_usage_records)
记录具体的工具使用情况。

**主要字段：**
- `id`: 记录ID
- `session_id`: 会话ID
- `tool`: 工具名称
- `action`: 操作类型
- `input_data`, `output_data`: 输入输出数据
- `processing_time`: 处理时间
- `success`: 是否成功

### 4. 管理员操作日志表 (admin_logs)
记录管理员操作。

**主要字段：**
- `id`: 日志ID
- `admin_username`: 管理员用户名
- `action`: 操作类型
- `details`: 操作详情
- `ip`, `user_agent`: 客户端信息

### 5. 访问统计缓存表 (visit_stats_cache)
缓存统计数据以提高查询性能。

## 🚀 设置步骤

### 1. 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create toolbox-analytics

# 应用数据库架构
wrangler d1 execute toolbox-analytics --file=./database/schema.sql
```

### 2. 配置 wrangler.toml

在 `wrangler.jsonc` 中添加数据库绑定：

```json
{
  "name": "throbbing-forest-04a1",
  "main": "src/index.ts",
  "compatibility_date": "2025-07-19",
  "observability": {
    "enabled": true
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "toolbox-analytics",
      "database_id": "your-database-id"
    }
  ]
}
```

### 3. 本地开发

```bash
# 启动本地开发服务器
wrangler dev

# 在另一个终端中应用本地数据库架构
wrangler d1 execute toolbox-analytics --local --file=./database/schema.sql
```

## 📈 数据收集流程

### 1. 页面访问记录
```javascript
// 前端发送访问记录
fetch('/api/analytics/visit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pagePath: '/tools/base64',
    pageName: 'Base64工具',
    tool: 'Base64工具',
    toolAction: 'view'
  })
});
```

### 2. 工具使用记录
```javascript
// 记录工具使用
fetch('/api/analytics/tool-usage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'Base64工具',
    action: 'encode',
    inputData: 'hello',
    outputData: 'aGVsbG8=',
    processingTime: 150
  })
});
```

### 3. 获取统计数据
```javascript
// 获取访问统计
fetch('/api/analytics/stats?startDate=2024-01-01&endDate=2024-01-31')
  .then(response => response.json())
  .then(data => console.log(data));
```

## 🔍 查询示例

### 1. 获取今日访问量
```sql
SELECT COUNT(*) as today_visits
FROM visit_records 
WHERE DATE(timestamp) = DATE('now') 
  AND status = 'completed';
```

### 2. 获取热门工具
```sql
SELECT tool, COUNT(*) as usage_count
FROM tool_usage_records
WHERE timestamp >= datetime('now', '-30 days')
GROUP BY tool
ORDER BY usage_count DESC
LIMIT 10;
```

### 3. 获取国家访问统计
```sql
SELECT country, COUNT(*) as visit_count
FROM visit_records
WHERE country IS NOT NULL
GROUP BY country
ORDER BY visit_count DESC;
```

## 🛠️ 维护操作

### 1. 数据清理
```bash
# 清理30天前的数据
wrangler d1 execute toolbox-analytics --command="
  DELETE FROM visit_records WHERE timestamp < datetime('now', '-30 days');
  DELETE FROM tool_usage_records WHERE timestamp < datetime('now', '-30 days');
  DELETE FROM admin_logs WHERE timestamp < datetime('now', '-30 days');
"
```

### 2. 备份数据
```bash
# 导出数据
wrangler d1 execute toolbox-analytics --command="
  .backup /path/to/backup.sql
"
```

### 3. 性能优化
```sql
-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_visit_records_timestamp ON visit_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_visit_records_ip ON visit_records(ip);
CREATE INDEX IF NOT EXISTS idx_visit_records_country ON visit_records(country);
```

## 📊 监控和告警

### 1. 数据量监控
```sql
-- 检查表大小
SELECT 
  name,
  COUNT(*) as row_count,
  SUM(length(data)) as data_size
FROM sqlite_master 
WHERE type='table';
```

### 2. 性能监控
```sql
-- 检查慢查询
SELECT 
  timestamp,
  duration,
  page_path,
  ip
FROM visit_records
WHERE duration > 300  -- 超过5秒的访问
ORDER BY duration DESC;
```

## 🔒 安全考虑

1. **数据隐私**: 不存储个人敏感信息
2. **访问控制**: 管理员操作需要认证
3. **数据加密**: 使用HTTPS传输
4. **定期清理**: 自动清理过期数据

## 🚀 部署

```bash
# 部署到生产环境
wrangler deploy

# 验证部署
curl https://your-worker.your-subdomain.workers.dev/api/analytics/stats
```

这个数据库设计为工具箱提供了完整的访问记录和分析功能！📈 