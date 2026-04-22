-- Phase 3: 医院科室管理与医生排班
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for department
-- ----------------------------
DROP TABLE IF EXISTS `department`;
CREATE TABLE `department` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(100) NOT NULL COMMENT '科室名称',
  `hospital_id` bigint(20) NOT NULL COMMENT '所属医院ID',
  `description` varchar(500) DEFAULT NULL COMMENT '科室介绍',
  `status` int(11) DEFAULT 1 COMMENT '状态(0-停用, 1-启用)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='医院科室表';

-- ----------------------------
-- Update doctor_profile table
-- ----------------------------
ALTER TABLE `doctor_profile` ADD COLUMN `department_id` bigint(20) DEFAULT NULL COMMENT '所属科室ID' AFTER `hospital_id`;

SET FOREIGN_KEY_CHECKS = 1;
