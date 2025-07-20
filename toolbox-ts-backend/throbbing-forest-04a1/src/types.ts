import { DateTime, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

// 环境变量类型定义
export interface Env {
  DB: D1Database;
}

export type AppContext = Context<{ Bindings: Env }>;

export const Task = z.object({
	name: Str({ example: "lorem" }),
	slug: Str(),
	description: Str({ required: false }),
	completed: z.boolean().default(false),
	due_date: DateTime(),
});
