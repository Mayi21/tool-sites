import { D1Database } from '@cloudflare/workers-types';
import { VisitRecord, VisitStats, ToolUsage, SessionRecord, VisitRecordType, VisitStatsType, ToolUsageType, SessionRecordType } from '../types/analytics';

export class AnalyticsService {
  constructor(private db: D1Database) {}

  // 生成唯一ID
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 记录页面访问
  async recordPageVisit(visitData: Partial<VisitRecordType>): Promise<string> {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    const record: VisitRecordType = {
      id,
      sessionId: visitData.sessionId || this.generateId(),
      pagePath: visitData.pagePath || '',
      pageName: visitData.pageName || '',
      ip: visitData.ip || '',
      userAgent: visitData.userAgent || '',
      country: visitData.country,
      region: visitData.region,
      city: visitData.city,
      latitude: visitData.latitude,
      longitude: visitData.longitude,
      browser: visitData.browser || '',
      browserVersion: visitData.browserVersion,
      os: visitData.os,
      osVersion: visitData.osVersion,
      isMobile: visitData.isMobile || false,
      isTablet: visitData.isTablet || false,
      isDesktop: visitData.isDesktop || true,
      tool: visitData.tool,
      toolAction: visitData.toolAction,
      timestamp: visitData.timestamp || now,
      startTime: visitData.startTime || Date.now(),
      endTime: visitData.endTime,
      duration: visitData.duration,
      status: visitData.status || 'active',
      errorMessage: visitData.errorMessage,
      loadTime: visitData.loadTime,
      responseTime: visitData.responseTime,
      referrer: visitData.referrer,
      utmSource: visitData.utmSource,
      utmMedium: visitData.utmMedium,
      utmCampaign: visitData.utmCampaign,
      metadata: visitData.metadata,
      createdAt: now,
      updatedAt: now
    };

    const stmt = this.db.prepare(`
      INSERT INTO visit_records (
        id, session_id, page_path, page_name, ip, user_agent,
        country, region, city, latitude, longitude,
        browser, browser_version, os, os_version,
        is_mobile, is_tablet, is_desktop,
        tool, tool_action,
        timestamp, start_time, end_time, duration,
        status, error_message,
        load_time, response_time,
        referrer, utm_source, utm_medium, utm_campaign,
        metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt.bind(
      record.id, record.sessionId, record.pagePath, record.pageName, record.ip, record.userAgent,
      record.country, record.region, record.city, record.latitude, record.longitude,
      record.browser, record.browserVersion, record.os, record.osVersion,
      record.isMobile, record.isTablet, record.isDesktop,
      record.tool, record.toolAction,
      record.timestamp, record.startTime, record.endTime, record.duration,
      record.status, record.errorMessage,
      record.loadTime, record.responseTime,
      record.referrer, record.utmSource, record.utmMedium, record.utmCampaign,
      record.metadata ? JSON.stringify(record.metadata) : null,
      record.createdAt, record.updatedAt
    ).run();

    return id;
  }

  // 记录工具使用
  async recordToolUsage(toolData: Partial<ToolUsageType>): Promise<string> {
    const id = this.generateId();
    const now = new Date().toISOString();

    const record: ToolUsageType = {
      id,
      sessionId: toolData.sessionId || this.generateId(),
      tool: toolData.tool || '',
      action: toolData.action || 'use',
      inputData: toolData.inputData,
      outputData: toolData.outputData,
      processingTime: toolData.processingTime,
      success: toolData.success !== undefined ? toolData.success : true,
      errorMessage: toolData.errorMessage,
      timestamp: toolData.timestamp || now,
      ip: toolData.ip || '',
      userAgent: toolData.userAgent || ''
    };

    const stmt = this.db.prepare(`
      INSERT INTO tool_usage_records (
        id, session_id, tool, action, input_data, output_data,
        processing_time, success, error_message, timestamp, ip, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt.bind(
      record.id, record.sessionId, record.tool, record.action,
      record.inputData, record.outputData, record.processingTime,
      record.success, record.errorMessage, record.timestamp,
      record.ip, record.userAgent, now
    ).run();

    return id;
  }

  // 记录管理员操作
  async recordAdminAction(adminData: {
    adminUsername: string;
    action: string;
    details?: any;
    ip: string;
    userAgent: string;
  }): Promise<string> {
    const id = this.generateId();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO admin_logs (
        id, admin_username, action, details, ip, user_agent, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt.bind(
      id, adminData.adminUsername, adminData.action,
      adminData.details ? JSON.stringify(adminData.details) : null,
      adminData.ip, adminData.userAgent, now
    ).run();

    return id;
  }

  // 获取访问统计
  async getVisitStats(dateRange: { start: string; end: string }): Promise<VisitStatsType> {
    // 获取基础统计
    const basicStats = await this.db.prepare(`
      SELECT 
        COUNT(*) as total_visits,
        COUNT(DISTINCT ip) as unique_ips,
        COUNT(DISTINCT country) as countries,
        AVG(duration) as avg_duration
      FROM visit_records 
      WHERE timestamp BETWEEN ? AND ? AND status = 'completed'
    `).bind(dateRange.start, dateRange.end).first();

    // 获取今日访问
    const today = new Date().toISOString().split('T')[0];
    const todayStats = await this.db.prepare(`
      SELECT COUNT(*) as today_visits
      FROM visit_records 
      WHERE DATE(timestamp) = ? AND status = 'completed'
    `).bind(today).first();

    // 获取本周访问
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStats = await this.db.prepare(`
      SELECT COUNT(*) as week_visits
      FROM visit_records 
      WHERE timestamp >= ? AND status = 'completed'
    `).bind(weekStart.toISOString()).first();

    // 获取本月访问
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStats = await this.db.prepare(`
      SELECT COUNT(*) as month_visits
      FROM visit_records 
      WHERE timestamp >= ? AND status = 'completed'
    `).bind(monthStart.toISOString()).first();

    // 获取热门工具
    const topTools = await this.db.prepare(`
      SELECT tool, COUNT(*) as count
      FROM tool_usage_records
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY tool
      ORDER BY count DESC
      LIMIT 10
    `).bind(dateRange.start, dateRange.end).all();

    // 获取热门国家
    const topCountries = await this.db.prepare(`
      SELECT country, COUNT(*) as count
      FROM visit_records
      WHERE timestamp BETWEEN ? AND ? AND country IS NOT NULL
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `).bind(dateRange.start, dateRange.end).all();

    // 获取热门浏览器
    const topBrowsers = await this.db.prepare(`
      SELECT browser, COUNT(*) as count
      FROM visit_records
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 10
    `).bind(dateRange.start, dateRange.end).all();

    return {
      totalVisits: Number(basicStats?.total_visits) || 0,
      todayVisits: Number(todayStats?.today_visits) || 0,
      weekVisits: Number(weekStats?.week_visits) || 0,
      monthVisits: Number(monthStats?.month_visits) || 0,
      uniqueVisitors: Number(basicStats?.unique_ips) || 0,
      uniqueIPs: Number(basicStats?.unique_ips) || 0,
      countries: Number(basicStats?.countries) || 0,
      averageSessionDuration: Number(basicStats?.avg_duration) || 0,
      bounceRate: 0, // 需要计算跳出率
      topTools: topTools.results?.map(item => ({
        tool: String(item.tool || ''),
        count: Number(item.count) || 0
      })) || [],
      topCountries: topCountries.results?.map(item => ({
        country: String(item.country || ''),
        count: Number(item.count) || 0
      })) || [],
      topBrowsers: topBrowsers.results?.map(item => ({
        browser: String(item.browser || ''),
        count: Number(item.count) || 0
      })) || []
    };
  }

  // 获取访问记录列表
  async getVisitRecords(options: {
    page?: number;
    limit?: number;
    country?: string;
    tool?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ records: VisitRecordType[]; total: number }> {
    const { page = 0, limit = 20, country, tool, startDate, endDate } = options;
    const offset = page * limit;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (country) {
      whereClause += " AND country = ?";
      params.push(country);
    }

    if (tool) {
      whereClause += " AND tool = ?";
      params.push(tool);
    }

    if (startDate) {
      whereClause += " AND timestamp >= ?";
      params.push(startDate);
    }

    if (endDate) {
      whereClause += " AND timestamp <= ?";
      params.push(endDate);
    }

    // 获取总数
    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total
      FROM visit_records
      ${whereClause}
    `);
    const countResult = await countStmt.bind(...params).first();
    const total = Number(countResult?.total) || 0;

    // 获取记录
    const recordsStmt = this.db.prepare(`
      SELECT *
      FROM visit_records
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `);
    const recordsResult = await recordsStmt.bind(...params, limit, offset).all();

    const records = recordsResult.results?.map(row => ({
      id: String(row.id || ''),
      sessionId: String(row.session_id || ''),
      pagePath: String(row.page_path || ''),
      pageName: String(row.page_name || ''),
      ip: String(row.ip || ''),
      userAgent: String(row.user_agent || ''),
      country: row.country ? String(row.country) : undefined,
      region: row.region ? String(row.region) : undefined,
      city: row.city ? String(row.city) : undefined,
      latitude: row.latitude ? Number(row.latitude) : undefined,
      longitude: row.longitude ? Number(row.longitude) : undefined,
      browser: String(row.browser || ''),
      browserVersion: row.browser_version ? String(row.browser_version) : undefined,
      os: row.os ? String(row.os) : undefined,
      osVersion: row.os_version ? String(row.os_version) : undefined,
      isMobile: Boolean(row.is_mobile),
      isTablet: Boolean(row.is_tablet),
      isDesktop: Boolean(row.is_desktop),
      tool: row.tool ? String(row.tool) : undefined,
      toolAction: row.tool_action ? String(row.tool_action) : undefined,
      timestamp: String(row.timestamp || ''),
      startTime: Number(row.start_time || 0),
      endTime: row.end_time ? Number(row.end_time) : undefined,
      duration: row.duration ? Number(row.duration) : undefined,
      status: String(row.status || ''),
      errorMessage: row.error_message ? String(row.error_message) : undefined,
      loadTime: row.load_time ? Number(row.load_time) : undefined,
      responseTime: row.response_time ? Number(row.response_time) : undefined,
      referrer: row.referrer ? String(row.referrer) : undefined,
      utmSource: row.utm_source ? String(row.utm_source) : undefined,
      utmMedium: row.utm_medium ? String(row.utm_medium) : undefined,
      utmCampaign: row.utm_campaign ? String(row.utm_campaign) : undefined,
      metadata: row.metadata ? JSON.parse(String(row.metadata)) : undefined,
      createdAt: String(row.created_at || ''),
      updatedAt: String(row.updated_at || '')
    })) || [];

    return { records, total };
  }

  // 更新访问记录（结束访问）
  async endPageVisit(visitId: string, endTime: number, duration: number): Promise<void> {
    await this.db.prepare(`
      UPDATE visit_records
      SET end_time = ?, duration = ?, status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(endTime, duration, visitId).run();
  }

  // 清理旧数据
  async cleanupOldData(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await this.db.prepare(`
      DELETE FROM visit_records
      WHERE timestamp < ?
    `).bind(cutoffDate.toISOString()).run();

    await this.db.prepare(`
      DELETE FROM tool_usage_records
      WHERE timestamp < ?
    `).bind(cutoffDate.toISOString()).run();

    await this.db.prepare(`
      DELETE FROM admin_logs
      WHERE timestamp < ?
    `).bind(cutoffDate.toISOString()).run();
  }
} 