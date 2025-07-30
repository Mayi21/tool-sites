import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ImageWatermarkTool = () => {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [watermarkText, setWatermarkText] = useState('Hello World');
  const [textColor, setTextColor] = useState('#ffffff');
  const [opacity, setOpacity] = useState(0.5);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError(t('imageWatermark.errorSize'));
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = image;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        ctx.font = '48px Arial';
        ctx.fillStyle = textColor;
        ctx.globalAlpha = opacity;
        ctx.fillText(watermarkText, 50, 100);
        ctx.globalAlpha = 1.0; // Reset alpha
      };
    }
  }, [image, watermarkText, textColor, opacity, t]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'watermarked-image.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{t('imageWatermark.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="mb-4">
            <label className="block mb-2">{t('imageWatermark.uploadLabel')}</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="mb-4">
            <label className="block mb-2">{t('imageWatermark.watermarkText')}</label>
            <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full p-2 border rounded"/>
          </div>
          <div className="mb-4">
            <label className="block mb-2">{t('imageWatermark.textColor')}</label>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-10 p-1 border rounded"/>
          </div>
          <div className="mb-4">
            <label className="block mb-2">{t('imageWatermark.opacity')}</label>
            <input type="range" min="0" max="1" step="0.1" value={opacity} onChange={(e) => setOpacity(e.target.value)} className="w-full"/>
          </div>
          <button onClick={handleDownload} disabled={!image} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
            {t('imageWatermark.downloadButton')}
          </button>
        </div>
        <div>
          <canvas ref={canvasRef} className="border w-full"></canvas>
        </div>
      </div>
    </div>
  );
};

export default ImageWatermarkTool;
