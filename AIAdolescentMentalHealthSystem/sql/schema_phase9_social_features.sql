-- AI青少年心理健康系统 - 新功能数据库表
-- 执行环境: test

USE xinyuzhilian;

-- 1. 文章标签表
CREATE TABLE IF NOT EXISTS article_tag (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '标签名称',
    code VARCHAR(50) NOT NULL COMMENT '标签编码',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status INT DEFAULT 1 COMMENT '状态(0-禁用,1-启用)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章标签表';

-- 2. 用户文章表（普通用户发布的文章）
CREATE TABLE IF NOT EXISTS user_article (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    title VARCHAR(255) NOT NULL COMMENT '文章标题',
    content LONGTEXT COMMENT '文章内容',
    cover_url VARCHAR(500) COMMENT '封面图',
    tag_id BIGINT COMMENT '标签ID',
    status INT DEFAULT 0 COMMENT '状态(0-待审核,1-已发布,2-已下架)',
    reject_reason VARCHAR(500) COMMENT '拒绝/下架原因',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    dislike_count INT DEFAULT 0 COMMENT '踩数',
    collection_count INT DEFAULT 0 COMMENT '收藏数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    view_count INT DEFAULT 0 COMMENT '阅读数',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_tag_id (tag_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户文章表';

-- 3. 文章审核记录表
CREATE TABLE IF NOT EXISTS article_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT NOT NULL COMMENT '文章ID',
    article_type INT NOT NULL COMMENT '文章类型(1-管理员文章,2-用户文章)',
    user_id BIGINT NOT NULL COMMENT '发布者ID',
    auditor_id BIGINT COMMENT '审核人ID',
    action INT NOT NULL COMMENT '操作(1-通过,2-拒绝,3-下架)',
    reason VARCHAR(500) COMMENT '原因',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_article_id (article_id),
    INDEX idx_auditor_id (auditor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章审核记录表';

-- 4. 用户关注表
CREATE TABLE IF NOT EXISTS user_follow (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    follower_id BIGINT NOT NULL COMMENT '关注者ID',
    following_id BIGINT NOT NULL COMMENT '被关注者ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_follow (follower_id, following_id),
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户关注关系表';

-- 5. 用户统计表（用于缓存关注数/粉丝数等）
CREATE TABLE IF NOT EXISTS user_stats (
    user_id BIGINT PRIMARY KEY COMMENT '用户ID',
    follow_count INT DEFAULT 0 COMMENT '关注数',
    fan_count INT DEFAULT 0 COMMENT '粉丝数',
    article_count INT DEFAULT 0 COMMENT '发布文章数',
    like_count INT DEFAULT 0 COMMENT '获赞数',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户统计数据表';

-- 6. 用户隐私设置表
CREATE TABLE IF NOT EXISTS user_privacy_setting (
    user_id BIGINT PRIMARY KEY COMMENT '用户ID',
    allow_view_likes INT DEFAULT 1 COMMENT '允许他人查看点赞(0-否,1-是)',
    allow_view_articles INT DEFAULT 1 COMMENT '允许他人查看发布文章(0-否,1-是)',
    allow_view_collections INT DEFAULT 1 COMMENT '允许他人查看收藏(0-否,1-是)',
    allow_view_followings INT DEFAULT 0 COMMENT '允许他人查看关注(0-否,1-是)',
    allow_view_fans INT DEFAULT 0 COMMENT '允许他人查看粉丝(0-否,1-是)',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户隐私设置表';

-- 7. 站内消息表
CREATE TABLE IF NOT EXISTS sys_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '接收用户ID',
    title VARCHAR(100) NOT NULL COMMENT '消息标题',
    content TEXT NOT NULL COMMENT '消息内容',
    type INT DEFAULT 1 COMMENT '类型(1-系统通知,2-文章审核,3-文章下架)',
    is_read INT DEFAULT 0 COMMENT '是否已读(0-否,1-是)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='站内消息表';

-- 8. 初始化默认标签
INSERT INTO article_tag (name, code, sort_order, status) VALUES 
('科普', 'SCIENCE', 1, 1),
('案例', 'CASE', 2, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 9. 为现有用户初始化统计数据和隐私设置
INSERT INTO user_stats (user_id, follow_count, fan_count, article_count, like_count)
SELECT id, 0, 0, 0, 0 FROM user WHERE deleted = 0
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);

INSERT INTO user_privacy_setting (user_id, allow_view_likes, allow_view_articles, allow_view_collections, allow_view_followings, allow_view_fans)
SELECT id, 1, 1, 1, 0, 0 FROM user WHERE deleted = 0
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);
