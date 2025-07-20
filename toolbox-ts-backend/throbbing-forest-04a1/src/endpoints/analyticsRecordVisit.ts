import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { AnalyticsService } from "../services/analyticsService";

export class AnalyticsRecordVisit extends OpenAPIRoute {
  schema = {
    tags: ["Analytics"],
    summary: "Record a page visit",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              sessionId: z.string().optional(),
              pagePath: z.string(),
              pageName: z.string(),
              ip: z.string().optional(),
              userAgent: z.string().optional(),
              country: z.string().optional(),
              region: z.string().optional(),
              city: z.string().optional(),
              latitude: z.number().optional(),
              longitude: z.number().optional(),
              browser: z.string().optional(),
              browserVersion: z.string().optional(),
              os: z.string().optional(),
              osVersion: z.string().optional(),
              isMobile: z.boolean().optional(),
              isTablet: z.boolean().optional(),
              isDesktop: z.boolean().optional(),
              tool: z.string().optional(),
              toolAction: z.string().optional(),
              referrer: z.string().optional(),
              utmSource: z.string().optional(),
              utmMedium: z.string().optional(),
              utmCampaign: z.string().optional(),
              metadata: z.record(z.any()).optional()
            })
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Visit recorded successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                visitId: z.string(),
                sessionId: z.string()
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

      const visitData = {
        ...data.body,
        ip: data.body.ip || clientIP,
        userAgent: data.body.userAgent || userAgent
      };

      const visitId = await analyticsService.recordPageVisit(visitData);

      return {
        success: true,
        result: {
          visitId,
          sessionId: visitData.sessionId || visitId
        }
      };
    } catch (error) {
      console.error('Failed to record visit:', error);
      return Response.json(
        {
          success: false,
          error: "Failed to record visit"
        },
        { status: 500 }
      );
    }
  }
} 