-- Update doctor_profile
ALTER TABLE xinyuzhilian.doctor_profile ADD COLUMN is_online_consult_enabled TINYINT DEFAULT 1 COMMENT '是否开启线上咨询(0-否, 1-是)';
ALTER TABLE xinyuzhilian.doctor_profile ADD COLUMN rating_score DECIMAL(3, 2) DEFAULT 5.00 COMMENT '医生平均评分';

-- Update appointment
ALTER TABLE xinyuzhilian.appointment ADD COLUMN type TINYINT DEFAULT 0 COMMENT '预约类型(0-线下, 1-线上)';
ALTER TABLE xinyuzhilian.appointment ADD COLUMN is_rescheduled TINYINT DEFAULT 0 COMMENT '是否已改期(0-否, 1-是)';

-- Create complaint table
CREATE TABLE IF NOT EXISTS xinyuzhilian.complaint (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    doctor_id BIGINT NOT NULL COMMENT '医生ID',
    appointment_id BIGINT NOT NULL COMMENT '关联预约ID',
    content TEXT NOT NULL COMMENT '投诉内容',
    proof_images JSON NULL COMMENT '证明图片(JSON数组)',
    status TINYINT DEFAULT 0 COMMENT '状态(0-待审核, 1-审核通过/已处理, 2-驳回)',
    audit_remark TEXT NULL COMMENT '审核备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    audit_time DATETIME NULL
) COMMENT '投诉表';

-- Create consultation_message table
CREATE TABLE IF NOT EXISTS xinyuzhilian.consultation_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL COMMENT '预约ID',
    sender_id BIGINT NOT NULL COMMENT '发送者ID',
    receiver_id BIGINT NOT NULL COMMENT '接收者ID',
    content TEXT NOT NULL COMMENT '消息内容',
    type TINYINT DEFAULT 0 COMMENT '消息类型(0-文本, 1-图片, 2-测评, 3-处方/建议)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT '咨询消息表';

CREATE INDEX idx_appointment_id ON xinyuzhilian.consultation_message(appointment_id);
