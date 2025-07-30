
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Input, Button, Space, Row, Col, ColorPicker, Upload, message, Spin, Select, Slider } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { getBase64 } from '../../utils/imageUtils';
import { debounce } from 'lodash';

const { TextArea } = Input;
const { Option } = Select;

export default function ImageWatermark() {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState(null);
  const [watermarkText, setWatermarkText] = useState('Sample');
  const [watermarkColor, setWatermarkColor] = useState('#ffffff');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [watermarkType, setWatermarkType] = useState('single');

  const handleImageUpload = async (file) => {
    if (file.size > 10 * 1024 * 1024) {
      message.error(t('Image size cannot exceed 10MB'));
      return false;
    }
    setLoading(true);
    try {
      const base64Url = await getBase64(file);
      setImageUrl(base64Url);
    } catch (error) {
      message.error(t('Failed to upload image'));
    } finally {
      setLoading(false);
    }
    return false;
  };

  const redrawCanvas = useCallback(() => {
    if (imageUrl && canvasRef.current) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        ctx.fillStyle = watermarkColor;
        ctx.globalAlpha = watermarkOpacity;
        ctx.font = '48px Arial';

        if (watermarkType === 'single') {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);
        } else {
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(-0.25 * Math.PI);
          for (let x = -canvas.width; x < canvas.width * 1.5; x += 200) {
            for (let y = -canvas.height; y < canvas.height * 1.5; y += 100) {
              ctx.fillText(watermarkText, x, y);
            }
          }
          ctx.restore();
        }
        ctx.globalAlpha = 1.0;

        setPreviewUrl(canvas.toDataURL('image/png'));
      };
    }
  }, [imageUrl, watermarkText, watermarkColor, watermarkType, watermarkOpacity]);

  const debouncedRedraw = useCallback(debounce(redrawCanvas, 200), [redrawCanvas]);

  useEffect(() => {
    debouncedRedraw();
  }, [imageUrl, watermarkText, watermarkColor, watermarkType, watermarkOpacity, debouncedRedraw]);

  const handleDownload = () => {
    if (!previewUrl) {
      message.warning(t('Please upload an image'));
      return;
    }
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = 'watermarked-image.png';
    link.click();
  };

  return (
    <Card title={t('Image Watermark')}>
      <Spin spinning={loading}>
        <Row gutter={16}>
          <Col span={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Upload
                beforeUpload={handleImageUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>{t('Select Image')}</Button>
              </Upload>

              <TextArea
                rows={4}
                placeholder={t('Enter watermark text')}
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
              />

              <Row align="middle" gutter={16}>
                <Col>
                  <span>{t('Watermark Color')}:</span>
                </Col>
                <Col>
                  <ColorPicker
                    value={watermarkColor}
                    onChange={(color) => setWatermarkColor(color.toHexString())}
                    showText
                  />
                </Col>
              </Row>

              <Row align="middle" gutter={16}>
                <Col>
                  <span>{t('Opacity')}:</span>
                </Col>
                <Col flex="auto">
                  <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    style={{ width: 200 }}
                    value={watermarkOpacity}
                    onChange={setWatermarkOpacity}
                  />
                </Col>
              </Row>

              <Row align="middle" gutter={16}>
                <Col>
                  <span>{t('Watermark Type')}:</span>
                </Col>
                <Col>
                  <Select value={watermarkType} onChange={setWatermarkType}>
                    <Option value="single">{t('Single')}</Option>
                    <Option value="tiled">{t('Tiled')}</Option>
                  </Select>
                </Col>
              </Row>

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                disabled={!imageUrl}
              >
                {t('Add Watermark and Download')}
              </Button>
            </Space>
          </Col>
          <Col span={12}>
            {previewUrl ? (
              <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }} />
            ) : (
              <div style={{
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #d9d9d9',
                borderRadius: 8
              }}>
                {t('Preview will appear here')}
              </div>
            )}
          </Col>
        </Row>
      </Spin>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Card>
  );
}
