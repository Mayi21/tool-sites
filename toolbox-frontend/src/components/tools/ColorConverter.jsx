import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, Row, Col, message } from 'antd';
import { CopyOutlined, BgColorsOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function ColorConverter() {
  const { t } = useTranslation();
  const [hex, setHex] = useState('#ff6b6b');
  const [rgb, setRgb] = useState('255, 107, 107');
  const [hsl, setHsl] = useState('0, 100%, 67%');
  const [previewColor, setPreviewColor] = useState('#ff6b6b');

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  function updateFromHex(hexValue) {
    setHex(hexValue);
    const rgbObj = hexToRgb(hexValue);
    if (rgbObj) {
      setRgb(`${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b}`);
      const hslObj = rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b);
      setHsl(`${hslObj.h}, ${hslObj.s}%, ${hslObj.l}%`);
      setPreviewColor(hexValue);
    }
  }

  function updateFromRgb(rgbValue) {
    setRgb(rgbValue);
    const parts = rgbValue.split(',').map(s => parseInt(s.trim()));
    if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
      const hexValue = rgbToHex(parts[0], parts[1], parts[2]);
      setHex(hexValue);
      const hslObj = rgbToHsl(parts[0], parts[1], parts[2]);
      setHsl(`${hslObj.h}, ${hslObj.s}%, ${hslObj.l}%`);
      setPreviewColor(hexValue);
    }
  }

  function updateFromHsl(hslValue) {
    setHsl(hslValue);
    const parts = hslValue.split(',').map(s => parseInt(s.trim()));
    if (parts.length === 3 && parts.every(p => !isNaN(p))) {
      const rgbObj = hslToRgb(parts[0], parts[1], parts[2]);
      setRgb(`${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b}`);
      const hexValue = rgbToHex(rgbObj.r, rgbObj.g, rgbObj.b);
      setHex(hexValue);
      setPreviewColor(hexValue);
    }
  }

  function copyColor(format) {
    let colorValue;
    switch (format) {
      case 'hex':
        colorValue = hex;
        break;
      case 'rgb':
        colorValue = `rgb(${rgb})`;
        break;
      case 'hsl':
        colorValue = `hsl(${hsl})`;
        break;
      default:
        return;
    }
    navigator.clipboard.writeText(colorValue);
    message.success(t('Copied to clipboard'));
  }

  return (
    <Card style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>{t('Color Converter')}</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ 
          width: '100%', 
          height: 100, 
          backgroundColor: previewColor, 
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 18,
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
        }}>
          {previewColor}
        </div>
        
        <Row gutter={16}>
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input 
                value={hex} 
                onChange={e => updateFromHex(e.target.value)} 
                placeholder="#ff6b6b"
                addonAfter={
                  <Button size="small" onClick={() => copyColor('hex')} icon={<CopyOutlined />}>
                    {t('Copy')}
                  </Button>
                }
              />
              <div style={{ fontSize: 12, color: '#666' }}>HEX</div>
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input 
                value={rgb} 
                onChange={e => updateFromRgb(e.target.value)} 
                placeholder="255, 107, 107"
                addonAfter={
                  <Button size="small" onClick={() => copyColor('rgb')} icon={<CopyOutlined />}>
                    {t('Copy')}
                  </Button>
                }
              />
              <div style={{ fontSize: 12, color: '#666' }}>RGB</div>
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input 
                value={hsl} 
                onChange={e => updateFromHsl(e.target.value)} 
                placeholder="0, 100%, 67%"
                addonAfter={
                  <Button size="small" onClick={() => copyColor('hsl')} icon={<CopyOutlined />}>
                    {t('Copy')}
                  </Button>
                }
              />
              <div style={{ fontSize: 12, color: '#666' }}>HSL</div>
            </Space>
          </Col>
        </Row>
        
        <Button icon={<BgColorsOutlined />} onClick={() => updateFromHex('#' + Math.floor(Math.random()*16777215).toString(16))}>
          {t('Random Color')}
        </Button>
      </Space>
    </Card>
  );
} 