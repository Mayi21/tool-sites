// 前端API调用服务 - 使用toolbox-ts-backend
import { buildApiUrl, getApiConfig } from '../config/api.js';

const API_CONFIG = getApiConfig();

export class UrlShortenerApiService {
  static async shortenUrl(url, options = {}) {
    try {
      const response = await fetch(buildApiUrl('/api/url/shorten'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          alias: options.alias,
          expireTime: options.expireTime
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Network error: ' + error.message
      };
    }
  }

  static async shortenUrlsBatch(urls, options = {}) {
    try {
      const response = await fetch(buildApiUrl('/api/url/shorten/batch'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls,
          expireTime: options.expireTime
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Network error: ' + error.message
      };
    }
  }

  static async expandUrl(shortCode) {
    try {
      const response = await fetch(buildApiUrl(`/api/url/expand/${shortCode}`), {
        method: 'GET',
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Network error: ' + error.message
      };
    }
  }

  static async expandUrlsBatch(shortCodes) {
    const results = [];

    for (const code of shortCodes) {
      const shortCode = this.extractShortCode(code);
      if (shortCode) {
        const result = await this.expandUrl(shortCode);
        results.push({
          ...result,
          inputUrl: code
        });
      } else {
        results.push({
          success: false,
          error: 'Invalid short URL format',
          inputUrl: code
        });
      }
    }

    return {
      success: true,
      data: results,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  }

  static async getStats(shortCode) {
    try {
      const response = await fetch(buildApiUrl(`/api/url/stats/${shortCode}`), {
        method: 'GET',
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Network error: ' + error.message
      };
    }
  }

  // 从完整URL中提取短码
  static extractShortCode(url) {
    try {
      if (url.includes('/')) {
        const parts = url.split('/');
        return parts[parts.length - 1];
      }
      return url;
    } catch {
      return null;
    }
  }

  // 验证URL格式
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // 检测是否为短链
  static isShortUrl(url) {
    if (!url) return false;

    // 检测常见短链域名
    const shortDomains = [
      'bit.ly', 't.co', 'tinyurl.com', 'toolifyhub.top',
      'goo.gl', 'ow.ly', 'buff.ly', 'is.gd'
    ];

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();

      // 检查是否为已知短链域名
      const isKnownShortDomain = shortDomains.some(shortDomain =>
        domain === shortDomain || domain.endsWith('.' + shortDomain)
      );

      if (isKnownShortDomain) return true;

      // 检查路径是否像短码（短且只包含字母数字）
      const path = urlObj.pathname.substring(1); // 移除开头的 /
      if (path.length >= 3 && path.length <= 10 && /^[a-zA-Z0-9]+$/.test(path)) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  // 生成QR码URL
  static generateQrCodeUrl(url, size = 150) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  }
}

export default UrlShortenerApiService;