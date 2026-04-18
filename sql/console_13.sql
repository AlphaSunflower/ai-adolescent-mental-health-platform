-- ============================================================
-- 小爱倾听师核心服务 - 数据库脚本
-- 执行前请备份数据库！
-- ============================================================

-- -------------------------------------------------------
-- 1. 修改 user 表：新增会员相关字段
-- -------------------------------------------------------
ALTER TABLE xinyuzhilian.user
ADD COLUMN member_type TINYINT(1) DEFAULT 0 COMMENT '会员类型(0-非会员,1-VIP,2-SVIP)' AFTER wx_gzh_id;

ALTER TABLE xinyuzhilian.user
ADD COLUMN member_expire_date DATETIME COMMENT '会员过期时间' AFTER member_type;

-- -------------------------------------------------------
-- 2. 新建 xiaoai_usage_stat 表（独立时长统计表）
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS xinyuzhilian.xiaoai_usage_stat (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id         BIGINT NOT NULL COMMENT '用户ID',
    total_seconds   INT DEFAULT 0 COMMENT '今日已使用秒数',
    last_date       DATE COMMENT '最后使用日期(用于每日重置)',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_id (user_id),
    INDEX idx_last_date (last_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='小爱倾听-每日使用时长统计表';

-- -------------------------------------------------------
-- 3. 新建 ai_xiaoai_session 表（会话记录表）
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS xinyuzhilian.ai_xiaoai_session (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id         BIGINT NOT NULL COMMENT '用户ID',
    start_time      DATETIME NOT NULL COMMENT '会话开始时间',
    end_time        DATETIME COMMENT '会话结束时间',
    total_seconds   INT DEFAULT 0 COMMENT '本次会话总时长(秒)',
    end_reason      VARCHAR(32) COMMENT '结束原因: timeout/manual/error/expired',
    status          TINYINT DEFAULT 1 COMMENT '状态: 1-进行中, 0-已结束',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_start_time (start_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='小爱倾听-会话记录表';

-- -------------------------------------------------------
-- 4. 新建 ai_xiaoai_message 表（对话内容记录表）
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS xinyuzhilian.ai_xiaoai_message (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    session_id      BIGINT NOT NULL COMMENT '会话ID(ai_xiaoai_session.id)',
    role            VARCHAR(20) NOT NULL COMMENT '角色: user/assistant',
    content         TEXT COMMENT '文本内容',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_session_id (session_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='小爱倾听-对话消息记录表';

-- -------------------------------------------------------
-- 5. 验证脚本（可选）
-- -------------------------------------------------------
-- SELECT
--     u.id,
--     u.username,
--     u.member_type,
--     u.member_expire_date,
--     s.total_seconds,
--     s.last_date
-- FROM xinyuzhilian.user u
-- LEFT JOIN xinyuzhilian.xiaoai_usage_stat s ON u.id = s.user_id
-- LIMIT 10;
