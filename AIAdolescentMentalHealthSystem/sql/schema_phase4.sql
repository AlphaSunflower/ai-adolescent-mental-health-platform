-- Phase 4: 预约挂号与排班、内容管理增强
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Update hospital table
-- ----------------------------
ALTER TABLE `hospital` ADD COLUMN `picture` varchar(255) DEFAULT NULL COMMENT '医院封面图' AFTER `introduction`;

-- ----------------------------
-- Table structure for doctor_schedule
-- ----------------------------
DROP TABLE IF EXISTS `doctor_schedule`;
CREATE TABLE `doctor_schedule` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `doctor_id` bigint(20) NOT NULL COMMENT '医生ID',
  `work_date` date NOT NULL COMMENT '工作日期',
  `work_shift` int(11) NOT NULL COMMENT '班次(1-上午, 2-下午, 3-晚班)',
  `max_patients` int(11) DEFAULT 20 COMMENT '最大接诊数',
  `booked_count` int(11) DEFAULT 0 COMMENT '已预约数',
  `status` int(11) DEFAULT 1 COMMENT '状态(0-停诊, 1-正常)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_doc_date_shift` (`doctor_id`, `work_date`, `work_shift`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='医生排班表';

-- ----------------------------
-- Table structure for appointment
-- ----------------------------
DROP TABLE IF EXISTS `appointment`;
CREATE TABLE `appointment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `doctor_id` bigint(20) NOT NULL COMMENT '医生ID',
  `schedule_id` bigint(20) NOT NULL COMMENT '排班ID',
  `status` int(11) DEFAULT 0 COMMENT '状态(0-待就诊, 1-已完成, 2-已取消, 3-爽约)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约记录表';

-- ----------------------------
-- Update assessment_template table
-- ----------------------------
ALTER TABLE `assessment_template` ADD COLUMN `is_public` int(11) DEFAULT 1 COMMENT '是否公开(0-仅医生可见, 1-公开)';
ALTER TABLE `assessment_template` ADD COLUMN `cover_url` varchar(255) DEFAULT NULL COMMENT '封面图';

SET FOREIGN_KEY_CHECKS = 1;
