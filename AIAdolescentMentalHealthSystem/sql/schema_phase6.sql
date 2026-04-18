-- Phase 6: 预约挂号增强
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Update appointment table
-- ----------------------------
ALTER TABLE `appointment` ADD COLUMN `description` varchar(1000) DEFAULT NULL COMMENT '病情描述/病例表';
ALTER TABLE `appointment` ADD COLUMN `fee` decimal(10,2) DEFAULT 0.00 COMMENT '挂号费';
ALTER TABLE `appointment` ADD COLUMN `pay_status` int(11) DEFAULT 0 COMMENT '支付状态(0-未支付, 1-已支付, 2-已退款)';
ALTER TABLE `appointment` ADD COLUMN `pay_time` datetime DEFAULT NULL COMMENT '支付时间';

-- Update existing status logic (if any data):
-- 0 -> 1 (If previously 0 meant booked/paid. But since it's dev, likely empty or can reset)
-- New Status: 0-Pending Payment, 1-Paid/Waiting, 2-Completed, 3-Cancelled, 4-Missed

SET FOREIGN_KEY_CHECKS = 1;
