import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { type AppContext } from '../types';

// Import cron-parser using require for version 5.x compatibility
const parser = require('cron-parser');

export class CronNextTimes extends OpenAPIRoute {
  schema = {
    tags: ['Tools'],
    summary: 'Get next N execution times for a cron expression',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              expr: z.string(),
              count: z.number().default(5)
            })
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Next N execution times',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              times: z.array(z.string()),
              error: z.string().optional()
            })
          }
        }
      }
    }
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    let { expr, count } = data.body;

    let processedExpr = expr.trim().replace(/\?/g, '*');
    const parts = processedExpr.split(/\s+/);

    if (parts.length === 5) {
        processedExpr = '0 ' + processedExpr;
    }

    const finalParts = processedExpr.split(/\s+/);
    if (finalParts.length < 6 || finalParts.length > 7) {
        return { success: false, times: [], error: 'Invalid expression format. Must be 5, 6, or 7 fields.' };
    }

    try {
      const interval = parser.default.parse(processedExpr);
      const times = [];
      for (let i = 0; i < count; i++) {
        times.push(interval.next().toISOString());
      }
      return { success: true, times: times };
    } catch (err: any) {
      return { success: false, times: [], error: err.message };
    }
  }
}
