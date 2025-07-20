import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { AnalyticsService } from "../services/analyticsService";

export class AnalyticsEndVisit extends OpenAPIRoute {
  schema = {
    tags: ["Analytics"],
    summary: "结束页面访问记录",
    description: "更新访问记录的结束时间和持续时间",
    request: {
      params: z.object({
        visitId: z.string().describe("访问记录ID")
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              endTime: z.number().optional(),
              duration: z.number().optional()
            })
          }
        }
      }
    },
    responses: {
      "200": {
        description: "访问记录更新成功",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              message: z.string().optional()
            })
          }
        }
      },
      "400": {
        description: "请求参数错误",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              error: z.string()
            })
          }
        }
      },
      "404": {
        description: "访问记录不存在",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              error: z.string()
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
      const { visitId } = data.params;
      const { endTime, duration } = data.body;
      
      // 更新访问记录
      await analyticsService.endPageVisit(
        visitId, 
        endTime || Date.now(), 
        duration || 0
      );
      
      return {
        success: true,
        message: "访问记录已更新"
      };
      
    } catch (error) {
      console.error("Failed to end visit:", error);
      
      if (error instanceof Error && error.message.includes("not found")) {
        return Response.json(
          {
            success: false,
            error: "访问记录不存在"
          },
          { status: 404 }
        );
      }
      
      return Response.json(
        {
          success: false,
          error: "Failed to end visit"
        },
        { status: 400 }
      );
    }
  }
} 