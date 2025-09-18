import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { Env, UrlRecord, UrlStats } from "../types";
import { Context } from "hono";

export class UrlRedirect extends OpenAPIRoute {
	schema = {
		tags: ["URL Shortener"],
		summary: "Redirect short URL",
		description: "Handle short URL redirection and update statistics",
		request: {
			params: z.object({
				shortCode: z.string().min(1).max(20).describe("The short code to redirect"),
			}),
		},
		responses: {
			"301": {
				description: "Redirect to original URL",
			},
			"404": {
				description: "Short URL not found or expired",
				content: {
					"text/html": {
						schema: z.string(),
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
				return c.html(`
					<!DOCTYPE html>
					<html>
					<head>
						<title>Link Not Found</title>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1">
						<style>
							body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; }
							.container { max-width: 500px; margin: 0 auto; }
							h1 { color: #333; }
							p { color: #666; margin: 20px 0; }
							.button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
						</style>
					</head>
					<body>
						<div class="container">
							<h1>🔗 Link Not Found</h1>
							<p>The short link you're looking for doesn't exist or may have been removed.</p>
							<a href="${c.env.FRONTEND_DOMAIN || 'https://toolifyhub.top'}" class="button">Go to Homepage</a>
						</div>
					</body>
					</html>
				`, 404);
			}

			const data: UrlRecord = JSON.parse(record);

			// 检查是否过期
			if (data.expireAt && Date.now() > data.expireAt) {
				return c.html(`
					<!DOCTYPE html>
					<html>
					<head>
						<title>Link Expired</title>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1">
						<style>
							body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; }
							.container { max-width: 500px; margin: 0 auto; }
							h1 { color: #333; }
							p { color: #666; margin: 20px 0; }
							.button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
						</style>
					</head>
					<body>
						<div class="container">
							<h1>⏰ Link Expired</h1>
							<p>This short link has expired and is no longer available.</p>
							<a href="${c.env.FRONTEND_DOMAIN || 'https://toolifyhub.top'}" class="button">Go to Homepage</a>
						</div>
					</body>
					</html>
				`, 404);
			}

			// 更新访问统计（异步执行，不阻塞重定向）
			c.executionCtx?.waitUntil(this.updateStats(c, shortCode.params.shortCode, data, c.req));

			// 重定向到原始URL
			return c.redirect(data.originalUrl, 301);

		} catch (error) {
			console.error('Error in UrlRedirect:', error);
			return c.html(`
				<!DOCTYPE html>
				<html>
				<head>
					<title>Error</title>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<style>
						body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; }
						.container { max-width: 500px; margin: 0 auto; }
						h1 { color: #333; }
						p { color: #666; margin: 20px 0; }
						.button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
					</style>
				</head>
				<body>
					<div class="container">
						<h1>❌ Error</h1>
						<p>An error occurred while processing your request.</p>
						<a href="${c.env.FRONTEND_DOMAIN || 'https://toolifyhub.top'}" class="button">Go to Homepage</a>
					</div>
				</body>
				</html>
			`, 500);
		}
	}

	private async updateStats(c: Context<{ Bindings: Env }>, shortCode: string, data: UrlRecord, request: Request) {
		try {
			// 更新点击记录
			data.clicks += 1;
			data.lastAccessed = Date.now();
			await c.env.KV.put(shortCode, JSON.stringify(data));

			// 更新详细统计
			await this.updateDetailedStats(c, shortCode, request);
		} catch (error) {
			console.error('Error updating stats:', error);
		}
	}

	private async updateDetailedStats(c: Context<{ Bindings: Env }>, shortCode: string, request: Request) {
		const statsKey = `stats:${shortCode}`;
		const existingStats = await c.env.KV.get(statsKey);

		let stats: UrlStats = existingStats ? JSON.parse(existingStats) : {
			dailyClicks: {},
			referrers: {},
			userAgents: {},
			countries: {},
			devices: {}
		};

		// 更新每日点击统计
		const today = new Date().toISOString().split('T')[0];
		stats.dailyClicks[today] = (stats.dailyClicks[today] || 0) + 1;

		// 更新来源统计
		const referrer = request.headers.get('Referer');
		if (referrer) {
			try {
				const referrerHost = new URL(referrer).hostname;
				stats.referrers[referrerHost] = (stats.referrers[referrerHost] || 0) + 1;
			} catch {
				stats.referrers['unknown'] = (stats.referrers['unknown'] || 0) + 1;
			}
		} else {
			stats.referrers['direct'] = (stats.referrers['direct'] || 0) + 1;
		}

		// 更新用户代理和设备统计
		const userAgent = request.headers.get('User-Agent') || '';
		const device = this.parseUserAgent(userAgent);
		stats.devices[device] = (stats.devices[device] || 0) + 1;

		// 简化的浏览器检测
		const browser = this.parseBrowser(userAgent);
		stats.userAgents[browser] = (stats.userAgents[browser] || 0) + 1;

		// 更新地理位置统计（从Cloudflare请求中获取）
		const country = request.cf?.country as string;
		if (country) {
			stats.countries[country] = (stats.countries[country] || 0) + 1;
		}

		await c.env.KV.put(statsKey, JSON.stringify(stats));
	}

	private parseUserAgent(userAgent: string): string {
		if (/Mobile|Android|iPhone|iPad/.test(userAgent)) return 'Mobile';
		if (/Tablet/.test(userAgent)) return 'Tablet';
		return 'Desktop';
	}

	private parseBrowser(userAgent: string): string {
		if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) return 'Chrome';
		if (/Firefox/.test(userAgent)) return 'Firefox';
		if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'Safari';
		if (/Edge/.test(userAgent)) return 'Edge';
		if (/Opera/.test(userAgent)) return 'Opera';
		return 'Other';
	}
}