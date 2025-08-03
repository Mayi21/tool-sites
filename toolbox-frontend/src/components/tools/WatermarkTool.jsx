import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Input, Button, Row, Col, Slider, ColorPicker, Upload, message } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { getBase64 } from '../../utils/imageUtils';

const { TextArea } = Input;

export default function WatermarkTool() {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState(null);
  const [watermarkText, setWatermarkText] = useState('Watermark');
  const [watermarkColor, setWatermarkColor] = useState('rgba(0, 0, 0, 0.5)');
  const [transparency, setTransparency] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const handleImageUpload = async (file) => {
    setLoading(true);
    try {
      const base64Url = await getBase64(file);
      setImageUrl(base64Url);
      message.success(t('watermarkTool.successUpload'));
    } catch (error) {
      console.error('Image upload error:', error);
      message.error(t('watermarkTool.failUpload'));
    } finally {
      setLoading(false);
    }
    return false; // Prevent default upload behavior
  };

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (watermarkText.trim()) {
        ctx.fillStyle = watermarkColor;
        ctx.globalAlpha = transparency;
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);
      }
    };
    
    img.onerror = () => {
        message.error(t('watermarkTool.failProcess'));
    };

  }, [imageUrl, watermarkText, watermarkColor, transparency, t]);

  const handleDownload = () => {
    if (!imageUrl) {
      message.warning(t('watermarkTool.warnUpload'));
      return;
    }
    const canvas = canvasRef.current;
    const watermarkedImageUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = watermarkedImageUrl;
    link.download = 'watermarked-image.png';
    link.click();
    message.success(t('watermarkTool.successWatermark'));
  };

  return (
    <Card 
      title={t('watermarkTool.title')} 
      className="tool-card custom-card-body" 
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <div style={{ marginBottom: 20 }}>
            <Upload
              name="image"
              listType="picture-card"
              beforeUpload={handleImageUpload}
              showUploadList={false}
              accept="image/*"
            >
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <UploadOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                <div style={{ marginTop: 16 }}>{t('watermarkTool.upload')}</div>
              </div>
            </Upload>
          </div>

          <div style={{ marginBottom: 16 }}>
            <TextArea
              placeholder={t('watermarkTool.enterWatermark')}
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              rows={4}
            />
          </div>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>{t('watermarkTool.color')}</div>
              <ColorPicker value={watermarkColor} onChange={(c) => setWatermarkColor(c.toRgbString())} />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>{t('watermarkTool.transparency')} ({(transparency * 100).toFixed(0)}%)</div>
              <Slider
                value={transparency}
                min={0}
                max={1}
                step={0.01}
                onChange={setTransparency}
              />
            </Col>
          </Row>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            loading={loading}
            block
          >
            {t('watermarkTool.addWatermarkAndDownload')}
          </Button>
        </Col>
        <Col xs={24} md={16}>
          <canvas ref={canvasRef} style={{ width: '100%', border: '1px dashed #ccc' }}/>
        </Col>
      </Row>
    </Card>
  );
}