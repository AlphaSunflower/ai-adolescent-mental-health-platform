-- 微信模块清理：删除已废弃的微信相关列
-- 执行前请确认：后端代码已移除对应实体字段（已完成）

-- 1. user 表：先删依赖 wx_id 的唯一索引，再删列
ALTER TABLE `user` DROP INDEX `uk_wx_id`;
ALTER TABLE `user` DROP COLUMN `wx_id`;
ALTER TABLE `user` DROP COLUMN `wx_gzh_id`;

-- 2. email_verify_code 表：删除微信 OpenID 相关列
ALTER TABLE `email_verify_code` DROP COLUMN `openid`;
ALTER TABLE `email_verify_code` DROP COLUMN `openid_type`;
