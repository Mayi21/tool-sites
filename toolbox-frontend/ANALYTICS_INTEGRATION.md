# 前端分析集成指南

## 📊 概述

前端项目已集成后端API来存储访问记录和分析数据。系统支持页面访问追踪、工具使用记录和统计数据获取。

## 🚀 快速开始

### 1. 环境配置

在项目根目录创建 `.env` 文件：

```bash
# API配置
VITE_API_BASE_URL=http://localhost:8787

# 开发环境配置
VITE_DEV_MODE=true

# 分析配置
VITE_ENABLE_ANALYTICS=true
```

### 2. 基本使用

```javascript
import analytics from './src/utils/analytics.js';

// 记录页面访问
analytics.trackPageView('/tools/base64', 'Base64工具');

// 记录工具使用
analytics.trackToolUsage('Base64工具', 'encode', {
  inputData: 'hello',
  outputData: 'aGVsbG8=',
  processingTime: 150
});

// 获取统计数据
const stats = await analytics.getStats();
console.log('访问统计:', stats);
```

## 📈 API 功能

### 页面访问追踪

```javascript
// 记录页面访问
analytics.trackPageView(pagePath, pageName, options);

// 参数说明
// - pagePath: 页面路径 (必需)
// - pageName: 页面名称 (必需)
// - options: 可选参数
//   - tool: 工具名称
//   - toolAction: 工具操作
//   - referrer: 来源页面
//   - utmSource: UTM来源
//   - utmMedium: UTM媒介
//   - utmCampaign: UTM活动
//   - metadata: 元数据

// 示例
analytics.trackPageView('/tools/base64', 'Base64工具', {
  tool: 'Base64工具',
  toolAction: 'view',
  referrer: document.referrer
});
```

### 工具使用记录

```javascript
// 记录工具使用
analytics.trackToolUsage(toolName, action, options);

// 参数说明
// - toolName: 工具名称 (必需)
// - action: 操作类型 (默认: 'view')
// - options: 可选参数
//   - inputData: 输入数据
//   - outputData: 输出数据
//   - processingTime: 处理时间(ms)
//   - success: 是否成功 (默认: true)
//   - errorMessage: 错误信息

// 示例
analytics.trackToolUsage('Base64工具', 'encode', {
  inputData: 'hello world',
  outputData: 'aGVsbG8gd29ybGQ=',
  processingTime: 120,
  success: true
});

// 记录错误
analytics.trackToolUsage('Base64工具', 'encode', {
  inputData: 'invalid data',
  success: false,
  errorMessage: 'Invalid input format'
});
```

### 统计数据获取

```javascript
// 获取访问统计
const stats = await analytics.getStats();

// 返回数据结构
{
  totalVisits: 1500,           // 总访问量
  todayVisits: 45,             // 今日访问量
  weekVisits: 320,             // 本周访问量
  monthVisits: 1200,           // 本月访问量
  uniqueVisitors: 800,         // 独立访客数
  uniqueIPs: 750,              // 独立IP数
  countries: 25,               // 覆盖国家数
  averageSessionDuration: 180, // 平均会话时长(秒)
  bounceRate: 0.35,            // 跳出率
  topTools: [                  // 热门工具
    { tool: 'Base64工具', count: 450 },
    { tool: '文本对比', count: 320 }
  ],
  topCountries: [              // 热门国家
    { country: '中国', count: 800 },
    { country: '美国', count: 300 }
  ],
  topBrowsers: [               // 热门浏览器
    { browser: 'Chrome', count: 900 },
    { browser: 'Safari', count: 300 }
  ]
}
```

## 🔧 在组件中使用

### React 组件示例

```jsx
import React, { useEffect, useState } from 'react';
import analytics from '../utils/analytics.js';

function Base64Tool() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // 记录页面访问
    analytics.trackPageView('/tools/base64', 'Base64工具', {
      tool: 'Base64工具',
      toolAction: 'view'
    });

    // 获取统计数据
    const loadStats = async () => {
      const data = await analytics.getStats();
      setStats(data);
    };
    loadStats();
  }, []);

  const handleEncode = async (input) => {
    const startTime = Date.now();
    
    try {
      const output = btoa(input);
      
      // 记录工具使用
      await analytics.trackToolUsage('Base64工具', 'encode', {
        inputData: input,
        outputData: output,
        processingTime: Date.now() - startTime,
        success: true
      });

      return output;
    } catch (error) {
      // 记录错误
      await analytics.trackToolUsage('Base64工具', 'encode', {
        inputData: input,
        processingTime: Date.now() - startTime,
        success: false,
        errorMessage: error.message
      });
      
      throw error;
    }
  };

  return (
    <div>
      <h1>Base64工具</h1>
      {/* 工具界面 */}
      {stats && (
        <div>
          <p>今日访问: {stats.todayVisits}</p>
          <p>总访问: {stats.totalVisits}</p>
        </div>
      )}
    </div>
  );
}
```

### Vue 组件示例

```vue
<template>
  <div>
    <h1>Base64工具</h1>
    <div v-if="stats">
      <p>今日访问: {{ stats.todayVisits }}</p>
      <p>总访问: {{ stats.totalVisits }}</p>
    </div>
  </div>
</template>

<script>
import analytics from '../utils/analytics.js';

export default {
  name: 'Base64Tool',
  data() {
    return {
      stats: null
    };
  },
  async mounted() {
    // 记录页面访问
    analytics.trackPageView('/tools/base64', 'Base64工具', {
      tool: 'Base64工具',
      toolAction: 'view'
    });

    // 获取统计数据
    this.stats = await analytics.getStats();
  },
  methods: {
    async handleEncode(input) {
      const startTime = Date.now();
      
      try {
        const output = btoa(input);
        
        // 记录工具使用
        await analytics.trackToolUsage('Base64工具', 'encode', {
          inputData: input,
          outputData: output,
          processingTime: Date.now() - startTime,
          success: true
        });

        return output;
      } catch (error) {
        // 记录错误
        await analytics.trackToolUsage('Base64工具', 'encode', {
          inputData: input,
          processingTime: Date.now() - startTime,
          success: false,
          errorMessage: error.message
        });
        
        throw error;
      }
    }
  }
};
</script>
```

## 🔄 自动追踪

### 页面访问自动追踪

系统会自动追踪页面访问，包括：

- 页面加载时记录访问开始
- 页面卸载时记录访问结束和停留时长
- 自动获取客户端信息（IP、浏览器、设备类型等）

### 工具使用自动追踪

在工具组件中集成：

```javascript
// 在工具初始化时
analytics.trackToolUsage('工具名称', 'view');

// 在用户操作时
analytics.trackToolUsage('工具名称', 'use', {
  inputData: '用户输入',
  outputData: '处理结果',
  processingTime: 处理时间
});
```

## 📊 数据存储

### 本地存储

- 访问记录存储在 `localStorage` 的 `toolbox_visits` 键中
- 支持离线使用和数据同步
- 自动清理过期数据（默认30天）

### 后端存储

- 数据发送到后端API进行持久化存储
- 支持实时统计和分析
- 数据备份和恢复

## 🛠️ 配置选项

### API 配置

```javascript
// src/config/api.js
const API_CONFIG = {
  BASE_URL: 'http://localhost:8787',
  REQUEST_CONFIG: {
    timeout: 10000, // 10秒超时
  },
  RETRY_CONFIG: {
    maxRetries: 3,    // 最大重试次数
    retryDelay: 1000, // 重试延迟
  }
};
```

### 分析配置

```javascript
// 在组件中配置
analytics.trackPageView('/page', '页面名称', {
  // 自定义元数据
  metadata: {
    category: 'tools',
    difficulty: 'easy',
    tags: ['encoding', 'text']
  }
});
```

## 🔍 调试和监控

### 控制台日志

```javascript
// 启用详细日志
console.log('Analytics debug mode enabled');

// 查看访问记录
console.log('Current visits:', analytics.visits);

// 查看统计数据
const stats = await analytics.getStats();
console.log('Analytics stats:', stats);
```

### 网络监控

- 使用浏览器开发者工具监控API请求
- 检查请求状态和响应数据
- 监控错误和重试情况

## 🚀 部署注意事项

### 生产环境配置

```bash
# 生产环境 .env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_DEV_MODE=false
VITE_ENABLE_ANALYTICS=true
```

### 性能优化

- API请求使用重试机制
- 本地缓存减少重复请求
- 异步处理避免阻塞UI

### 错误处理

```javascript
try {
  await analytics.trackPageView('/page', '页面名称');
} catch (error) {
  console.error('Analytics error:', error);
  // 降级处理或用户提示
}
```

## 📈 数据隐私

- 不收集个人敏感信息
- 支持用户选择退出追踪
- 符合GDPR等隐私法规要求

这个集成方案为工具箱提供了完整的访问记录和分析功能！🎯 