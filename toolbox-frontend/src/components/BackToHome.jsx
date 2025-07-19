import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export default function BackToHome() {
  const { t } = useTranslation();
  
  return (
    <Link to="/">
      <Button 
        type="primary" 
        icon={<HomeOutlined />}
        style={{ marginBottom: 16 }}
      >
        {t('Back to Home')}
      </Button>
    </Link>
  );
}