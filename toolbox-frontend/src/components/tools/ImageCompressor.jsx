import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Alert, Slider, Spinner } from '../ui';
import { Upload, Minimize2, Download } from 'lucide-react';

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function ImageCompressor() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(80);
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: t('Please select a valid image file') });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(e.target.result);
        setOriginalSize(file.size);
        setCompressedImage(null);
        setCompressedSize(0);
        setFeedback({ type: 'success', message: t('Image uploaded successfully') });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCompress = () => {
    if (!originalImage) {
      setFeedback({ type: 'error', message: t('Please upload an image first') });
      return;
    }

    setLoading(true);
    setCompressedImage(null);
    setCompressedSize(0);
    setFeedback({ type: '', message: '' });

    setTimeout(() => {
      try {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          // JPEG 不支持透明通道，先铺白底避免透明区域被合成为黑色
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            const compressedUrl = URL.createObjectURL(blob);
            setCompressedImage(compressedUrl);
            setCompressedSize(blob.size);
            setLoading(false);
            const reduction = originalSize > 0 ? Math.round((1 - blob.size / originalSize) * 100) : 0;
            if (reduction <= 0) {
              setFeedback({ type: 'warning', message: t('Image is already optimized, compression would increase size') });
            } else {
              setFeedback({
                type: 'success',
                message: t('Image compressed successfully') + ` (${reduction}% ${t('reduction')})`
              });
            }
          }, 'image/jpeg', quality / 100);
        };
        img.src = originalImage;
      } catch {
        setLoading(false);
        setFeedback({ type: 'error', message: t('Image compression failed, please try again') });
      }
    }, 500);
  };

  const downloadCompressed = () => {
    if (compressedImage) {
      const link = document.createElement('a');
      link.href = compressedImage;
      link.download = 'compressed-image.jpg';
      link.click();
    }
  };

  const reduction = originalSize > 0 && compressedSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('Image Compressor')}</h1>
      <p className="text-fg-secondary mb-3">
        {t('Online Image Compressor')}
      </p>

      {/* 工具栏：所有操作集中 */}
      <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
        <div className="flex min-w-[220px] items-center gap-2">
          <span className="whitespace-nowrap text-sm text-fg">{t('Quality')}: {quality}%</span>
          <Slider
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            aria-labelledby="quality-slider"
            step={5}
            min={10}
            max={100}
          />
        </div>
        <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
        <div className="flex items-center gap-1">
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
            startIcon={loading ? <Spinner size={16} /> : <Minimize2 size={16} />}
            disabled={loading || !originalImage}
            onClick={handleCompress}
          >
            {loading ? t('Processing...') : t('Process')}
          </Button>
          <Button size="small" variant="text" onClick={downloadCompressed} disabled={!compressedImage} startIcon={<Download size={16} />}>
            {t('Download')}
          </Button>
        </div>
      </div>

      {feedback.message && <Alert severity={feedback.type} className="mb-3">{feedback.message}</Alert>}

      {/* 左原图 / 右压缩结果 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-sm text-fg">{t('Original Image')}</p>
          {originalImage ? (
            <>
              <img
                src={originalImage}
                alt="Original"
                className="w-full rounded max-h-[300px] object-contain"
              />
              <p className="mt-2 text-center text-sm text-fg">
                {t('Size')}: {formatFileSize(originalSize)}
              </p>
            </>
          ) : (
            <div
              className="flex h-[300px] cursor-pointer items-center justify-center rounded border-2 border-dashed border-line"
              onClick={() => fileInputRef.current.click()}
            >
              <p className="text-fg-secondary">{t('Select Image')}</p>
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm text-fg">{t('Compressed Image')}</p>
          {loading ? (
            <div className="flex h-[300px] items-center justify-center rounded border-2 border-dashed border-line">
              <div className="flex flex-col items-center gap-2">
                <Spinner />
                <p className="text-fg">{t('Processing text, please wait...')}</p>
              </div>
            </div>
          ) : compressedImage ? (
            <>
              <img
                src={compressedImage}
                alt="Compressed"
                className="w-full rounded max-h-[300px] object-contain"
              />
              <p className="mt-2 text-center text-sm text-fg">
                {t('Size')}: {formatFileSize(compressedSize)}
                {reduction > 0 && (
                  <>
                    <br />
                    {t('Reduction')}: {reduction}%
                  </>
                )}
              </p>
            </>
          ) : (
            <div className="flex h-[300px] items-center justify-center rounded border-2 border-dashed border-line">
              <p className="text-fg-secondary">
                {t('Compressed image will appear here after compression')}
              </p>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
