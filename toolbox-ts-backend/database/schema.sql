-- 访问记录数据库表结构
-- 适用于 Cloudflare D1 数据库

-- 1. 访问记录主表
CREATE TABLE IF NOT EXISTS visit_records (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    page_path TEXT NOT NULL,
    page_name TEXT NOT NULL,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    
    -- 地理位置信息
    country TEXT,
    region TEXT,
    city TEXT,
    latitude REAL,
    longitude REAL,
    
    -- 设备信息
    browser TEXT NOT NULL,
    browser_version TEXT,
    os TEXT,
    os_version TEXT,
    is_mobile BOOLEAN NOT NULL DEFAULT FALSE,
    is_tablet BOOLEAN NOT NULL DEFAULT FALSE,
    is_desktop BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- 工具使用信息
    tool TEXT,
    tool_action TEXT,
    
    -- 时间信息
    timestamp DATETIME NOT NULL,
    start_time INTEGER NOT NULL,
    end_time INTEGER,
    duration INTEGER,
    
    -- 状态信息
    status TEXT NOT NULL DEFAULT 'active',
    error_message TEXT,
    
    -- 性能信息
    load_time INTEGER,
    response_time INTEGER,
    
    -- 引用信息
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- 元数据
    metadata TEXT, -- JSON格式
    
    -- 创建和更新时间
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. 会话记录表
CREATE TABLE IF NOT EXISTS session_records (
    id TEXT PRIMARY KEY,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration INTEGER,
    page_views INTEGER NOT NULL DEFAULT 0,
    tool_usage INTEGER NOT NULL DEFAULT 0,
    ip TEXT NOT NULL,
    country TEXT,
    city TEXT,
    browser TEXT NOT NULL,
    is_mobile BOOLEAN NOT NULL DEFAULT FALSE,
    referrer TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. 工具使用记录表
CREATE TABLE IF NOT EXISTS tool_usage_records (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    tool TEXT NOT NULL,
    action TEXT NOT NULL,
    input_data TEXT,
    output_data TEXT,
    processing_time INTEGER,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT,
    timestamp DATETIME NOT NULL,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. 管理员操作日志表
CREATE TABLE IF NOT EXISTS admin_logs (
    id TEXT PRIMARY KEY,
    admin_username TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT, -- JSON格式
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. 访问统计汇总表（用于缓存）
CREATE TABLE IF NOT EXISTS visit_stats_cache (
    id TEXT PRIMARY KEY,
    stat_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    stat_date TEXT NOT NULL,
    total_visits INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    unique_ips INTEGER NOT NULL DEFAULT 0,
    countries INTEGER NOT NULL DEFAULT 0,
    average_duration REAL NOT NULL DEFAULT 0,
    bounce_rate REAL NOT NULL DEFAULT 0,
    top_tools TEXT, -- JSON格式
    top_countries TEXT, -- JSON格式
    top_browsers TEXT, -- JSON格式
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stat_type, stat_date)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_visit_records_session_id ON visit_records(session_id);
CREATE INDEX IF NOT EXISTS idx_visit_records_timestamp ON visit_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_visit_records_ip ON visit_records(ip);
CREATE INDEX IF NOT EXISTS idx_visit_records_country ON visit_records(country);
CREATE INDEX IF NOT EXISTS idx_visit_records_tool ON visit_records(tool);
CREATE INDEX IF NOT EXISTS idx_visit_records_status ON visit_records(status);

CREATE INDEX IF NOT EXISTS idx_session_records_start_time ON session_records(start_time);
CREATE INDEX IF NOT EXISTS idx_session_records_ip ON session_records(ip);
CREATE INDEX IF NOT EXISTS idx_session_records_status ON session_records(status);

CREATE INDEX IF NOT EXISTS idx_tool_usage_session_id ON tool_usage_records(session_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_tool ON tool_usage_records(tool);
CREATE INDEX IF NOT EXISTS idx_tool_usage_timestamp ON tool_usage_records(timestamp);

CREATE INDEX IF NOT EXISTS idx_admin_logs_username ON admin_logs(admin_username);
CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON admin_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);

CREATE INDEX IF NOT EXISTS idx_stats_cache_type_date ON visit_stats_cache(stat_type, stat_date);

-- 创建视图用于常用查询
CREATE VIEW IF NOT EXISTS daily_visit_summary AS
SELECT 
    DATE(timestamp) as visit_date,
    COUNT(*) as total_visits,
    COUNT(DISTINCT ip) as unique_visitors,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(duration) as avg_duration,
    COUNT(DISTINCT country) as countries_visited
FROM visit_records 
WHERE status = 'completed'
GROUP BY DATE(timestamp)
ORDER BY visit_date DESC;

CREATE VIEW IF NOT EXISTS tool_usage_summary AS
SELECT 
    tool,
    COUNT(*) as usage_count,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(processing_time) as avg_processing_time,
    COUNT(CASE WHEN success = 1 THEN 1 END) as success_count,
    COUNT(CASE WHEN success = 0 THEN 1 END) as error_count
FROM tool_usage_records
GROUP BY tool
ORDER BY usage_count DESC;

CREATE VIEW IF NOT EXISTS country_visit_summary AS
SELECT 
    country,
    COUNT(*) as visit_count,
    COUNT(DISTINCT ip) as unique_visitors,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(duration) as avg_duration
FROM visit_records 
WHERE country IS NOT NULL AND status = 'completed'
GROUP BY country
ORDER BY visit_count DESC;

-- 创建触发器用于自动更新时间戳
CREATE TRIGGER IF NOT EXISTS update_visit_records_timestamp 
    AFTER UPDATE ON visit_records
    FOR EACH ROW
    BEGIN
        UPDATE visit_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_session_records_timestamp 
    AFTER UPDATE ON session_records
    FOR EACH ROW
    BEGIN
        UPDATE session_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_stats_cache_timestamp 
    AFTER UPDATE ON visit_stats_cache
    FOR EACH ROW
    BEGIN
        UPDATE visit_stats_cache SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END; 