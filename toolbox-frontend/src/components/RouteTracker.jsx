import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from '../utils/analytics.js';
import tools from '../tools.js';

// 路由追踪组件
const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackCurrentPage = async () => {
      const path = location.pathname;
      
      // 跳过测试页面，避免重复记录
      if (path === '/analytics-test') {
        return;
      }

      let pageName = '首页';
      let toolInfo = {};

      // 如果是工具页面，获取工具信息
      if (path !== '/') {
        const currentTool = tools.find(tool => tool.path === path);
        if (currentTool) {
          pageName = currentTool.name;
          toolInfo = {
            tool: currentTool.name,
            toolAction: 'view'
          };
        } else {
          pageName = '未知页面';
        }
      }

      // 记录页面访问
      await analytics.trackPageView(path, pageName, {
        ...toolInfo,
        referrer: document.referrer,
        metadata: {
          category: 'page_view',
          timestamp: new Date().toISOString()
        }
      });
    };

    trackCurrentPage();
  }, [location.pathname]);

  return null; // 这个组件不渲染任何内容
};

export default RouteTracker; 