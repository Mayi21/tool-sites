import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";

export class AnalyticsGetLocation extends OpenAPIRoute {
  schema = {
    tags: ["Analytics"],
    summary: "获取IP地理位置信息",
    description: "通过IP地址获取地理位置信息，作为前端的地理位置服务代理",
    request: {
      query: z.object({
        ip: z.string().describe("IP地址")
      })
    },
    responses: {
      "200": {
        description: "地理位置信息获取成功",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                country: z.string(),
                city: z.string(),
                region: z.string(),
                latitude: z.number().optional(),
                longitude: z.number().optional()
              })
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
      }
    }
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const { ip } = data.query;

    try {
      // 验证IP地址格式
      if (!this.isValidIP(ip)) {
        return Response.json(
          {
            success: false,
            error: "Invalid IP address format"
          },
          { status: 400 }
        );
      }

      // 尝试从多个服务获取地理位置信息
      const locationData = await this.getLocationFromServices(ip);

      return {
        success: true,
        result: locationData
      };
    } catch (error) {
      console.error('Failed to get location info:', error);
      return Response.json(
        {
          success: false,
          error: "Failed to get location information"
        },
        { status: 500 }
      );
    }
  }

  // 验证IP地址格式
  isValidIP(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  // 从多个服务获取地理位置信息
  async getLocationFromServices(ip: string) {
    const services = [
      `https://ipapi.co/${ip}/json/`,
      `https://ip-api.com/json/${ip}`,
      `https://httpbin.org/ip`
    ];

    for (const service of services) {
      try {
        const response = await fetch(service, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Toolbox-Analytics/1.0'
          },
          signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) continue;

        const data = await response.json();
        
        // 解析不同服务的数据格式
        const locationData = this.parseLocationData(data, service);
        if (locationData) {
          return locationData;
        }
      } catch (error) {
        console.warn(`Failed to get location from ${service}:`, error);
        continue;
      }
    }

    // 如果所有服务都失败，返回默认数据
    return this.getDefaultLocation();
  }

  // 解析不同服务的地理位置数据
  parseLocationData(data: any, service: string) {
    if (service.includes('ipapi.co')) {
      return {
        country: data.country_name || data.country || 'Unknown',
        city: data.city || 'Unknown',
        region: data.region || data.region_name || 'Unknown',
        latitude: data.latitude,
        longitude: data.longitude
      };
    } else if (service.includes('ip-api.com')) {
      return {
        country: data.country || 'Unknown',
        city: data.city || 'Unknown',
        region: data.regionName || 'Unknown',
        latitude: data.lat,
        longitude: data.lon
      };
    }
    
    return null;
  }

  // 获取默认地理位置数据
  getDefaultLocation() {
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown'
    };
  }
} 