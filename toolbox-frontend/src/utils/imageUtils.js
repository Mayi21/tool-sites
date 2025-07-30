/**
 * Converts a file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} A promise that resolves to the base64 string
 */
export const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Loads an image from a URL
 * @param {string} url - The image URL
 * @returns {Promise<HTMLImageElement>} A promise that resolves to an Image element
 */
export const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = error => reject(error);
  });
};

/**
 * Converts a canvas to a blob
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {string} type - The image type (e.g., 'image/png')
 * @param {number} quality - The image quality (0-1)
 * @returns {Promise<Blob>} A promise that resolves to a Blob
 */
export const canvasToBlob = (canvas, type = 'image/png', quality = 0.92) => {
  return new Promise((resolve) => {
    canvas.toBlob(blob => resolve(blob), type, quality);
  });
};

/**
 * Resizes an image to specified dimensions
 * @param {HTMLImageElement} img - The image to resize
 * @param {number} width - The target width
 * @param {number} height - The target height
 * @returns {HTMLCanvasElement} A canvas with the resized image
 */
export const resizeImage = (img, width, height) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
};

/**
 * Checks if a file is an image based on its type
 * @param {File} file - The file to check
 * @returns {boolean} True if the file is an image
 */
export const isImageFile = (file) => {
  return file && file.type.startsWith('image/');
};