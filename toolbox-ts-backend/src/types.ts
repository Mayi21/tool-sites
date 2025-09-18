import { DateTime, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

// 环境变量类型定义
export interface Env {
  DB: D1Database;
  KV: KVNamespace; // 添加KV存储绑定
  FRONTEND_DOMAIN?: string; // CORS允许的前端域名
  BACKEND_DOMAIN?: string; // 后端API域名
  SHORT_DOMAIN?: string; // 短链专用域名（可选）
}

export type AppContext = Context<{ Bindings: Env }>;

export const Task = z.object({
	name: Str({ example: "lorem" }),
	slug: Str(),
	description: Str({ required: false }),
	completed: z.boolean().default(false),
	due_date: DateTime(),
});

// 短链相关的Zod schemas
export const ShortenUrlRequest = z.object({
	url: Str({ example: "https://example.com/very/long/url" }),
	alias: Str({ required: false, example: "my-custom-link" }),
	expireTime: z.string().optional().nullable(),
	password: Str({ required: false, example: "mypassword123" }),
});

export const ShortenUrlBatchRequest = z.object({
	urls: z.array(Str()),
	expireTime: z.string().optional().nullable(),
});

export const ShortenUrlResponse = z.object({
	success: z.boolean(),
	data: z.object({
		originalUrl: Str(),
		shortUrl: Str(),
		shortCode: Str(),
		createdAt: z.number(),
		expireAt: z.number().nullable(),
		qrCode: Str(),
	}).optional(),
	error: Str().optional(),
});

export const ExpandUrlResponse = z.object({
	success: z.boolean(),
	data: z.object({
		originalUrl: Str(),
		shortCode: Str(),
		shortUrl: Str(),
		createdAt: z.number(),
		clicks: z.number(),
		lastAccessed: z.number().nullable(),
		expireAt: z.number().nullable(),
	}).optional(),
	error: Str().optional(),
});

// 短链记录类型
export interface UrlRecord {
	originalUrl: string;
	shortCode: string;
	createdAt: number;
	expireAt: number | null;
	clicks: number;
	lastAccessed: number | null;
	creator: string;
	userAgent: string;
	ip: string;
	password?: string; // 可选的密码保护
}

// 统计数据类型
export interface UrlStats {
	dailyClicks: Record<string, number>;
	referrers: Record<string, number>;
	userAgents: Record<string, number>;
	countries: Record<string, number>;
	devices: Record<string, number>;
}
