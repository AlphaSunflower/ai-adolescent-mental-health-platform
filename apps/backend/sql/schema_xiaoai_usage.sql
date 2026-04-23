-- 小爱倾听时长管理表
-- 用于管理用户的每日使用时长和会员类型

-- 用户使用时长记录表
CREATE TABLE IF NOT EXISTS user_usage_time (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    used_seconds INT DEFAULT 0 COMMENT '今日已使用秒数',
    last_reset_date DATE COMMENT '上次重置日期',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_id (user_id),
    INDEX idx_last_reset_date (last_reset_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户使用时长记录表';

-- 用户会员信息表
CREATE TABLE IF NOT EXISTS user_membership (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    member_type INT DEFAULT 0 COMMENT '会员类型：0-非会员, 1-VIP, 2-SVIP',
    member_expire_time DATETIME COMMENT '会员过期时间',
    daily_limit_seconds INT DEFAULT 300 COMMENT '每日时长限制（秒）',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户会员信息表';

-- 初始化数据（测试用）
INSERT INTO user_membership (user_id, member_type, daily_limit_seconds)
VALUES (1, 0, 300)  -- 普通用户，每天300秒
ON DUPLICATE KEY UPDATE member_type = VALUES(member_type);
