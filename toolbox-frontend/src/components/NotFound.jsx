import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button, Space } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';

export default function NotFound() {
  const navigate = useNavigate();

  // 3秒后自动跳转到主页
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-secondary)',
      padding: '20px'
    }}>
      <Result
        status="404"
        title="404"
        subTitle={
          <div>
            <p style={{ marginBottom: '8px' }}>
              抱歉，您访问的页面不存在。
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              3秒后自动跳转到主页...
            </p>
          </div>
        }
        extra={
          <Space size="middle">
            <Button 
              type="primary" 
              icon={<HomeOutlined />}
              onClick={handleGoHome}
            >
              返回主页
            </Button>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={handleGoBack}
            >
              返回上页
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              刷新页面
            </Button>
          </Space>
        }
        style={{
          background: 'white',
          borderRadius: '8px',
          padding: '40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      />
    </div>
  );
} 