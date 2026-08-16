import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Button, Card } from './ui';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-lg p-8 text-center">
        <AlertCircle size={64} className="mx-auto text-danger" />
        <h1 className="mt-4 text-3xl font-bold text-fg">404</h1>
        <p className="mt-2 text-fg-secondary">抱歉，您访问的页面不存在。</p>
        <p className="mb-6 text-sm text-fg-secondary">您可以返回主页或上一页继续浏览。</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button startIcon={<Home size={16} />} onClick={() => navigate('/', { replace: true })}>
            返回主页
          </Button>
          <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
            返回上页
          </Button>
          <Button variant="outlined" startIcon={<RefreshCw size={16} />} onClick={() => window.location.reload()}>
            刷新页面
          </Button>
        </div>
      </Card>
    </div>
  );
}
