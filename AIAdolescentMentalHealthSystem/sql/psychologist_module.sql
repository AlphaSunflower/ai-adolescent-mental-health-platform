-- =============================================
-- 心理咨询师模块数据库脚本
-- 青少年心理健康AI系统
-- 创建时间: 2026-04-14
-- 描述: 心理咨询师预约咨询模块的所有数据表
-- =============================================

-- 切换数据库
USE xinyuzhilian;

-- =============================================
-- 1. 心理咨询师基础信息表
-- 存储心理咨询师的个人信息和资质
-- =============================================
DROP TABLE IF EXISTS `psychologist`;
CREATE TABLE `psychologist` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID，自增',
    `user_id` BIGINT NOT NULL COMMENT '关联用户ID，唯一',
    `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
    `sex` TINYINT COMMENT '性别（1-男，2-女）',
    `head_path` VARCHAR(500) COMMENT '头像路径',
    `introduction` TEXT COMMENT '详细个人介绍',
    `education_background` TEXT COMMENT '教育背景',
    `training_experience` TEXT COMMENT '受训经历',
    `certifications` TEXT COMMENT '专业认证（JSON数组）',
    `years_experience` INT DEFAULT 0 COMMENT '咨询经验年限',
    `consultation_price` VARCHAR(50) DEFAULT '0' COMMENT '线上咨询价格（元/次）- 视频+语音',
    `offline_price` VARCHAR(50) DEFAULT '0' COMMENT '线下咨询价格（元/次）',
    `rating_score` DECIMAL(3,2) DEFAULT 0.00 COMMENT '用户评分（0-5）',
    `rating_count` INT DEFAULT 0 COMMENT '评分次数',
    `consultation_count` INT DEFAULT 0 COMMENT '咨询接单量',
    `offline_region` VARCHAR(200) COMMENT '线下咨询地区',
    `offline_address` VARCHAR(500) COMMENT '详细地址',
    `languages` VARCHAR(200) COMMENT '语言能力（JSON数组：普通话、方言、外语）',
    `status` TINYINT DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
    `online_status` TINYINT DEFAULT 0 COMMENT '在线状态（0-离线，1-在线，2-忙碌）',
    `audit_status` TINYINT DEFAULT 0 COMMENT '资料审核状态（0-无需审核，1-待审核，2-审核中，3-已通过，4-已拒绝）',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_rating` (`rating_score`),
    KEY `idx_consultation_count` (`consultation_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心理咨询师基础信息表';

-- =============================================
-- 2. 心理咨询师资质类型表（字典表）
-- 存储资质类型，如：国家二级心理咨询师、临床心理学硕士等
-- =============================================
DROP TABLE IF EXISTS `psychologist_qualification`;
CREATE TABLE `psychologist_qualification` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name` VARCHAR(100) NOT NULL COMMENT '资质名称',
    `code` VARCHAR(50) NOT NULL COMMENT '资质代码',
    `description` VARCHAR(500) COMMENT '描述',
    `status` TINYINT DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心理咨询师资质类型表';

-- =============================================
-- 3. 咨询领域类型表（字典表）
-- 存储咨询领域，如：情感婚恋、职场压力、学业困扰等
-- =============================================
DROP TABLE IF EXISTS `consultation_field`;
CREATE TABLE `consultation_field` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name` VARCHAR(50) NOT NULL COMMENT '领域名称',
    `code` VARCHAR(50) NOT NULL COMMENT '领域代码',
    `icon` VARCHAR(100) COMMENT '图标',
    `description` VARCHAR(500) COMMENT '描述',
    `status` TINYINT DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='咨询领域类型表';

-- =============================================
-- 4. 心理咨询师-资质关联表
-- 存储心理师拥有的资质及其证书
-- =============================================
DROP TABLE IF EXISTS `psychologist_qualification_relation`;
CREATE TABLE `psychologist_qualification_relation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `psychologist_id` BIGINT NOT NULL COMMENT '心理咨询师ID',
    `qualification_id` INT NOT NULL COMMENT '资质ID',
    `certificate_url` VARCHAR(500) COMMENT '证书图片URL',
    `is_verified` TINYINT DEFAULT 0 COMMENT '是否已认证（0-未认证，1-已认证）',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_psychologist_id` (`psychologist_id`),
    KEY `idx_qualification_id` (`qualification_id`),
    UNIQUE KEY `uk_psychologist_qualification` (`psychologist_id`, `qualification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心理咨询师-资质关联表';

-- =============================================
-- 5. 心理咨询师-擅长领域关联表
-- 存储心理师擅长的咨询领域及细分标签
-- =============================================
DROP TABLE IF EXISTS `psychologist_field_relation`;
CREATE TABLE `psychologist_field_relation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `psychologist_id` BIGINT NOT NULL COMMENT '心理咨询师ID',
    `field_id` INT NOT NULL COMMENT '领域ID',
    `sub_tags` VARCHAR(500) COMMENT '细分标签（JSON数组：考试焦虑、宿舍关系等）',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_psychologist_id` (`psychologist_id`),
    KEY `idx_field_id` (`field_id`),
    UNIQUE KEY `uk_psychologist_field` (`psychologist_id`, `field_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心理咨询师-擅长领域关联表';

-- =============================================
-- 6. 心理咨询师咨询方式与价格表
-- 存储心理师提供的服务方式及对应价格
-- =============================================
DROP TABLE IF EXISTS `psychologist_service`;
CREATE TABLE `psychologist_service` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `psychologist_id` BIGINT NOT NULL COMMENT '心理咨询师ID',
    `service_type` VARCHAR(20) NOT NULL COMMENT '服务类型（VIDEO-视频，VOICE-语音，TEXT-文字，OFFLINE-线下）',
    `price` DECIMAL(10,2) NOT NULL COMMENT '价格（元/50分钟）',
    `description` VARCHAR(500) COMMENT '服务说明',
    `status` TINYINT DEFAULT 1 COMMENT '状态（0-关闭，1-开启）',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_psychologist_service` (`psychologist_id`, `service_type`),
    KEY `idx_psychologist_id` (`psychologist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心理咨询师咨询方式与价格表';

-- =============================================
-- 7. 心理咨询师排班表
-- 存储心理师的预约时间排班
-- =============================================
DROP TABLE IF EXISTS `psychologist_schedule`;
CREATE TABLE `psychologist_schedule` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `psychologist_id` BIGINT NOT NULL COMMENT '心理咨询师ID',
    `schedule_date` DATE NOT NULL COMMENT '排班日期',
    `time_slot` VARCHAR(20) NOT NULL COMMENT '时段（MORNING-上午，AFTERNOON-下午，EVENING-晚上）',
    `start_time` TIME NOT NULL COMMENT '开始时间',
    `end_time` TIME NOT NULL COMMENT '结束时间',
    `max_appointments` INT DEFAULT 1 COMMENT '最大预约人数',
    `booked_count` INT DEFAULT 0 COMMENT '已预约人数',
    `status` TINYINT DEFAULT 1 COMMENT '状态（0-休息，1-可预约）',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_psychologist_date_slot` (`psychologist_id`, `schedule_date`, `time_slot`),
    KEY `idx_schedule_date` (`schedule_date`),
    KEY `idx_psychologist_id` (`psychologist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心理咨询师排班表';

-- =============================================
-- 8. 心理咨询预约订单表
-- 存储用户的心理咨询预约订单
-- =============================================
DROP TABLE IF EXISTS `psychologist_appointment`;
CREATE TABLE `psychologist_appointment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `order_no` VARCHAR(32) NOT NULL COMMENT '订单编号',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `psychologist_id` BIGINT NOT NULL COMMENT '心理咨询师ID',
    `schedule_id` BIGINT COMMENT '排班ID',
    `service_type` VARCHAR(20) NOT NULL COMMENT '服务类型',
    `appointment_time` DATETIME NOT NULL COMMENT '预约时间',
    `fee` DECIMAL(10,2) NOT NULL COMMENT '费用',
    `pay_status` TINYINT DEFAULT 0 COMMENT '支付状态（0-未支付，1-已支付，2-已退款）',
    `pay_time` DATETIME COMMENT '支付时间',
    `status` TINYINT DEFAULT 0 COMMENT '预约状态（0-待审核，1-已确认，2-已拒绝，3-进行中，4-已完成，5-已取消，6-已爽约）',
    `reject_reason` VARCHAR(500) COMMENT '拒绝原因',
    `video_link` VARCHAR(500) COMMENT '视频会议链接',
    `user_basic_info` TEXT COMMENT '用户基本情况（JSON）',
    `user_problems` TEXT COMMENT '用户困扰描述',
    `user_experience` TEXT COMMENT '过往经历',
    `user_health` TEXT COMMENT '健康状况',
    `consultation_content` TEXT COMMENT '咨询内容记录',
    `is_rated` TINYINT DEFAULT 0 COMMENT '是否已评分（0-否，1-是）',
    `rating_score` DECIMAL(3,2) COMMENT '评分',
    `rating_content` TEXT COMMENT '评价内容',
    `rating_time` DATETIME COMMENT '评分时间',
    `complete_time` DATETIME COMMENT '完成时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_psychologist_id` (`psychologist_id`),
    KEY `idx_status` (`status`),
    KEY `idx_appointment_time` (`appointment_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心理咨询预约订单表';

-- =============================================
-- 9. 心理咨询聊天消息表
-- 存储用户与心理师之间的聊天消息
-- =============================================
DROP TABLE IF EXISTS `psychologist_message`;
CREATE TABLE `psychologist_message` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `appointment_id` BIGINT NOT NULL COMMENT '预约ID',
    `sender_id` BIGINT NOT NULL COMMENT '发送者ID',
    `receiver_id` BIGINT NOT NULL COMMENT '接收者ID',
    `content` TEXT COMMENT '消息内容',
    `content_type` TINYINT DEFAULT 0 COMMENT '消息类型（0-文本，1-图片，2-系统消息）',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_appointment_id` (`appointment_id`),
    KEY `idx_sender_id` (`sender_id`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心理咨询聊天消息表';

-- =============================================
-- 10. 用户收藏心理咨询师表
-- 存储用户收藏的心理咨询师
-- =============================================
DROP TABLE IF EXISTS `user_favorite_psychologist`;
CREATE TABLE `user_favorite_psychologist` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `psychologist_id` BIGINT NOT NULL COMMENT '心理咨询师ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_psychologist` (`user_id`, `psychologist_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_psychologist_id` (`psychologist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏心理咨询师表';

-- =============================================
-- 11. 心理咨询师资料变更审核表
-- 存储心理师资料变更的审核记录
-- =============================================
DROP TABLE IF EXISTS `psychologist_profile_audit`;
CREATE TABLE `psychologist_profile_audit` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `psychologist_id` BIGINT NOT NULL COMMENT '心理咨询师ID',
    `field_name` VARCHAR(50) NOT NULL COMMENT '变更字段名',
    `old_value` TEXT COMMENT '原值',
    `new_value` TEXT COMMENT '新值',
    `proof_urls` TEXT COMMENT '证明材料URLs（JSON数组）',
    `audit_status` TINYINT DEFAULT 0 COMMENT '审核状态（0-待审核，1-已通过，2-已拒绝）',
    `audit_remark` VARCHAR(500) COMMENT '审核备注',
    `auditor_id` BIGINT COMMENT '审核人ID',
    `audit_time` DATETIME COMMENT '审核时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    PRIMARY KEY (`id`),
    KEY `idx_psychologist_id` (`psychologist_id`),
    KEY `idx_audit_status` (`audit_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心理咨询师资料变更审核表';

-- =============================================
-- 12. 心理咨询师收入表
-- 存储心理师的收入记录
-- =============================================
DROP TABLE IF EXISTS `psychologist_income`;
CREATE TABLE `psychologist_income` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `psychologist_id` BIGINT NOT NULL COMMENT '心理咨询师ID',
    `appointment_id` BIGINT NOT NULL COMMENT '预约ID',
    `order_fee` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
    `commission_rate` DECIMAL(5,2) NOT NULL COMMENT '抽成比例',
    `commission_amount` DECIMAL(10,2) NOT NULL COMMENT '抽成金额',
    `income_amount` DECIMAL(10,2) NOT NULL COMMENT '实际收入',
    `rating_score` DECIMAL(3,2) COMMENT '用户评分',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_psychologist_id` (`psychologist_id`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心理咨询师收入表';

-- =============================================
-- 13. 心理咨询师提现记录表
-- 存储心理师的提现申请记录
-- =============================================
DROP TABLE IF EXISTS `psychologist_withdraw`;
CREATE TABLE `psychologist_withdraw` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `psychologist_id` BIGINT NOT NULL COMMENT '心理咨询师ID',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '提现金额',
    `status` TINYINT DEFAULT 0 COMMENT '状态（0-处理中，1-已提现，2-已拒绝）',
    `bank_name` VARCHAR(100) COMMENT '银行名称',
    `bank_account` VARCHAR(50) COMMENT '银行账号',
    `account_name` VARCHAR(50) COMMENT '开户名',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    `process_time` DATETIME COMMENT '处理时间',
    PRIMARY KEY (`id`),
    KEY `idx_psychologist_id` (`psychologist_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心理咨询师提现记录表';

-- =============================================
-- 14. 心理咨询师余额表
-- 存储心理师的账户余额信息
-- =============================================
DROP TABLE IF EXISTS `psychologist_balance`;
CREATE TABLE `psychologist_balance` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `psychologist_id` BIGINT NOT NULL COMMENT '心理咨询师ID，唯一',
    `total_income` DECIMAL(12,2) DEFAULT 0.00 COMMENT '累计收入',
    `total_withdraw` DECIMAL(12,2) DEFAULT 0.00 COMMENT '累计提现',
    `balance` DECIMAL(12,2) DEFAULT 0.00 COMMENT '可用余额',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_psychologist_id` (`psychologist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心理咨询师余额表';

-- =============================================
-- 15. 心理咨询师评价表
-- 存储用户对心理师的评价
-- =============================================
DROP TABLE IF EXISTS `psychologist_rating`;
CREATE TABLE `psychologist_rating` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `appointment_id` BIGINT NOT NULL COMMENT '预约ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `psychologist_id` BIGINT NOT NULL COMMENT '心理咨询师ID',
    `rating_score` DECIMAL(3,2) NOT NULL COMMENT '评分（1-5）',
    `rating_content` TEXT COMMENT '评价内容',
    `is_anonymous` TINYINT DEFAULT 1 COMMENT '是否匿名（0-否，1-是）',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_appointment_id` (`appointment_id`),
    KEY `idx_psychologist_id` (`psychologist_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心理咨询师评价表';

-- =============================================
-- 16. 用户-心理咨询师咨询记录表
-- 存储用户咨询过的心理师记录，用于展示"咨询过的心理咨询师"
-- =============================================
DROP TABLE IF EXISTS `user_psychologist_history`;
CREATE TABLE `user_psychologist_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `psychologist_id` BIGINT NOT NULL COMMENT '心理咨询师ID',
    `appointment_count` INT DEFAULT 1 COMMENT '预约次数',
    `last_appointment_time` DATETIME COMMENT '最后一次预约时间',
    `last_appointment_id` BIGINT COMMENT '最后一次预约ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '首次咨询时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_psychologist` (`user_id`, `psychologist_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_last_time` (`last_appointment_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户-心理咨询师咨询记录表';

-- =============================================
-- 初始化数据
-- =============================================

-- 插入资质类型数据
INSERT INTO `psychologist_qualification` (`name`, `code`, `description`, `sort_order`) VALUES
('国家二级心理咨询师', 'NATIONAL_LEVEL2', '国家职业资格二级心理咨询师', 1),
('国家三级心理咨询师', 'NATIONAL_LEVEL3', '国家职业资格三级心理咨询师', 2),
('临床心理学硕士', 'CLINICAL_MASTER', '临床心理学硕士学位', 3),
('心理学博士', 'PSYCHOLOGY_PHD', '心理学博士学位', 4),
('注册心理师', 'REGISTERED', '中国心理学会注册心理师', 5),
('实习咨询师', 'INTERN', '实习咨询师', 6);

-- 插入咨询领域数据
INSERT INTO `consultation_field` (`name`, `code`, `icon`, `description`, `sort_order`) VALUES
('情感婚恋', 'EMOTIONAL', 'heart', '恋爱、婚姻、家庭情感问题', 1),
('职场压力', 'WORKPLACE', 'briefcase', '职业发展、工作压力、职业规划', 2),
('学业困扰', 'ACADEMIC', 'book', '学习困难、考试焦虑、升学压力', 3),
('人际关系', 'RELATIONSHIP', 'users', '人际交往、社交恐惧、沟通障碍', 4),
('情绪管理', 'EMOTION', 'smile', '焦虑、抑郁、愤怒、压力管理', 5),
('青少年心理', 'ADOLESCENT', 'child', '青少年成长问题、亲子关系', 6);

-- =============================================
-- 完成
-- =============================================
