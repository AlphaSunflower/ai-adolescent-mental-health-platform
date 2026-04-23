-- 添加冻结金额字段到心理咨询师余额表
-- 执行时间: 2026-04-17
-- 描述: 为心理咨询师余额表添加冻结金额字段

USE xinyuzhilian;

-- 添加冻结金额字段
ALTER TABLE `psychologist_balance` 
ADD COLUMN `frozen_amount` DECIMAL(12,2) DEFAULT 0.00 COMMENT '冻结金额' AFTER `balance`;
