package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistProfileAudit;

import java.util.Map;

/**
 * 心理咨询师资料审核服务接口
 *
 * @author AI Developer
 * @since 2026-04-14
 */
public interface IPsychologistProfileAuditService extends IService<PsychologistProfileAudit> {

    /**
     * 提交资料变更审核申请
     * @param psychologistId 心理咨询师ID
     * @param fieldName 变更字段名
     * @param oldValue 原值
     * @param newValue 新值
     * @param proofUrls 证明材料URLs
     * @param reason 申请理由
     * @return 操作结果
     */
    Map<String, Object> submitProfileChange(Long psychologistId, String fieldName, String oldValue, String newValue, String proofUrls, String reason);

    /**
     * 获取心理咨询师的审核记录列表
     * @param psychologistId 心理咨询师ID
     * @param page 页码
     * @param size 每页大小
     * @return 审核记录分页列表
     */
    PageResult<Map<String, Object>> getAuditListByPsychologist(Long psychologistId, int page, int size);

    /**
     * 获取所有待审核的申请列表（管理端）
     * @param status 审核状态（可选，0-待审核，1-已通过，2-已拒绝）
     * @param page 页码
     * @param size 每页大小
     * @return 审核申请分页列表
     */
    PageResult<Map<String, Object>> getPendingAudits(Integer status, int page, int size);

    /**
     * 审核通过
     * @param auditId 审核记录ID
     * @param auditorId 审核人ID
     * @param remark 审核备注
     * @return 操作结果
     */
    Map<String, Object> approveAudit(Long auditId, Long auditorId, String remark);

    /**
     * 审核拒绝
     * @param auditId 审核记录ID
     * @param auditorId 审核人ID
     * @param remark 拒绝原因
     * @return 操作结果
     */
    Map<String, Object> rejectAudit(Long auditId, Long auditorId, String remark);

    /**
     * 获取审核详情
     * @param auditId 审核记录ID
     * @return 审核详情
     */
    Map<String, Object> getAuditDetail(Long auditId);
}
