-- Phase 4.1: 医生周排班配置
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for doctor_schedule_config
-- ----------------------------
DROP TABLE IF EXISTS `doctor_schedule_config`;
CREATE TABLE `doctor_schedule_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `doctor_id` bigint(20) NOT NULL COMMENT '医生ID',
  `day_of_week` int(11) NOT NULL COMMENT '周几(1-7, 1=Monday)',
  `work_shift` int(11) NOT NULL COMMENT '班次(1-上午, 2-下午, 3-晚班)',
  `start_time` time DEFAULT NULL COMMENT '开始时间',
  `end_time` time DEFAULT NULL COMMENT '结束时间',
  `max_patients` int(11) DEFAULT 20 COMMENT '最大接诊数',
  `status` int(11) DEFAULT 1 COMMENT '状态(0-停用, 1-启用)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_doc_day_shift` (`doctor_id`, `day_of_week`, `work_shift`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='医生周排班配置表';

SET FOREIGN_KEY_CHECKS = 1;
