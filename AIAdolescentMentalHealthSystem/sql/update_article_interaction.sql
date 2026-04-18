-- 新增文章互动相关表

-- 1. 文章点赞/踩/收藏表
CREATE TABLE IF NOT EXISTS xinyuzhilian.article_interaction (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT NOT NULL COMMENT '文章ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    type INT NOT NULL COMMENT '类型(1-点赞, 2-踩, 3-收藏)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_article_type (user_id, article_id, type)
) COMMENT '文章互动表';

-- 2. 文章评论表
CREATE TABLE IF NOT EXISTS xinyuzhilian.article_comment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT NOT NULL COMMENT '文章ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父评论ID(回复评论时使用)',
    reply_to_user_id BIGINT DEFAULT NULL COMMENT '被回复人用户ID',
    content VARCHAR(1000) NOT NULL COMMENT '评论内容',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '文章评论表';

-- 3. 评论点赞表
CREATE TABLE IF NOT EXISTS xinyuzhilian.comment_like (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    comment_id BIGINT NOT NULL COMMENT '评论ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_comment (user_id, comment_id)
) COMMENT '评论点赞表';

-- 4. 为 article 表增加统计字段
ALTER TABLE xinyuzhilian.article ADD COLUMN like_count INT DEFAULT 0 COMMENT '点赞数';
ALTER TABLE xinyuzhilian.article ADD COLUMN dislike_count INT DEFAULT 0 COMMENT '踩数';
ALTER TABLE xinyuzhilian.article ADD COLUMN collection_count INT DEFAULT 0 COMMENT '收藏数';
ALTER TABLE xinyuzhilian.article ADD COLUMN comment_count INT DEFAULT 0 COMMENT '评论数';
ALTER TABLE xinyuzhilian.article ADD COLUMN view_count INT DEFAULT 0 COMMENT '阅读数';
