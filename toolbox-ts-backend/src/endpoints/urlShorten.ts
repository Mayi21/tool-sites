import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { Env, UrlRecord } from "../types";
import { ShortenUrlRequest, ShortenUrlResponse } from "../types";
import { Context } from "hono";

export class ShortenUrl extends OpenAPIRoute {
	schema = {
		tags: ["URL Shortener"],
		summary: "Create a short URL",
		description: "Generate a short URL from a long URL with optional custom alias and expiration",
		request: {
			body: {
				content: {
					"application/json": {
						schema: ShortenUrlRequest,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Short URL created successfully",
				content: {
					"application/json": {
						schema: ShortenUrlResponse,
					},
				},
			},
			"400": {
				description: "Bad request - invalid URL or alias already exists",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
						}),
					},
				},
			},
		},
	};

	async handle(c: Context<{ Bindings: Env }>) {
		try {
			const body = await this.getValidatedData<typeof this.schema>();
			const { url, alias, expireTime } = body.body;

			// 验证URL格式
			if (!this.isValidUrl(url)) {
				return c.json({
					success: false,
					error: "Invalid URL format"
				}, 400);
			}

			// 生成短码
			const shortCode = alias || this.generateShortCode();

			// 检查短码是否已存在
			const existing = await c.env.KV.get(shortCode);
			if (existing) {
				if (alias) {
					return c.json({
						success: false,
						error: "Custom alias already exists"
					}, 400);
				} else {
					// 如果自动生成的短码冲突，重新生成
					return this.handle(c);
				}
			}

			// 创建短链记录
			const now = Date.now();
			const record: UrlRecord = {
				originalUrl: url,
				shortCode,
				createdAt: now,
				expireAt: this.calculateExpireTime(expireTime),
				clicks: 0,
				lastAccessed: null,
				creator: 'api',
				userAgent: c.req.header('User-Agent') || '',
				ip: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || ''
			};

			// 保存到KV存储
			await c.env.KV.put(shortCode, JSON.stringify(record));

			// 保存URL到短码的反向映射（用于查重）
			const urlHash = this.hashUrl(url);
			await c.env.KV.put(`url:${urlHash}`, shortCode);

			const baseUrl = this.getBaseUrl(c);
			const shortUrl = `${baseUrl}/${shortCode}`;

			return c.json({
				success: true,
				data: {
					originalUrl: url,
					shortUrl,
					shortCode,
					createdAt: now,
					expireAt: record.expireAt,
					qrCode: this.generateQrCodeUrl(shortUrl)
				}
			});

		} catch (error) {
			console.error('Error in ShortenUrl:', error);
			return c.json({
				success: false,
				error: error instanceof Error ? error.message : 'Internal server error'
			}, 500);
		}
	}

	private isValidUrl(url: string): boolean {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	}

	private generateShortCode(length: number = 6): string {
		const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	private hashUrl(url: string): string {
		// 简单hash实现
		let hash = 0;
		for (let i = 0; i < url.length; i++) {
			const char = url.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // 转换为32位整数
		}
		return Math.abs(hash).toString(36);
	}

	private calculateExpireTime(expireOption?: string): number | null {
		if (!expireOption || expireOption === 'never') {
			return null;
		}

		const now = Date.now();
		const timeMap: Record<string, number> = {
			'1hour': 60 * 60 * 1000,
			'1day': 24 * 60 * 60 * 1000,
			'1week': 7 * 24 * 60 * 60 * 1000,
			'1month': 30 * 24 * 60 * 60 * 1000,
			'1year': 365 * 24 * 60 * 60 * 1000
		};

		return now + (timeMap[expireOption] || 0);
	}

	private generateQrCodeUrl(url: string, size: number = 150): string {
		return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
	}

	private getBaseUrl(c: Context<{ Bindings: Env }>): string {
		// 短链应该指向后端服务器，不是前端
		// 本地开发时使用当前服务器地址，生产环境使用配置的短链域名
		const host = c.req.header('host');
		if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
			// 本地开发环境
			return `http://${host}`;
		}
		// 生产环境，可以设置专门的短链域名
		return c.env.SHORT_DOMAIN || `https://${host || 'api.toolifyhub.top'}`;
	}
}