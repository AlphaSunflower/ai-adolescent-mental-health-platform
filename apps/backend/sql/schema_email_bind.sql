-- ================================================================
-- 邮箱绑定微信登录 - 邮箱验证码表
-- wx_gzh_id / email_verified 已合入 schema.sql，此处仅保留建表
-- ================================================================

-- 邮箱验证码表
CREATE TABLE IF NOT EXISTS email_verify_code (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    email         VARCHAR(100) NOT NULL COMMENT '邮箱地址',
    code          VARCHAR(6) NOT NULL COMMENT '6位验证码',
    scene         VARCHAR(20) NOT NULL COMMENT '场景: bind_email-绑定邮箱',
    openid        VARCHAR(64) NULL COMMENT '发起验证时的微信OpenID',
    openid_type   VARCHAR(10) NULL COMMENT 'openid类型: mini-小程序, gzh-公众号',
    expire_time   DATETIME NOT NULL COMMENT '过期时间',
    used          TINYINT(1) DEFAULT 0 COMMENT '是否已使用(0-否,1-是)',
    create_time   DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_email_scene (email, scene),
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邮箱验证码表';
