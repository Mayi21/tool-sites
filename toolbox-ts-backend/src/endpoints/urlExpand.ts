import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { Env, UrlRecord } from "../types";
import { ExpandUrlResponse } from "../types";
import { Context } from "hono";

export class ExpandUrl extends OpenAPIRoute {
	schema = {
		tags: ["URL Shortener"],
		summary: "Expand a short URL",
		description: "Get the original URL and metadata from a short code",
		request: {
			params: z.object({
				shortCode: z.string().min(1).max(20).describe("The short code to expand"),
			}),
		},
		responses: {
			"200": {
				description: "URL expanded successfully",
				content: {
					"application/json": {
						schema: ExpandUrlResponse,
					},
				},
			},
			"404": {
				description: "Short URL not found or expired",
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
			const { shortCode } = await this.getValidatedData<typeof this.schema>();

			const record = await c.env.KV.get(shortCode.params.shortCode);

			if (!record) {
				return c.json({
					success: false,
					error: 'Short URL not found'
				}, 404);
			}

			const data: UrlRecord = JSON.parse(record);

			// 检查是否过期
			if (data.expireAt && Date.now() > data.expireAt) {
				return c.json({
					success: false,
					error: 'Short URL has expired'
				}, 404);
			}

			const baseUrl = this.getBaseUrl(c);
			const shortUrl = `${baseUrl}/${shortCode.params.shortCode}`;

			return c.json({
				success: true,
				data: {
					originalUrl: data.originalUrl,
					shortCode: data.shortCode,
					shortUrl,
					createdAt: data.createdAt,
					clicks: data.clicks,
					lastAccessed: data.lastAccessed,
					expireAt: data.expireAt
				}
			});

		} catch (error) {
			console.error('Error in ExpandUrl:', error);
			return c.json({
				success: false,
				error: error instanceof Error ? error.message : 'Internal server error'
			}, 500);
		}
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