import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Upload, Button, Space, Card, Row, Col, Slider, message } from 'antd';
import { UploadOutlined, FileZipOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function ImageCompressor() {
  const { t } = useTranslation();
  const [quality, setQuality] = useState(80);
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const canvasRef = useRef(null);

  function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(e.target.result);
        setOriginalSize(file.size);
        setCompressedImage(null);
        setCompressedSize(0);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    return false; // Prevent default upload
  }

  function compressImage() {
    if (!originalImage) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        const compressedUrl = URL.createObjectURL(blob);
        setCompressedImage(compressedUrl);
        setCompressedSize(blob.size);
      }, 'image/jpeg', quality / 100);
    };
    img.src = originalImage;
  }

  function downloadCompressed() {
    if (compressedImage) {
      const link = document.createElement('a');
      link.href = compressedImage;
      link.download = 'compressed-image.jpg';
      link.click();
    }
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>{t('Image Compressor')}</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Upload
              beforeUpload={handleImageUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} size="large" style={{ width: '100%' }}>
                {t('Select Image')}
              </Button>
            </Upload>
          </Col>
          <Col span={12}>
            <div>
              <div>{t('Quality')}: {quality}%</div>
              <Slider
                value={quality}
                onChange={setQuality}
                min={10}
                max={100}
                style={{ width: '100%' }}
              />
            </div>
          </Col>
        </Row>
        
        {originalImage && (
          <>
                          <Button 
                type="primary" 
                onClick={compressImage} 
                icon={<FileZipOutlined />}
                style={{ width: '100%' }}
              >
                {t('Compress Image')}
              </Button>
            
            <Row gutter={16}>
              <Col span={12}>
                <Card title={t('Original Image')} size="small">
                  <img 
                    src={originalImage} 
                    alt="Original" 
                    style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
                  />
                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                    {t('Size')}: {formatFileSize(originalSize)}
                  </div>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title={t('Compressed Image')} size="small">
                  {compressedImage ? (
                    <>
                      <img 
                        src={compressedImage} 
                        alt="Compressed" 
                        style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
                      />
                      <div style={{ marginTop: 8, textAlign: 'center' }}>
                        {t('Size')}: {formatFileSize(compressedSize)}
                        <br />
                        {t('Reduction')}: {Math.round((1 - compressedSize / originalSize) * 100)}%
                      </div>
                      <Button 
                        type="primary" 
                        onClick={downloadCompressed} 
                        icon={<DownloadOutlined />}
                        style={{ width: '100%', marginTop: 8 }}
                      >
                        {t('Download')}
                      </Button>
                    </>
                  ) : (
                    <div style={{ 
                      height: 300, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '2px dashed #d9d9d9',
                      borderRadius: 8
                    }}>
                      {t('Compressed image will appear here')}
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </>
        )}
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </Space>
    </Card>
  );
} 