import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Input, Button, Space, Row, Col, Slider, ColorPicker, Upload, message, Spin } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { getBase64 } from '../../utils/imageUtils';

const { TextArea } = Input;

export default function WatermarkTool() {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkColor, setWatermarkColor] = useState('#000000');
  const [transparency, setTransparency] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // 处理图片上传
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
    return false; // 阻止默认上传行为
  };

  // 绘制水印并下载
  const handleAddWatermark = () => {
    if (!imageUrl || !watermarkText.trim()) {
      message.warning(t('watermarkTool.warnUpload'));
      return;
    }

    setLoading(true);
    try {
      const img = new Image();
      img.src = imageUrl;

      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // 设置canvas尺寸与图片一致
        canvas.width = img.width;
        canvas.height = img.height;

        // 绘制原始图片
        ctx.drawImage(img, 0, 0);

        // 设置水印样式
        ctx.fillStyle = watermarkColor;
        ctx.globalAlpha = transparency;
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 绘制水印（居中）
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);

        // 提供下载
        const watermarkedImageUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = watermarkedImageUrl;
        link.download = 'watermarked-image.png';
        link.click();

        message.success(t('watermarkTool.successWatermark'));
        setLoading(false);
      };

      img.onerror = () => {
        message.error(t('watermarkTool.failProcess'));
        setLoading(false);
      };
    } catch (error) {
      console.error('Watermark error:', error);
      message.error(t('watermarkTool.failWatermark'));
      setLoading(false);
    }
  };

  return (
    <Card 
      title={t('watermarkTool.title')} 
      className="tool-card custom-card-body" 
    >
      <div style={{ marginBottom: 20 }}>
        <Upload
          name="image"
          listType="picture-card"
          beforeUpload={handleImageUpload}
          showUploadList={false}
          accept="image/*"
        >
          {imageUrl ? (
            <img src={imageUrl} alt={t('watermarkTool.uploaded')} style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }} />
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <UploadOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <div style={{ marginTop: 16 }}>{t('watermarkTool.upload')}</div>
            </div>
          )}
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
          <ColorPicker value={watermarkColor} onChange={setWatermarkColor} />
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
        onClick={handleAddWatermark}
        loading={loading}
        block
      >
        {t('watermarkTool.addWatermarkAndDownload')}
      </Button>

      {/* 隐藏的Canvas用于处理图片 */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </Card>
  );
}