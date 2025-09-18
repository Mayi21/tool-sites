import type { Env, UrlRecord, UrlStats } from "../types";
import { Context } from "hono";

export class UrlRedirect {
	async handle(c: Context<{ Bindings: Env }>) {
		try {
			const shortCode = c.req.param('shortCode');

			if (!shortCode) {
				return c.html(`
					<!DOCTYPE html>
					<html>
					<head>
						<title>Invalid Link</title>
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
							<h1>❌ Invalid Link</h1>
							<p>The link format is invalid.</p>
							<a href="${c.env.FRONTEND_DOMAIN || 'https://toolifyhub.top'}" class="button">Go to Homepage</a>
						</div>
					</body>
					</html>
				`, 400);
			}

			const record = await c.env.KV.get(shortCode);

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

			// 检查是否需要密码验证
			if (data.password) {
				console.log('Password protection enabled for', shortCode, 'stored password:', data.password);
				const submittedPassword = c.req.query('password');
				console.log('Submitted password:', submittedPassword);

				// 如果没有提供密码或密码错误，显示密码输入页面
				if (!submittedPassword || submittedPassword !== data.password) {
					console.log('Password check failed, showing password page');
					return this.showPasswordPage(c, shortCode, submittedPassword !== undefined);
				}
				console.log('Password check passed, proceeding to redirect');
			} else {
				console.log('No password protection for', shortCode);
			}

			// 更新访问统计（异步执行，不阻塞重定向）
			c.executionCtx?.waitUntil(this.updateStats(c, shortCode, data, c.req));

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
		const referrer = request.headers?.get('Referer') || null;
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
		const userAgent = request.headers?.get('User-Agent') || '';
		const device = this.parseUserAgent(userAgent);
		stats.devices[device] = (stats.devices[device] || 0) + 1;

		// 简化的浏览器检测
		const browser = this.parseBrowser(userAgent);
		stats.userAgents[browser] = (stats.userAgents[browser] || 0) + 1;

		// 更新地理位置统计（从Cloudflare请求中获取）
		const country = (request as any).cf?.country as string;
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

	private showPasswordPage(c: Context<{ Bindings: Env }>, shortCode: string, wrongPassword = false) {
		const currentUrl = c.req.url;
		const baseUrl = new URL(currentUrl).origin;
		const errorMessage = wrongPassword ? '<p style="color: #e74c3c; margin: 10px 0;">密码错误，请重试</p>' : '';

		return c.html(`
			<!DOCTYPE html>
			<html>
			<head>
				<title>密码保护 - 短链接</title>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<style>
					* { box-sizing: border-box; margin: 0; padding: 0; }
					body {
						font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
						background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
						min-height: 100vh;
						display: flex;
						align-items: center;
						justify-content: center;
						padding: 20px;
					}
					.container {
						background: white;
						max-width: 400px;
						width: 100%;
						border-radius: 12px;
						box-shadow: 0 10px 30px rgba(0,0,0,0.2);
						padding: 40px 30px;
						text-align: center;
					}
					.lock-icon {
						font-size: 48px;
						margin-bottom: 20px;
						color: #667eea;
					}
					h1 {
						color: #333;
						margin-bottom: 10px;
						font-size: 24px;
						font-weight: 600;
					}
					.description {
						color: #666;
						margin-bottom: 30px;
						line-height: 1.5;
					}
					.form-group {
						margin-bottom: 20px;
						text-align: left;
					}
					label {
						display: block;
						margin-bottom: 8px;
						color: #555;
						font-weight: 500;
					}
					input[type="password"] {
						width: 100%;
						padding: 12px;
						border: 2px solid #e1e5e9;
						border-radius: 8px;
						font-size: 16px;
						transition: border-color 0.3s ease;
					}
					input[type="password"]:focus {
						outline: none;
						border-color: #667eea;
					}
					.submit-btn {
						width: 100%;
						background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
						color: white;
						border: none;
						padding: 12px;
						border-radius: 8px;
						font-size: 16px;
						font-weight: 600;
						cursor: pointer;
						transition: transform 0.2s ease;
					}
					.submit-btn:hover {
						transform: translateY(-2px);
					}
					.home-link {
						display: inline-block;
						margin-top: 20px;
						color: #667eea;
						text-decoration: none;
						font-size: 14px;
					}
					.home-link:hover {
						text-decoration: underline;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="lock-icon">🔒</div>
					<h1>密码保护</h1>
					<p class="description">此链接受密码保护，请输入密码继续访问</p>
					${errorMessage}
					<form method="GET" action="${baseUrl}/${shortCode}">
						<div class="form-group">
							<label for="password">密码</label>
							<input type="password" id="password" name="password" placeholder="请输入访问密码" required autofocus>
						</div>
						<button type="submit" class="submit-btn">访问链接</button>
					</form>
					<a href="${c.env.FRONTEND_DOMAIN || 'https://toolifyhub.top'}" class="home-link">返回主页</a>
				</div>
			</body>
			</html>
		`, 200);
	}
}