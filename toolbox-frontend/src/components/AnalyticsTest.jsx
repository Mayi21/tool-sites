import React, { useState, useEffect } from 'react';
import { Button, Card, Statistic, Row, Col, message, Spin } from 'antd';
import analytics from '../utils/analytics.js';
import { getEnvInfo, getCurrentEnv, getCurrentApiUrl } from '../utils/env.js';

const AnalyticsTest = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    // 记录页面访问
    analytics.trackPageView('/analytics-test', '分析功能测试页面', {
      tool: '分析测试',
      toolAction: 'view',
      metadata: {
        category: 'test',
        purpose: 'analytics-verification'
      }
    });

    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await analytics.getStats();
      setStats(data);
      message.success('统计数据加载成功');
    } catch (error) {
      console.error('Failed to load stats:', error);
      message.error('统计数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  const testPageView = async () => {
    try {
      await analytics.trackPageView('/test-page', '测试页面', {
        tool: '测试工具',
        toolAction: 'test'
      });
      message.success('页面访问记录成功');
      setTestResults(prev => [...prev, { type: '页面访问', time: new Date().toLocaleTimeString(), success: true }]);
    } catch (error) {
      message.error('页面访问记录失败');
      setTestResults(prev => [...prev, { type: '页面访问', time: new Date().toLocaleTimeString(), success: false, error: error.message }]);
    }
  };

  const testToolUsage = async () => {
    try {
      await analytics.trackToolUsage('测试工具', 'test', {
        inputData: 'test input',
        outputData: 'test output',
        processingTime: 100,
        success: true
      });
      message.success('工具使用记录成功');
      setTestResults(prev => [...prev, { type: '工具使用', time: new Date().toLocaleTimeString(), success: true }]);
    } catch (error) {
      message.error('工具使用记录失败');
      setTestResults(prev => [...prev, { type: '工具使用', time: new Date().toLocaleTimeString(), success: false, error: error.message }]);
    }
  };

  const testErrorRecording = async () => {
    try {
      await analytics.trackToolUsage('测试工具', 'error', {
        inputData: 'invalid input',
        success: false,
        errorMessage: '模拟错误信息'
      });
      message.success('错误记录成功');
      setTestResults(prev => [...prev, { type: '错误记录', time: new Date().toLocaleTimeString(), success: true }]);
    } catch (error) {
      message.error('错误记录失败');
      setTestResults(prev => [...prev, { type: '错误记录', time: new Date().toLocaleTimeString(), success: false, error: error.message }]);
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>分析功能测试</h1>
      
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总访问量"
              value={stats?.totalVisits || 0}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日访问"
              value={stats?.todayVisits || 0}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="独立访客"
              value={stats?.uniqueVisitors || 0}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="本周访问"
              value={stats?.weekVisits || 0}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="本月访问"
              value={stats?.monthVisits || 0}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="覆盖国家"
              value={stats?.countries || 0}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Card title="热门工具" style={{ marginBottom: '20px' }}>
        {loading ? (
          <Spin />
        ) : (
          <div>
            {stats?.topTools?.slice(0, 5).map((tool, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                {tool.tool}: {tool.count} 次使用
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="热门国家" style={{ marginBottom: '20px' }}>
        {loading ? (
          <Spin />
        ) : (
          <div>
            {stats?.topCountries?.slice(0, 5).map((country, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                {country.country}: {country.count} 次访问
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="功能测试" style={{ marginBottom: '20px' }}>
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col>
            <Button type="primary" onClick={testPageView}>
              测试页面访问记录
            </Button>
          </Col>
          <Col>
            <Button type="primary" onClick={testToolUsage}>
              测试工具使用记录
            </Button>
          </Col>
          <Col>
            <Button type="primary" onClick={testErrorRecording}>
              测试错误记录
            </Button>
          </Col>
          <Col>
            <Button onClick={loadStats}>
              刷新统计数据
            </Button>
          </Col>
          <Col>
            <Button onClick={clearTestResults}>
              清空测试结果
            </Button>
          </Col>
        </Row>

        <div>
          <h4>测试结果:</h4>
          {testResults.map((result, index) => (
            <div key={index} style={{ 
              marginBottom: '8px', 
              padding: '8px', 
              backgroundColor: result.success ? '#f6ffed' : '#fff2f0',
              border: `1px solid ${result.success ? '#b7eb8f' : '#ffccc7'}`,
              borderRadius: '4px'
            }}>
              <div style={{ fontWeight: 'bold' }}>
                {result.type} - {result.time}
              </div>
              <div style={{ color: result.success ? '#52c41a' : '#ff4d4f' }}>
                {result.success ? '成功' : `失败: ${result.error}`}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="调试信息">
        <div>
          <p><strong>当前环境:</strong> {getCurrentEnv()}</p>
          <p><strong>环境模式:</strong> {getEnvInfo().mode}</p>
          <p><strong>会话ID:</strong> {analytics.sessionId}</p>
          <p><strong>本地访问记录数:</strong> {analytics.visits.length}</p>
          <p><strong>当前页面:</strong> {analytics.currentPage || '无'}</p>
          <p><strong>API基础URL:</strong> {import.meta.env.VITE_API_BASE_URL || '自动检测'}</p>
          <p><strong>实际API地址:</strong> {getCurrentApiUrl()}</p>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsTest; 