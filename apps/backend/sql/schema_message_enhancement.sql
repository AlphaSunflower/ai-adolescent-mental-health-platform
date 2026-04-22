-- AI青少年心理健康系统 - 消息系统字段扩展
-- 为 sys_message 表添加 source_type、source_id、extra_type、article_author_id 字段

USE xinyuzhilian;

-- 添加来源类型字段
ALTER TABLE sys_message ADD COLUMN source_type INT DEFAULT 0 COMMENT '来源类型(0-系统,1-关注,2-文章点赞,3-评论点赞,4-评论回复)';

-- 添加来源ID字段
ALTER TABLE sys_message ADD COLUMN source_id BIGINT DEFAULT NULL COMMENT '来源ID(文章ID)';

-- 添加扩展类型字段（用于区分文章类型：0-官方文章,1-用户文章）
ALTER TABLE sys_message ADD COLUMN extra_type INT DEFAULT 0 COMMENT '扩展类型(0-官方文章,1-用户文章)';

-- 添加文章作者ID字段（用于用户文章跳转）
ALTER TABLE sys_message ADD COLUMN article_author_id BIGINT DEFAULT NULL COMMENT '文章作者ID(用于用户文章跳转)';

-- 添加触发通知的用户ID
ALTER TABLE sys_message ADD COLUMN from_user_id BIGINT DEFAULT NULL COMMENT '触发通知的用户ID';

-- 添加索引
ALTER TABLE sys_message ADD INDEX idx_source_type (source_type);
ALTER TABLE sys_message ADD INDEX idx_from_user_id (from_user_id);
