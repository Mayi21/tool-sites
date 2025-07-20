import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { AnalyticsService } from "../services/analyticsService";

export class AnalyticsToolUsage extends OpenAPIRoute {
  schema = {
    tags: ["Analytics"],
    summary: "Record tool usage",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              sessionId: z.string().optional(),
              tool: z.string(),
              action: z.string().default('use'),
              inputData: z.string().optional(),
              outputData: z.string().optional(),
              processingTime: z.number().optional(),
              success: z.boolean().default(true),
              errorMessage: z.string().optional(),
              ip: z.string().optional(),
              userAgent: z.string().optional()
            })
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Tool usage recorded successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                usageId: z.string()
              })
            })
          }
        }
      }
    }
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const analyticsService = new AnalyticsService(c.env.DB);

    try {
      // 获取客户端IP
      const clientIP = c.req.header('CF-Connecting-IP') || 
                      c.req.header('X-Forwarded-For') || 
                      c.req.header('X-Real-IP') || 
                      'unknown';

      // 获取用户代理
      const userAgent = c.req.header('User-Agent') || 'unknown';

      const toolData = {
        ...data.body,
        ip: data.body.ip || clientIP,
        userAgent: data.body.userAgent || userAgent
      };

      const usageId = await analyticsService.recordToolUsage(toolData);

      return {
        success: true,
        result: {
          usageId
        }
      };
    } catch (error) {
      console.error('Failed to record tool usage:', error);
      return Response.json(
        {
          success: false,
          error: "Failed to record tool usage"
        },
        { status: 500 }
      );
    }
  }
} 