package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto.PsychologistBasicRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto.PsychologistReportRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.PsychologistApplyVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistApply;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 心理咨询师入驻申请服务接口
 */
public interface IPsychologistApplyService extends IService<PsychologistApply> {

    /**
     * 检查用户是否有资格申请入驻
     * @param userId 用户ID
     * @return 检查结果和原因
     */
    Map<String, Object> checkApplyEligibility(Long userId);

    /**
     * 获取当前用户的入驻状态
     * @param userId 用户ID
     * @return 入驻状态信息
     */
    Map<String, Object> getApplyStatus(Long userId);

    /**
     * 提交基本资料
     * @param userId 用户ID
     * @param request 基本资料请求
     * @return 操作结果
     */
    Result<String> submitBasicInfo(Long userId, PsychologistBasicRequest request);

    /**
     * 提交案例报告
     * @param userId 用户ID
     * @param request 案例报告请求
     * @return 操作结果
     */
    Result<String> submitReport(Long userId, PsychologistReportRequest request);

    /**
     * 获取入驻申请详情
     * @param userId 用户ID
     * @return 申请详情
     */
    PsychologistApplyVO getApplyDetail(Long userId);

    /**
     * 获取进行中的入驻申请
     * @param userId 用户ID
     * @return 入驻申请
     */
    PsychologistApply getCurrentApply(Long userId);

    /**
     * 获取所有入驻申请列表（管理员用）
     * @param status 状态筛选（可选）
     * @return 申请列表
     */
    List<PsychologistApplyVO> getAllApplyList(String status);

    /**
     * 获取已通过的心理咨询师列表（管理员用）
     * @return 心理咨询师列表
     */
    List<PsychologistApplyVO> getApprovedPsychologists();

    /**
     * 根据ID获取申请详情（管理员用）
     * @param id 申请ID
     * @return 申请详情
     */
    PsychologistApplyVO getApplyById(Long id);

    /**
     * 审批基础审核（管理员用）
     * @param id 申请ID
     * @param adminId 管理员ID
     * @return 操作结果
     */
    Result<String> approveBasicReview(Long id, Long adminId);

    /**
     * 驳回申请（管理员用）
     * @param id 申请ID
     * @param reason 驳回原因
     * @param adminId 管理员ID
     * @return 操作结果
     */
    Result<String> rejectApply(Long id, String reason, Long adminId);

    /**
     * 标记笔试结果（管理员用）
     * @param id 申请ID
     * @param result 结果（1-通过，2-不通过）
     * @param adminId 管理员ID
     * @return 操作结果
     */
    Result<String> markPaperResult(Long id, int result, Long adminId);

    /**
     * 标记案例报告结果（管理员用）
     * @param id 申请ID
     * @param result 结果（1-通过，2-不通过）
     * @param adminId 管理员ID
     * @return 操作结果
     */
    Result<String> markReportResult(Long id, int result, Long adminId);

    /**
     * 标记面试结果（管理员用）
     * @param id 申请ID
     * @param result 结果（1-通过，2-不通过）
     * @param feedback 面试反馈
     * @param interviewTime 面试时间
     * @param adminId 管理员ID
     * @return 操作结果
     */
    Result<String> markInterviewResult(Long id, int result, String feedback, LocalDateTime interviewTime, Long adminId);
}
