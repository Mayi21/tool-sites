import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Alert, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { 
  generateAdminToken, 
  logAdminAction,
  ADMIN_CONFIG,
  initCredentials
} from '../../config/admin';

const { Title, Text } = Typography;

export default function AdminLogin({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 初始化配置
  useEffect(() => {
    const initialize = () => {
      // 初始化管理员凭据
      initCredentials();
    };

    initialize();
  }, []);



  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 直接登录成功（无需密码验证）
      const adminToken = generateAdminToken(values.username);
      localStorage.setItem('admin_token', adminToken);
      localStorage.setItem('admin_username', values.username);
      localStorage.setItem('admin_login_time', new Date().toISOString());
      
      // 记录登录日志
      logAdminAction('login_success', { username: values.username });
      
      // 调用登录成功回调
      onLogin(true);
    } catch (error) {
      console.error('登录失败:', error);
      logAdminAction('login_error', { error: error.message });
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{ 
      maxWidth: 400, 
      margin: '100px auto', 
      padding: '20px' 
    }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            🔐 管理员登录
          </Title>
          <Text type="secondary">
            请输入管理员账号
          </Text>
        </div>

        <Form
          form={form}
          name="admin_login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入管理员账号' },
              { min: 3, message: '账号长度至少3位' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="管理员账号"
              autoFocus
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%' }}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>



        <div style={{ 
          marginTop: 24, 
          padding: '12px', 
          background: '#f6f8fa', 
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            💡 使用提示：
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            <li>请输入管理员账号即可登录</li>
            <li>登录后可以访问数据看板</li>
            <li>不要在公共设备上保存登录状态</li>
            <li>使用完毕后请及时登出</li>
          </ul>
        </div>
      </Card>
    </div>
  );
} 