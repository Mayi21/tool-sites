import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Alert, Input, Slider, Modal, Spinner } from '../ui';
import { Upload, Download, Eye } from 'lucide-react';
import { getBase64 } from '../../utils/imageUtils';

export default function WatermarkTool() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [watermarkText, setWatermarkText] = useState('Watermark');
  const [watermarkColor, setWatermarkColor] = useState('#000000');
  const [transparency, setTransparency] = useState(0.5);
  const [fontSize, setFontSize] = useState(24);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: t('Please select a valid image file') });
      return;
    }

    setLoading(true);
    try {
      const base64Url = await getBase64(file);
      setImageUrl(base64Url);
      setFeedback({ type: 'success', message: t('Image uploaded successfully') });
    } catch {
      setFeedback({ type: 'error', message: t('Image upload failed, please try again') });
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = () => {
    if (!imageUrl) {
      setFeedback({ type: 'error', message: t('Please upload an image first') });
      return;
    }

    setLoading(true);
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          if (watermarkText.trim()) {
            const rgbaColor = `rgba(${parseInt(watermarkColor.slice(1, 3), 16)}, ${parseInt(watermarkColor.slice(3, 5), 16)}, ${parseInt(watermarkColor.slice(5, 7), 16)}, ${transparency})`;
            ctx.fillStyle = rgbaColor;
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);
          }

          setLoading(false);
          setFeedback({ type: 'success', message: t('Watermark applied successfully') });
        };
        img.onerror = () => {
          setLoading(false);
          setFeedback({ type: 'error', message: t('Image processing failed, please try again') });
        };
      } catch {
        setLoading(false);
        setFeedback({ type: 'error', message: t('Watermark processing failed, please try again') });
      }
    }, 500);
  };

  const handleDownload = () => {
    if (!imageUrl) {
      setFeedback({ type: 'error', message: t('Please upload an image first') });
      return;
    }
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = 'watermarked-image.png';
    link.click();
    setFeedback({ type: 'success', message: t('Watermarked image downloaded successfully') });
  };

  const handlePreview = () => {
    if (!imageUrl) return;
    setPreviewUrl(canvasRef.current.toDataURL('image/png'));
    setPreviewOpen(true);
  };

  // Apply watermark automatically when parameters change
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
        const rgbaColor = `rgba(${parseInt(watermarkColor.slice(1, 3), 16)}, ${parseInt(watermarkColor.slice(3, 5), 16)}, ${parseInt(watermarkColor.slice(5, 7), 16)}, ${transparency})`;
        ctx.fillStyle = rgbaColor;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);
      }
    };
  }, [imageUrl, watermarkText, watermarkColor, transparency, fontSize]);

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('Image Watermark')}</h1>
        <p className="text-fg-secondary mb-3">
          {t('Add watermark to image')}
        </p>

        {/* 工具栏：所有操作集中 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />
          <Button size="small" variant="text" onClick={() => fileInputRef.current.click()} startIcon={<Upload size={16} />}>
            {t('Select Image')}
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={loading ? <Spinner size={16} /> : <Upload size={16} />}
            disabled={loading || !imageUrl}
            onClick={handleProcess}
          >
            {loading ? t('Processing...') : t('Apply Watermark')}
          </Button>
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <div className="flex gap-1">
            <Button size="small" variant="text" onClick={handlePreview} disabled={!imageUrl} startIcon={<Eye size={16} />}>
              {t('Preview')}
            </Button>
            <Button size="small" variant="text" onClick={handleDownload} disabled={!imageUrl} startIcon={<Download size={16} />}>
              {t('Download')}
            </Button>
          </div>
        </div>

        {feedback.message && <Alert severity={feedback.type} className="mb-3">{feedback.message}</Alert>}

        {/* 左参数 / 右预览 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-6">
            <Input
              label={t('Enter text to process')}
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder={t('Paste or type your text here for processing...')}
            />

            <div className="grid grid-cols-2 items-center gap-4">
              <p className="text-fg">{t('Color')}</p>
              <input
                type="color"
                value={watermarkColor}
                onChange={(e) => setWatermarkColor(e.target.value)}
                className="h-10 w-[60px] cursor-pointer rounded border-0 bg-transparent"
              />
            </div>

            <div>
              <p className="mb-2 text-fg">
                {t('Opacity')}: {(transparency * 100).toFixed(0)}%
              </p>
              <Slider
                value={transparency}
                min={0}
                max={1}
                step={0.01}
                onChange={(e) => setTransparency(Number(e.target.value))}
              />
            </div>

            <div>
              <p className="mb-2 text-fg">
                {t('Font Size')}: {fontSize}px
              </p>
              <Slider
                value={fontSize}
                min={12}
                max={128}
                step={1}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm text-fg">{t('Watermarked Image')}</p>
            {imageUrl ? (
              /* canvas 常驻 DOM（loading 时仅盖遮罩），否则处理回调里 canvasRef 为 null */
              <div className="relative flex min-h-[400px] w-full items-center justify-center overflow-hidden rounded border border-dashed border-line">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[400px] object-contain"
                />
                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-paper/70">
                    <Spinner />
                    <p className="text-fg">{t('Processing watermark, please wait...')}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex min-h-[400px] items-center justify-center rounded border border-dashed border-line">
                <p className="text-fg-secondary">
                  {t('Processing results will appear here. Enter text above and select an operation.')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} className="max-w-[80vw]">
        <img
          src={previewUrl}
          alt="preview"
          loading="lazy"
          className="w-full max-h-[80vh] object-contain"
        />
      </Modal>
    </>
  );
}
