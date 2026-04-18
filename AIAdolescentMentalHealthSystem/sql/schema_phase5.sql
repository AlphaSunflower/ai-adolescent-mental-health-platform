-- Phase 5: 课程内容管理增强
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for course_source
-- ----------------------------
DROP TABLE IF EXISTS `course_source`;
CREATE TABLE `course_source` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `course_id` bigint(20) NOT NULL COMMENT '课程ID',
  `source_type` varchar(20) NOT NULL COMMENT '来源类型(third_party, self_hosted)',
  `source_name` varchar(50) DEFAULT NULL COMMENT '第三方平台名称',
  `source_url` varchar(500) NOT NULL COMMENT '视频地址',
  `storage_provider` varchar(20) DEFAULT NULL COMMENT '存储提供商(oss, local, cdn)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程资源表';

-- ----------------------------
-- Table structure for cover_image
-- ----------------------------
DROP TABLE IF EXISTS `cover_image`;
CREATE TABLE `cover_image` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `course_id` bigint(20) NOT NULL COMMENT '课程ID',
  `cover_type` varchar(20) NOT NULL COMMENT '封面来源(third_party, self_hosted)',
  `cover_url_avif` varchar(500) DEFAULT NULL COMMENT 'AVIF格式地址',
  `cover_url_webp` varchar(500) DEFAULT NULL COMMENT 'WebP格式地址',
  `cover_url_jpeg` varchar(500) DEFAULT NULL COMMENT 'JPEG格式地址',
  `md5_hash` varchar(32) DEFAULT NULL COMMENT 'MD5校验值',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程封面图表';

SET FOREIGN_KEY_CHECKS = 1;
