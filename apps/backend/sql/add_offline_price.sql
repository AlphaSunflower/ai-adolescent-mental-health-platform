-- 为 psychologist 表添加线下咨询价格字段
ALTER TABLE `psychologist`
ADD COLUMN `offline_price` VARCHAR(50) DEFAULT '0' COMMENT '线下咨询价格（元/次）' AFTER `consultation_price`;

-- 更新示例数据（可选）
-- UPDATE psychologist SET offline_price = '500' WHERE offline_price IS NULL OR offline_price = '';
