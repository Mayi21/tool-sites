import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Statistic, Tabs, Alert, Space, Button, DatePicker, Select, Dropdown } from 'antd';
import { 
  EyeOutlined, 
  UserOutlined, 
  GlobalOutlined, 
  BarChartOutlined,
  ReloadOutlined,
  DownloadOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import AccessChart from './AccessChart';
import IPTable from './IPTable';
import IPMap from './IPMap';
import AdminLogin from './AdminLogin';
import { mockDashboardData } from '../../utils/dashboardMock';
import { validateAdminToken, logAdminAction } from '../../config/admin';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedTool, setSelectedTool] = useState('all');
  const [adminInfo, setAdminInfo] = useState(null);

  // 管理员权限检查
  useEffect(() => {
    const checkAdminPermission = () => {
      const adminToken = localStorage.getItem('admin_token');
      const adminUsername = localStorage.getItem('admin_username');
      const loginTime = localStorage.getItem('admin_login_time');
      
      // 使用配置验证管理员令牌
      const isAdminUser = validateAdminToken(adminToken) && adminUsername;
      
      if (isAdminUser) {
        setIsAdmin(true);
        setAdminInfo({
          username: adminUsername,
          loginTime: loginTime
        });
        
        // 记录访问日志
        logAdminAction('dashboard_access', { username: adminUsername });
      } else {
        // 清除无效的令牌
        if (adminToken) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_username');
          localStorage.removeItem('admin_login_time');
        }
        
        setIsAdmin(false);
        setAdminInfo(null);
      }
      
      setLoading(false);
    };

    checkAdminPermission();
  }, []);

  // 加载仪表板数据
  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin, dateRange, selectedTool]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const data = await mockDashboardData.getDashboardData({
        dateRange,
        tool: selectedTool
      });
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleExport = () => {
    // 导出数据功能
    console.log('Exporting dashboard data...');
  };

  const handleLogin = (success) => {
    if (success) {
      setIsAdmin(true);
      const adminUsername = localStorage.getItem('admin_username');
      const loginTime = localStorage.getItem('admin_login_time');
      setAdminInfo({
        username: adminUsername,
        loginTime: loginTime
      });
    }
  };

  const handleLogout = () => {
    // 记录登出日志
    if (adminInfo) {
      logAdminAction('logout', { username: adminInfo.username });
    }
    
    // 清除管理员信息
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    localStorage.removeItem('admin_login_time');
    setIsAdmin(false);
    setAdminInfo(null);
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (!dashboardData) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <div>No data available</div>
      </div>
    );
  }

  const { overview, toolStats, ipRecords } = dashboardData;

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <BarChartOutlined />
          访问概览
        </span>
      ),
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总访问量"
                  value={overview.totalVisits}
                  prefix={<EyeOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="今日访问"
                  value={overview.todayVisits}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="独立访客"
                  value={overview.uniqueVisitors}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="访问国家"
                  value={overview.countries}
                  prefix={<GlobalOutlined />}
                  valueStyle={{ color: '#eb2f96' }}
                />
              </Card>
            </Col>
          </Row>
          
          <Card title="访问量趋势" extra={
            <Space>
              <Select
                value={selectedTool}
                onChange={setSelectedTool}
                style={{ width: 150 }}
              >
                <Option value="all">所有功能</Option>
                <Option value="base64">Base64工具</Option>
                <Option value="diff">文本对比</Option>
                <Option value="json">JSON格式化</Option>
                <Option value="url">URL编码</Option>
                <Option value="unicode">Unicode转换</Option>
                <Option value="text">文本处理</Option>
                <Option value="csv">CSV转换</Option>
              </Select>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: 200 }}
              />
            </Space>
          }>
            <AccessChart data={toolStats} />
          </Card>
        </div>
      )
    },
    {
      key: 'ip-table',
      label: (
        <span>
          <UserOutlined />
          IP访问记录
        </span>
      ),
      children: (
        <Card title="IP访问记录" extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
          </Space>
        }>
          <IPTable data={ipRecords} />
        </Card>
      )
    },
    {
      key: 'ip-map',
      label: (
        <span>
          <GlobalOutlined />
          全球访问地图
        </span>
      ),
      children: (
        <Card title="全球访问分布">
          <IPMap data={ipRecords} />
        </Card>
      )
    }
  ];

  // 管理员操作菜单
  const adminMenuItems = [
    {
      key: 'profile',
      label: (
        <Space>
          <UserOutlined />
          管理员信息
        </Space>
      ),
      onClick: () => {
        // 显示管理员信息
        console.log('Admin info:', adminInfo);
      }
    },
    {
      key: 'settings',
      label: (
        <Space>
          <SettingOutlined />
          系统设置
        </Space>
      ),
      onClick: () => {
        // 打开系统设置
        console.log('Open settings');
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: (
        <Space>
          <LogoutOutlined />
          退出登录
        </Space>
      ),
      onClick: handleLogout
    }
  ];

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ 
        marginBottom: 24, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#1890ff' }}>
            📊 管理员数据看板
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            实时监控网站访问数据和用户行为分析
          </p>
        </div>
        
        {adminInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#666', fontSize: '14px' }}>
              欢迎，{adminInfo.username}
            </span>
            <Dropdown
              menu={{ items: adminMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button 
                icon={<UserOutlined />} 
                size="small"
                style={{ borderRadius: '6px' }}
              >
                管理
              </Button>
            </Dropdown>
          </div>
        )}
      </div>

      <Tabs
        items={tabItems}
        defaultActiveKey="overview"
        size="large"
        style={{ background: 'white', padding: '24px', borderRadius: '8px' }}
      />
    </div>
  );
} 