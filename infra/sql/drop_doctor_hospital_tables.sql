-- ============================================================
-- 医生/医院体系清理：删除已废弃的「医生/医院/旧咨询」相关数据表
--
-- 目的：移除旧「医生/医院」挂号体系（doctor_*、hospital、department、appointment、
--        complaint、consultation_*、medical_record*、patient_profile 等），
--        统一到「心理咨询师（psychologist_*）」体系。
--
-- 所属分支：移除医生/医院体系的功能分支（feat/remove-doctor-hospital*）。
--
-- 安全提示：
--   * 本脚本为人工/运维执行的裸迁移脚本（非 Flyway/Liquibase 自动执行）。
--   * 属破坏性操作（DROP TABLE），执行前务必备份 `xinyuzhilian_full_dump.sql` / 数据库。
--   * 不建议在生产环境直接自动执行；请交由运维在停机窗/备份后手动审阅执行。
--   * 执行前请确认后端代码已移除对应实体/引用（已完成）。
--
-- 依赖说明：
--   * 经核对 xinyuzhilian_full_dump.sql，目标表均未声明真正的 FOREIGN KEY 约束，
--     仅存在普通 KEY / UNIQUE KEY 索引，故无需 SET FOREIGN_KEY_CHECKS=0。
--   * 下方按「子表 → 父表」依赖顺序排列（防御性），尽量只删医表依赖链。
--   * 注意：`patient_contact` 不删除 —— 量表评估模块在用（assessment_record.patient_contact_id）。
-- ============================================================

-- 1. 病历图片（依赖 medical_record） —— 旧医生/医院体系
DROP TABLE IF EXISTS `medical_record_image`;

-- 2. 咨询会话消息（依赖 appointment） —— 旧医生/医院体系
DROP TABLE IF EXISTS `consultation_message`;

-- 3. 投诉（依赖 appointment） —— 旧医生/医院体系
DROP TABLE IF EXISTS `complaint`;

-- 4. 就诊病历（依赖 appointment / patient_contact） —— 旧医生/医院体系
DROP TABLE IF EXISTS `medical_record`;

-- 5. 咨询/挂号反馈（依赖 appointment / hospital / doctor） —— 旧医生/医院体系
DROP TABLE IF EXISTS `consultation_feedback`;

-- 6. 预约记录（依赖 doctor / schedule） —— 旧医生/医院体系
DROP TABLE IF EXISTS `appointment`;

-- 7. 医生周排班配置（依赖 doctor） —— 旧医生/医院体系
DROP TABLE IF EXISTS `doctor_schedule_config`;

-- 8. 医生排班（依赖 doctor） —— 旧医生/医院体系
DROP TABLE IF EXISTS `doctor_schedule`;

-- 9. 医患关系（依赖 doctor / patient） —— 旧医生/医院体系
DROP TABLE IF EXISTS `doctor_patient_relation`;

-- 10. 患者档案（孤儿表，无代码引用） —— 旧医生/医院体系
DROP TABLE IF EXISTS `patient_profile`;

-- 11. 医生档案（依赖 hospital / department） —— 旧医生/医院体系
DROP TABLE IF EXISTS `doctor_profile`;

-- 12. 医院科室（依赖 hospital） —— 旧医生/医院体系
DROP TABLE IF EXISTS `department`;

-- 13. 医院（根父表，最后删） —— 旧医生/医院体系
DROP TABLE IF EXISTS `hospital`;
