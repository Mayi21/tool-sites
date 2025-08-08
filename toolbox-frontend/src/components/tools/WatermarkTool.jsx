import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Input, Button, Row, Col, Slider, ColorPicker, Upload, message, Modal } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { getBase64 } from '../../utils/imageUtils';

const { TextArea } = Input;

export default function WatermarkTool() {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState(null);
  const [watermarkText, setWatermarkText] = useState('Watermark');
  const [watermarkColor, setWatermarkColor] = useState('rgba(0, 0, 0, 0.5)');
  const [transparency, setTransparency] = useState(0.5);
  const [fontSize, setFontSize] = useState(24);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
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
      // 设置 canvas 为原始图片尺寸
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 绘制图片
      ctx.drawImage(img, 0, 0);

      if (watermarkText.trim()) {
        ctx.fillStyle = watermarkColor;
        ctx.globalAlpha = transparency;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);
      }
    };
    
    img.onerror = () => {
        message.error(t('watermarkTool.failProcess'));
    };

  }, [imageUrl, watermarkText, watermarkColor, transparency, fontSize, t]);

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

  const handleDoubleClickPreview = () => {
    if (!imageUrl || !canvasRef.current) {
      message.warning(t('watermarkTool.warnUpload'));
      return;
    }
    const url = canvasRef.current.toDataURL('image/png');
    setPreviewUrl(url);
    setPreviewOpen(true);
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

          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8 }}>{t('watermarkTool.color')}</div>
            <ColorPicker value={watermarkColor} onChange={(c) => setWatermarkColor(c.toRgbString())} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8 }}>{t('watermarkTool.transparency')} ({(transparency * 100).toFixed(0)}%)</div>
            <Slider
              value={transparency}
              min={0}
              max={1}
              step={0.01}
              onChange={setTransparency}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8 }}>{t('watermarkTool.fontSize')} ({fontSize}px)</div>
            <Slider
              value={fontSize}
              min={12}
              max={128}
              step={1}
              onChange={setFontSize}
            />
          </div>

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
          <div onDoubleClick={handleDoubleClickPreview} title="双击预览" style={{ 
            width: '100%', 
            height: 465,
            border: '1px dashed #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            cursor: imageUrl ? 'zoom-in' : 'default'
          }}>
            <canvas 
              ref={canvasRef} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                objectFit: 'contain' 
              }}
            />
          </div>
        </Col>
      </Row>
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width="80vw"
        style={{ top: 20 }}
        destroyOnClose
      >
        <div style={{ width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="preview"
              style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
            />
          )}
        </div>
      </Modal>
    </Card>
  );
}