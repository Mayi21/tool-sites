import { Bool, OpenAPIRoute, Num } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { AnalyticsService } from "../services/analyticsService";

export class AnalyticsGetStats extends OpenAPIRoute {
  schema = {
    tags: ["Analytics"],
    summary: "Get visit statistics",
    request: {
      query: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional()
      })
    },
    responses: {
      "200": {
        description: "Visit statistics",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                totalVisits: Num(),
                todayVisits: Num(),
                weekVisits: Num(),
                monthVisits: Num(),
                uniqueVisitors: Num(),
                uniqueIPs: Num(),
                countries: Num(),
                averageSessionDuration: Num(),
                bounceRate: Num(),
                topTools: z.array(z.object({
                  tool: z.string(),
                  count: Num()
                })),
                topCountries: z.array(z.object({
                  country: z.string(),
                  count: Num()
                })),
                topBrowsers: z.array(z.object({
                  browser: z.string(),
                  count: Num()
                }))
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
      // 默认查询最近30天
      const endDate = data.query.endDate || new Date().toISOString();
      const startDate = data.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const stats = await analyticsService.getVisitStats({
        start: startDate,
        end: endDate
      });

      return {
        success: true,
        result: stats
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return Response.json(
        {
          success: false,
          error: "Failed to get statistics"
        },
        { status: 500 }
      );
    }
  }
} 