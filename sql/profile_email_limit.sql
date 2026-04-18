-- ================================================================
-- MyHomeInfo 个人信息页改版 - 邮箱修改次数限制
-- 执行前请确认数据库名称和表前缀
-- ================================================================

-- 添加字段：邮箱修改次数（当月有效）
ALTER TABLE `user`
  ADD COLUMN `email_change_count` INT NOT NULL DEFAULT 0 COMMENT '当月邮箱修改次数' AFTER `email_verified`;

-- 添加字段：最近修改邮箱的日期（用于判断跨月重置）
ALTER TABLE `user`
  ADD COLUMN `email_change_date` DATE DEFAULT NULL COMMENT '最近修改邮箱的日期' AFTER `email_change_count`;

-- 如果报错 "Duplicate column"，说明字段已存在，跳过即可
-- 验证：
DESCRIBE `user` email_change_count;
DESCRIBE `user` email_change_date;
