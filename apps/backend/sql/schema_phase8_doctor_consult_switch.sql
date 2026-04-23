ALTER TABLE xinyuzhilian.doctor_profile
    ADD COLUMN is_offline_consult_enabled TINYINT DEFAULT 1 COMMENT '是否开启线下咨询(0-否,1-是)';

