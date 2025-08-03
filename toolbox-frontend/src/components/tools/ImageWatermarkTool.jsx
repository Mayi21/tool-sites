import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const ImageWatermarkTool = () => {
    const { t } = useTranslation();
    const [image, setImage] = useState(null);
    const [watermarkText, setWatermarkText] = useState('Hello World');
    const [fontSize, setFontSize] = useState(32);
    const [fontColor, setFontColor] = useState('#ffffff');
    const [opacity, setOpacity] = useState(0.5);
    const [rotation, setRotation] = useState(-45);
    const [position, setPosition] = useState('middle-center');
    const [outputImage, setOutputImage] = useState(null);
    const canvasRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target.result);
                console.log(t('imageWatermark.imageUploadedSuccess'));
            };
            reader.readAsDataURL(file);
        }
    };

    const addWatermark = () => {
        if (!image) {
            alert(t('imageWatermark.uploadImageFirst'));
            return;
        }

        const img = new Image();
        img.src = image;
        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = fontColor;
            ctx.globalAlpha = opacity;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const textMetrics = ctx.measureText(watermarkText);
            const textWidth = textMetrics.width;
            const textHeight = fontSize; // Approximate height

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.translate(-centerX, -centerY);

            let x, y;
            const [vertical, horizontal] = position.split('-');

            switch (vertical) {
                case 'top':
                    y = textHeight / 2;
                    break;
                case 'middle':
                    y = centerY;
                    break;
                case 'bottom':
                    y = canvas.height - textHeight / 2;
                    break;
                default:
                    y = centerY;
            }

            switch (horizontal) {
                case 'left':
                    x = textWidth / 2;
                    break;
                case 'center':
                    x = centerX;
                    break;
                case 'right':
                    x = canvas.width - textWidth / 2;
                    break;
                default:
                    x = centerX;
            }

            ctx.fillText(watermarkText, x, y);
            ctx.restore();

            setOutputImage(canvas.toDataURL('image/png'));
            console.log(t('imageWatermark.watermarkAddedSuccess'));
        };
        img.onerror = () => {
            alert(t('imageWatermark.imageProcessingError'));
        };
    };

    const downloadImage = () => {
        const link = document.createElement('a');
        link.href = outputImage;
        link.download = 'watermarked-image.png';
        link.click();
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t('imageWatermark.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('imageWatermark.uploadImage')}</label>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('imageWatermark.watermarkText')}</label>
                        <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('imageWatermark.fontSize')}</label>
                        <input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value, 10))} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('imageWatermark.fontColor')}</label>
                        <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="mt-1 block w-full h-10 px-1 py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('imageWatermark.opacity')}</label>
                        <input type="range" min="0" max="1" step="0.1" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="mt-1 block w-full" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('imageWatermark.rotation')}</label>
                        <input type="range" min="-180" max="180" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value, 10))} className="mt-1 block w-full" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('imageWatermark.position')}</label>
                        <select value={position} onChange={(e) => setPosition(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="top-left">{t('imageWatermark.topLeft')}</option>
                            <option value="top-center">{t('imageWatermark.topCenter')}</option>
                            <option value="top-right">{t('imageWatermark.topRight')}</option>
                            <option value="middle-left">{t('imageWatermark.middleLeft')}</option>
                            <option value="middle-center">{t('imageWatermark.middleCenter')}</option>
                            <option value="middle-right">{t('imageWatermark.middleRight')}</option>
                            <option value="bottom-left">{t('imageWatermark.bottomLeft')}</option>
                            <option value="bottom-center">{t('imageWatermark.bottomCenter')}</option>
                            <option value="bottom-right">{t('imageWatermark.bottomRight')}</option>
                        </select>
                    </div>
                    <button onClick={addWatermark} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{t('imageWatermark.addWatermark')}</button>
                </div>
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg dark:border-gray-600">
                    {outputImage ? (
                        <img src={outputImage} alt="Watermarked" className="max-w-full h-auto" />
                    ) : (
                        <div className="text-gray-500">{t('Preview will appear here')}</div>
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                    {outputImage && (
                        <button onClick={downloadImage} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">{t('imageWatermark.downloadImage')}</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageWatermarkTool;
