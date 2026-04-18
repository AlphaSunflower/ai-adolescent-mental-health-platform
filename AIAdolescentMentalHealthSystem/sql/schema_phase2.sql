-- Phase 2: 核心业务功能数据库脚本

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for article
-- ----------------------------
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` varchar(255) NOT NULL COMMENT '文章标题',
  `content` longtext COMMENT '文章内容(富文本)',
  `cover_url` varchar(255) DEFAULT NULL COMMENT '封面图URL',
  `type` varchar(20) DEFAULT 'SCIENCE' COMMENT '类型(SCIENCE-科普, CASE-案例)',
  `status` int(11) DEFAULT 1 COMMENT '状态(0-草稿, 1-已发布)',
  `author_id` bigint(20) DEFAULT NULL COMMENT '作者ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='心理文章表';

-- ----------------------------
-- Table structure for course
-- ----------------------------
DROP TABLE IF EXISTS `course`;
CREATE TABLE `course` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` varchar(255) NOT NULL COMMENT '课程标题',
  `description` text COMMENT '课程简介',
  `media_url` varchar(255) NOT NULL COMMENT '媒体资源URL(视频/音频)',
  `cover_url` varchar(255) DEFAULT NULL COMMENT '封面图URL',
  `type` varchar(20) DEFAULT 'VIDEO' COMMENT '类型(VIDEO-视频, AUDIO-音频)',
  `status` int(11) DEFAULT 1 COMMENT '状态(0-下架, 1-上架)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='心理课程表';

-- ----------------------------
-- Table structure for user_course_progress
-- ----------------------------
DROP TABLE IF EXISTS `user_course_progress`;
CREATE TABLE `user_course_progress` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `course_id` bigint(20) NOT NULL COMMENT '课程ID',
  `progress` int(11) DEFAULT 0 COMMENT '观看进度(百分比0-100)',
  `last_watch_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '最近观看时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_course` (`user_id`, `course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户课程进度表';

-- ----------------------------
-- Table structure for assessment_template
-- ----------------------------
DROP TABLE IF EXISTS `assessment_template`;
CREATE TABLE `assessment_template` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` varchar(100) NOT NULL COMMENT '量表标题',
  `description` text COMMENT '量表描述',
  `type` varchar(20) DEFAULT 'TRADITIONAL' COMMENT '类型(TRADITIONAL-传统, QUICK-快速, DYNAMIC-动态)',
  `questions_json` json NOT NULL COMMENT '题目配置JSON',
  `scoring_rules_json` json DEFAULT NULL COMMENT '计分规则JSON',
  `status` int(11) DEFAULT 1 COMMENT '状态(0-停用, 1-启用)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测评量表模板表';

-- ----------------------------
-- Table structure for assessment_record
-- ----------------------------
DROP TABLE IF EXISTS `assessment_record`;
CREATE TABLE `assessment_record` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `template_id` bigint(20) NOT NULL COMMENT '模板ID',
  `answers_json` json NOT NULL COMMENT '用户作答JSON',
  `result_score` int(11) DEFAULT 0 COMMENT '总分',
  `result_analysis` text COMMENT '结果分析结论',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测评记录表';

-- ----------------------------
-- Table structure for doctor_patient_relation
-- ----------------------------
DROP TABLE IF EXISTS `doctor_patient_relation`;
CREATE TABLE `doctor_patient_relation` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `doctor_id` bigint(20) NOT NULL COMMENT '医生用户ID',
  `patient_id` bigint(20) NOT NULL COMMENT '患者用户ID',
  `status` varchar(20) DEFAULT 'NEW' COMMENT '状态(NEW-新患者, ONGOING-进行中, STABLE-稳定, ARCHIVED-归档)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_doc_pat` (`doctor_id`, `patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='医患关系表';

SET FOREIGN_KEY_CHECKS = 1;
