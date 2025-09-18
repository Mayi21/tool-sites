import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { Env, UrlRecord, UrlStats } from "../types";
import { Context } from "hono";

export class UrlStats extends OpenAPIRoute {
	schema = {
		tags: ["URL Shortener"],
		summary: "Get URL statistics",
		description: "Retrieve detailed statistics for a short URL",
		request: {
			params: z.object({
				shortCode: z.string().min(1).max(20).describe("The short code to get stats for"),
			}),
		},
		responses: {
			"200": {
				description: "Statistics retrieved successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							data: z.object({
								originalUrl: z.string(),
								shortCode: z.string(),
								shortUrl: z.string(),
								createdAt: z.number(),
								clicks: z.number(),
								lastAccessed: z.number().nullable(),
								expireAt: z.number().nullable(),
								stats: z.object({
									dailyClicks: z.record(z.string(), z.number()),
									referrers: z.record(z.string(), z.number()),
									userAgents: z.record(z.string(), z.number()),
									countries: z.record(z.string(), z.number()),
									devices: z.record(z.string(), z.number()),
								}),
							}),
						}),
					},
				},
			},
			"404": {
				description: "Short URL not found",
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

			// 获取详细统计数据
			const statsKey = `stats:${shortCode.params.shortCode}`;
			const statsRecord = await c.env.KV.get(statsKey);

			const stats: UrlStats = statsRecord ? JSON.parse(statsRecord) : {
				dailyClicks: {},
				referrers: {},
				userAgents: {},
				countries: {},
				devices: {}
			};

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
					expireAt: data.expireAt,
					stats
				}
			});

		} catch (error) {
			console.error('Error in UrlStats:', error);
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