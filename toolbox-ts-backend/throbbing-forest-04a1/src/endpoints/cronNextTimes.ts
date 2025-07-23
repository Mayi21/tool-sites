import { OpenAPIRoute, Str } from 'chanfana';
import { z } from 'zod';
import { type AppContext } from '../types';
import cronParser from 'cron-parser';

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
              type: z.enum(['auto', 'linux', 'spring']).default('auto'),
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
    let { expr, type, count } = data.body;
    function detectType(expr: string) {
      const parts = expr.trim().split(/\s+/);
      if (parts.length === 5) return 'linux';
      if (parts.length === 6) return 'spring';
      return 'unknown';
    }
    if (type === 'auto') type = detectType(expr) as typeof type;
    if (type === 'unknown') {
      return { success: false, times: [], error: 'Unrecognized expression type (only 5 or 6 fields supported)' };
    }
    if (type === 'linux') {
      expr = '0 ' + expr;
    }
    try {
      const interval = (cronParser as any).parseExpression(expr);
      const times: string[] = [];
      for (let i = 0; i < count; i++) {
        times.push(interval.next().toISOString());
      }
      return { success: true, times };
    } catch (e: any) {
      return { success: false, times: [], error: 'Failed to parse: ' + e.message };
    }
  }
} 