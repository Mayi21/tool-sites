import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { Env, UrlRecord } from "../types";
import { ShortenUrlBatchRequest } from "../types";
import { Context } from "hono";

export class ShortenUrlBatch extends OpenAPIRoute {
	schema = {
		tags: ["URL Shortener"],
		summary: "Create multiple short URLs",
		description: "Generate short URLs for multiple long URLs in batch",
		request: {
			body: {
				content: {
					"application/json": {
						schema: ShortenUrlBatchRequest,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Batch processing completed",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							data: z.array(z.object({
								success: z.boolean(),
								data: z.object({
									originalUrl: z.string(),
									shortUrl: z.string(),
									shortCode: z.string(),
									createdAt: z.number(),
									expireAt: z.number().nullable(),
									qrCode: z.string(),
								}).optional(),
								error: z.string().optional(),
							})),
							total: z.number(),
							successful: z.number(),
							failed: z.number(),
						}),
					},
				},
			},
		},
	};

	async handle(c: Context<{ Bindings: Env }>) {
		try {
			const body = await this.getValidatedData<typeof this.schema>();
			const { urls, expireTime } = body.body;

			const results = [];
			let successful = 0;
			let failed = 0;

			for (const url of urls) {
				try {
					// 验证URL格式
					if (!this.isValidUrl(url)) {
						results.push({
							success: false,
							error: "Invalid URL format"
						});
						failed++;
						continue;
					}

					// 生成短码
					const shortCode = this.generateShortCode();

					// 检查短码是否已存在（简单重试）
					let existing = await c.env.KV.get(shortCode);
					let retries = 0;
					let currentShortCode = shortCode;

					while (existing && retries < 3) {
						currentShortCode = this.generateShortCode();
						existing = await c.env.KV.get(currentShortCode);
						retries++;
					}

					if (existing) {
						results.push({
							success: false,
							error: "Failed to generate unique short code"
						});
						failed++;
						continue;
					}

					// 创建短链记录
					const now = Date.now();
					const record: UrlRecord = {
						originalUrl: url,
						shortCode: currentShortCode,
						createdAt: now,
						expireAt: this.calculateExpireTime(expireTime),
						clicks: 0,
						lastAccessed: null,
						creator: 'api-batch',
						userAgent: c.req.header('User-Agent') || '',
						ip: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || ''
					};

					// 保存到KV存储
					await c.env.KV.put(currentShortCode, JSON.stringify(record));

					// 保存URL到短码的反向映射
					const urlHash = this.hashUrl(url);
					await c.env.KV.put(`url:${urlHash}`, currentShortCode);

					const baseUrl = this.getBaseUrl(c);
					const shortUrl = `${baseUrl}/${currentShortCode}`;

					results.push({
						success: true,
						data: {
							originalUrl: url,
							shortUrl,
							shortCode: currentShortCode,
							createdAt: now,
							expireAt: record.expireAt,
							qrCode: this.generateQrCodeUrl(shortUrl)
						}
					});
					successful++;

				} catch (error) {
					console.error('Error processing URL in batch:', url, error);
					results.push({
						success: false,
						error: error instanceof Error ? error.message : 'Processing failed'
					});
					failed++;
				}
			}

			return c.json({
				success: true,
				data: results,
				total: urls.length,
				successful,
				failed
			});

		} catch (error) {
			console.error('Error in ShortenUrlBatch:', error);
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
		let hash = 0;
		for (let i = 0; i < url.length; i++) {
			const char = url.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash;
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
		// 优先级：SHORT_DOMAIN > BACKEND_DOMAIN > 自动检测
		if (c.env.SHORT_DOMAIN) {
			return c.env.SHORT_DOMAIN;
		}

		if (c.env.BACKEND_DOMAIN) {
			return c.env.BACKEND_DOMAIN;
		}

		// 自动检测：本地开发环境使用当前host
		const host = c.req.header('host');
		if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
			return `http://${host}`;
		}

		// 默认回退地址
		return `https://${host || 'api.toolifyhub.top'}`;
	}
}