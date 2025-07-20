import { DateTime, Str, Num, Bool } from "chanfana";
import { z } from "zod";

// 访问记录数据表结构
export const VisitRecord = z.object({
  // 主键
  id: Str({ description: "唯一标识符" }),
  
  // 会话信息
  sessionId: Str({ description: "会话ID" }),
  
  // 页面信息
  pagePath: Str({ description: "页面路径" }),
  pageName: Str({ description: "页面名称" }),
  
  // 用户信息
  ip: Str({ description: "IP地址" }),
  userAgent: Str({ description: "用户代理" }),
  
  // 地理位置信息
  country: Str({ description: "国家", required: false }),
  region: Str({ description: "地区/省份", required: false }),
  city: Str({ description: "城市", required: false }),
  latitude: Num({ description: "纬度", required: false }),
  longitude: Num({ description: "经度", required: false }),
  
  // 设备信息
  browser: Str({ description: "浏览器名称" }),
  browserVersion: Str({ description: "浏览器版本", required: false }),
  os: Str({ description: "操作系统", required: false }),
  osVersion: Str({ description: "操作系统版本", required: false }),
  isMobile: Bool({ description: "是否移动设备" }),
  isTablet: Bool({ description: "是否平板设备" }),
  isDesktop: Bool({ description: "是否桌面设备" }),
  
  // 工具使用信息
  tool: Str({ description: "使用的工具", required: false }),
  toolAction: Str({ description: "工具操作", required: false }),
  
  // 时间信息
  timestamp: DateTime({ description: "访问时间" }),
  startTime: Num({ description: "开始时间戳" }),
  endTime: Num({ description: "结束时间戳", required: false }),
  duration: Num({ description: "停留时长(秒)", required: false }),
  
  // 状态信息
  status: Str({ description: "访问状态", example: "active|completed|error" }),
  errorMessage: Str({ description: "错误信息", required: false }),
  
  // 性能信息
  loadTime: Num({ description: "页面加载时间(ms)", required: false }),
  responseTime: Num({ description: "响应时间(ms)", required: false }),
  
  // 引用信息
  referrer: Str({ description: "来源页面", required: false }),
  utmSource: Str({ description: "UTM来源", required: false }),
  utmMedium: Str({ description: "UTM媒介", required: false }),
  utmCampaign: Str({ description: "UTM活动", required: false }),
  
  // 元数据
  metadata: z.record(z.any()).optional(),
  
  // 创建和更新时间
  createdAt: DateTime({ description: "创建时间" }),
  updatedAt: DateTime({ description: "更新时间" })
});

// 访问统计类型
export const VisitStats = z.object({
  totalVisits: Num({ description: "总访问量" }),
  todayVisits: Num({ description: "今日访问量" }),
  weekVisits: Num({ description: "本周访问量" }),
  monthVisits: Num({ description: "本月访问量" }),
  uniqueVisitors: Num({ description: "独立访客数" }),
  uniqueIPs: Num({ description: "独立IP数" }),
  countries: Num({ description: "覆盖国家数" }),
  averageSessionDuration: Num({ description: "平均会话时长(秒)" }),
  bounceRate: Num({ description: "跳出率" }),
  topTools: z.array(z.object({
    tool: Str(),
    count: Num()
  })),
  topCountries: z.array(z.object({
    country: Str(),
    count: Num()
  })),
  topBrowsers: z.array(z.object({
    browser: Str(),
    count: Num()
  }))
});

// 工具使用记录类型
export const ToolUsage = z.object({
  id: Str({ description: "唯一标识符" }),
  sessionId: Str({ description: "会话ID" }),
  tool: Str({ description: "工具名称" }),
  action: Str({ description: "操作类型", example: "view|use|export|share" }),
  inputData: Str({ description: "输入数据", required: false }),
  outputData: Str({ description: "输出数据", required: false }),
  processingTime: Num({ description: "处理时间(ms)", required: false }),
  success: Bool({ description: "是否成功" }),
  errorMessage: Str({ description: "错误信息", required: false }),
  timestamp: DateTime({ description: "使用时间" }),
  ip: Str({ description: "IP地址" }),
  userAgent: Str({ description: "用户代理" })
});

// 会话记录类型
export const SessionRecord = z.object({
  id: Str({ description: "会话ID" }),
  startTime: DateTime({ description: "开始时间" }),
  endTime: DateTime({ description: "结束时间", required: false }),
  duration: Num({ description: "会话时长(秒)", required: false }),
  pageViews: Num({ description: "页面浏览量" }),
  toolUsage: Num({ description: "工具使用次数" }),
  ip: Str({ description: "IP地址" }),
  country: Str({ description: "国家", required: false }),
  city: Str({ description: "城市", required: false }),
  browser: Str({ description: "浏览器" }),
  isMobile: Bool({ description: "是否移动设备" }),
  referrer: Str({ description: "来源页面", required: false }),
  status: Str({ description: "会话状态", example: "active|completed|expired" })
});

// 导出类型
export type VisitRecordType = z.infer<typeof VisitRecord>;
export type VisitStatsType = z.infer<typeof VisitStats>;
export type ToolUsageType = z.infer<typeof ToolUsage>;
export type SessionRecordType = z.infer<typeof SessionRecord>; 