package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto.PsychologistBasicRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto.PsychologistReportRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.PsychologistApplyVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistApply;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistApplyCount;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.PsychologistApplyCountMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.PsychologistApplyMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPsychologistApplyService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ISysMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 心理咨询师入驻申请服务实现
 */
@Service
@RequiredArgsConstructor
public class PsychologistApplyServiceImpl extends ServiceImpl<PsychologistApplyMapper, PsychologistApply>
        implements IPsychologistApplyService {

    private final PsychologistApplyCountMapper applyCountMapper;
    private final UserMapper userMapper;
    private final ISysMessageService sysMessageService;
    private final ObjectMapper objectMapper;

    /** 申请次数上限 */
    private static final int MAX_APPLY_COUNT = 3;
    /** 申请间隔月数 */
    private static final int APPLY_INTERVAL_MONTHS = 6;

    @Override
    public Map<String, Object> checkApplyEligibility(Long userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("eligible", true);

        // 检查是否已经是心理咨询师
        User user = userMapper.selectById(userId);
        if (user != null && user.getIsPsychologist() != null && user.getIsPsychologist() == 1) {
            result.put("eligible", false);
            result.put("reason", "您已经是心理咨询师，无需再次申请");
            return result;
        }

        // 获取申请记录
        PsychologistApplyCount applyCount = applyCountMapper.selectById(userId);

        // 检查是否永久拒绝
        if (applyCount != null && applyCount.getPermanentlyRejected() != null
                && applyCount.getPermanentlyRejected() == 1) {
            result.put("eligible", false);
            result.put("reason", "您已申请3次，无法再次申请入驻");
            return result;
        }

        // 检查申请次数
        int count = applyCount != null ? applyCount.getApplyCount() : 0;
        if (count >= MAX_APPLY_COUNT) {
            // 永久拒绝
            if (applyCount != null) {
                applyCount.setPermanentlyRejected(1);
                applyCountMapper.updateById(applyCount);
            }
            result.put("eligible", false);
            result.put("reason", "您已申请3次，无法再次申请入驻");
            return result;
        }

        // 检查申请间隔（6个月）
        if (applyCount != null && applyCount.getLastApplyTime() != null) {
            LocalDateTime lastApply = applyCount.getLastApplyTime();
            long monthsBetween = ChronoUnit.MONTHS.between(lastApply, LocalDateTime.now());
            if (monthsBetween < APPLY_INTERVAL_MONTHS) {
                long remainingDays = (APPLY_INTERVAL_MONTHS - monthsBetween) * 30;
                result.put("eligible", false);
                result.put("reason", "距离上次申请未满6个月，请稍后再试");
                result.put("remainingDays", remainingDays);
                return result;
            }
        }

        // 检查是否有进行中的申请
        PsychologistApply currentApply = getCurrentApply(userId);
        if (currentApply != null && !PsychologistApply.STATUS_REJECTED.equals(currentApply.getStatus())
                && !PsychologistApply.STATUS_APPROVED.equals(currentApply.getStatus())) {
            result.put("eligible", false);
            result.put("reason", "您有正在处理中的入驻申请，请等待处理完成");
            result.put("status", currentApply.getStatus());
            return result;
        }

        result.put("remainingAttempts", MAX_APPLY_COUNT - count);
        return result;
    }

    @Override
    public Map<String, Object> getApplyStatus(Long userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("hasApply", false);
        result.put("isPsychologist", false);

        // 检查是否已经是心理咨询师
        User user = userMapper.selectById(userId);
        if (user != null && user.getIsPsychologist() != null && user.getIsPsychologist() == 1) {
            result.put("isPsychologist", true);
            result.put("status", "APPROVED");
            result.put("statusName", "已成功入驻");
            return result;
        }

        // 获取进行中的申请
        PsychologistApply apply = getCurrentApply(userId);
        if (apply != null) {
            result.put("hasApply", true);
            result.put("applyId", apply.getId());
            result.put("status", apply.getStatus());
            result.put("statusName", getStatusName(apply.getStatus()));
            result.put("step", apply.getStep());
            result.put("stepName", getStepName(apply.getStep()));
            result.put("rejectReason", apply.getRejectReason());
            result.put("paperResult", apply.getPaperResult());
            result.put("reportResult", apply.getReportResult());
            result.put("interviewResult", apply.getInterviewResult());
            result.put("examDeadline", apply.getExamDeadline());
            result.put("interviewTime", apply.getInterviewTime());
            result.put("interviewLocation", apply.getInterviewLocation());
        }

        // 获取申请次数信息
        PsychologistApplyCount applyCount = applyCountMapper.selectById(userId);
        if (applyCount != null) {
            result.put("applyCount", applyCount.getApplyCount());
            result.put("remainingAttempts", MAX_APPLY_COUNT - applyCount.getApplyCount());
        } else {
            result.put("applyCount", 0);
            result.put("remainingAttempts", MAX_APPLY_COUNT);
        }

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> submitBasicInfo(Long userId, PsychologistBasicRequest request) {
        // 校验资格
        Map<String, Object> eligibility = checkApplyEligibility(userId);
        if (!(Boolean) eligibility.get("eligible")) {
            return Result.error((String) eligibility.get("reason"));
        }

        // 创建或更新申请
        PsychologistApply apply = getCurrentApply(userId);
        boolean isNew = false;

        if (apply == null) {
            apply = new PsychologistApply();
            apply.setUserId(userId);
            apply.setStatus(PsychologistApply.STATUS_FILLING);
            apply.setStep(PsychologistApply.STEP_BASIC);
            apply.setCreateTime(LocalDateTime.now());
            apply.setUpdateTime(LocalDateTime.now());
            isNew = true;
        } else {
            apply.setStatus(PsychologistApply.STATUS_REVIEWING);
            apply.setUpdateTime(LocalDateTime.now());
        }

        // 填充基本资料
        apply.setRealName(request.getRealName());
        apply.setPhone(request.getPhone());
        apply.setCountry(request.getCountry() != null ? request.getCountry() : "中国");
        apply.setContactWechat(request.getContactWechat());
        apply.setCaseHours(request.getCaseHours());
        apply.setSupervisionHours(request.getSupervisionHours());
        apply.setConsultationPrice(request.getConsultationPrice());
        apply.setResumeUrl(request.getResumeUrl());
        apply.setEducation(request.getEducation());

        if (isNew) {
            this.save(apply);

            // 更新申请次数
            PsychologistApplyCount applyCount = applyCountMapper.selectById(userId);
            if (applyCount == null) {
                applyCount = new PsychologistApplyCount();
                applyCount.setUserId(userId);
                applyCount.setApplyCount(1);
                applyCount.setLastApplyTime(LocalDateTime.now());
                applyCount.setPermanentlyRejected(0);
                applyCountMapper.insert(applyCount);
            } else {
                applyCount.setApplyCount(applyCount.getApplyCount() + 1);
                applyCount.setLastApplyTime(LocalDateTime.now());
                applyCountMapper.updateById(applyCount);
            }
            apply.setApplyCount(applyCount.getApplyCount());
        } else {
            this.updateById(apply);
        }

        // 发送消息通知管理员审核
        sysMessageService.sendMessage(userId, "入驻申请已提交",
                "您的心理咨询师入驻申请已提交基本资料，等待管理员审核。", 1);

        return Result.success("基本资料提交成功，等待管理员审核");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> submitReport(Long userId, PsychologistReportRequest request) {
        // 获取当前申请
        PsychologistApply apply = getCurrentApply(userId);
        if (apply == null) {
            return Result.error("未找到进行中的入驻申请");
        }

        if (!PsychologistApply.STATUS_REPORT.equals(apply.getStatus())) {
            return Result.error("当前状态不允许提交案例报告");
        }

        // 填充案例报告
        try {
            apply.setQualificationUrls(toJson(request.getQualificationUrls()));
            apply.setSupervisionProofUrls(toJson(request.getSupervisionProofUrls()));
            apply.setExperienceProofUrls(toJson(request.getExperienceProofUrls()));
            apply.setOtherProofUrls(toJson(request.getOtherProofUrls()));
        } catch (JsonProcessingException e) {
            return Result.error("附件信息处理失败");
        }

        apply.setSelfNarration(request.getSelfNarration());
        apply.setReportResult(PsychologistApply.RESULT_PENDING);
        apply.setUpdateTime(LocalDateTime.now());

        this.updateById(apply);

        // 发送消息通知
        sysMessageService.sendMessage(userId, "案例报告已提交",
                "您的案例报告已提交，等待管理员审核。", 1);

        return Result.success("案例报告提交成功");
    }

    @Override
    public PsychologistApplyVO getApplyDetail(Long userId) {
        PsychologistApply apply = getCurrentApply(userId);
        if (apply == null) {
            return null;
        }
        return convertToVO(apply);
    }

    @Override
    public PsychologistApply getCurrentApply(Long userId) {
        LambdaQueryWrapper<PsychologistApply> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PsychologistApply::getUserId, userId)
                .ne(PsychologistApply::getStatus, PsychologistApply.STATUS_REJECTED)
                .orderByDesc(PsychologistApply::getCreateTime)
                .last("LIMIT 1");
        return this.getOne(wrapper);
    }

    /**
     * 更新申请状态
     */
    @Transactional(rollbackFor = Exception.class)
    public Result<String> updateApplyStatus(Long applyId, String status, String rejectReason, Long reviewerId) {
        PsychologistApply apply = this.getById(applyId);
        if (apply != null) {
            apply.setStatus(status);
            if (rejectReason != null) {
                apply.setRejectReason(rejectReason);
            }
            if (reviewerId != null) {
                apply.setReviewerId(reviewerId);
                apply.setReviewTime(LocalDateTime.now());
            }
            apply.setUpdateTime(LocalDateTime.now());
            this.updateById(apply);
        }
        return Result.success("状态更新成功");
    }

    /**
     * 标记笔试结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> markPaperResult(Long applyId, int result, Long reviewerId) {
        PsychologistApply apply = this.getById(applyId);
        if (apply != null) {
            apply.setPaperResult(result);
            if (reviewerId != null) {
                apply.setReviewerId(reviewerId);
                apply.setReviewTime(LocalDateTime.now());
            }

            if (result == PsychologistApply.RESULT_PASS) {
                apply.setStatus(PsychologistApply.STATUS_REPORT);
                apply.setStep(PsychologistApply.STEP_REPORT);
                sysMessageService.sendMessage(apply.getUserId(), "笔试通过",
                        "恭喜！您已通过入驻笔试考核。请提交案例报告。", 1);
                return Result.success("笔试通过，已进入案例报告阶段");
            } else if (result == PsychologistApply.RESULT_FAIL) {
                apply.setStatus(PsychologistApply.STATUS_REJECTED);
                sysMessageService.sendMessage(apply.getUserId(), "笔试结果",
                        "很遗憾，您的笔试未通过。", 1);
                return Result.success("笔试未通过");
            }
            apply.setUpdateTime(LocalDateTime.now());
            this.updateById(apply);
        }
        return Result.error("申请不存在");
    }

    /**
     * 标记案例报告结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> markReportResult(Long applyId, int result, Long reviewerId) {
        PsychologistApply apply = this.getById(applyId);
        if (apply != null) {
            apply.setReportResult(result);
            if (reviewerId != null) {
                apply.setReviewerId(reviewerId);
                apply.setReviewTime(LocalDateTime.now());
            }

            if (result == PsychologistApply.RESULT_PASS) {
                apply.setStatus(PsychologistApply.STATUS_INTERVIEW);
                apply.setStep(PsychologistApply.STEP_INTERVIEW);
                sysMessageService.sendMessage(apply.getUserId(), "案例报告审核通过",
                        "恭喜！您的案例报告审核通过。请等待线下面谈通知。", 1);
                return Result.success("案例报告通过，已进入面谈阶段");
            } else if (result == PsychologistApply.RESULT_FAIL) {
                apply.setStatus(PsychologistApply.STATUS_REJECTED);
                sysMessageService.sendMessage(apply.getUserId(), "案例报告结果",
                        "很遗憾，您的案例报告未通过审核。", 1);
                return Result.success("案例报告未通过");
            }
            apply.setUpdateTime(LocalDateTime.now());
            this.updateById(apply);
        }
        return Result.error("申请不存在");
    }

    /**
     * 安排或标记面谈结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> markInterviewResult(Long applyId, int result, String feedback, LocalDateTime interviewTime, Long reviewerId) {
        PsychologistApply apply = this.getById(applyId);
        if (apply != null) {
            apply.setInterviewResult(result);
            if (reviewerId != null) {
                apply.setReviewerId(reviewerId);
                apply.setReviewTime(LocalDateTime.now());
            }
            if (feedback != null) {
                apply.setInterviewLocation(feedback);
            }
            if (interviewTime != null) {
                apply.setInterviewTime(interviewTime);
            }

            if (result == PsychologistApply.RESULT_PASS) {
                apply.setStatus(PsychologistApply.STATUS_APPROVED);
                User user = userMapper.selectById(apply.getUserId());
                if (user != null) {
                    user.setIsPsychologist(1);
                    userMapper.updateById(user);
                }
                sysMessageService.sendMessage(apply.getUserId(), "恭喜入驻成功",
                        "恭喜！您已成功入驻成为心理咨询师。", 1);
                return Result.success("面谈通过，心理咨询师入驻成功");
            } else if (result == PsychologistApply.RESULT_FAIL) {
                apply.setStatus(PsychologistApply.STATUS_REJECTED);
                sysMessageService.sendMessage(apply.getUserId(), "入驻申请结果",
                        "很遗憾，您的入驻申请未通过最终审核。", 1);
                return Result.success("面谈未通过");
            }
            apply.setUpdateTime(LocalDateTime.now());
            this.updateById(apply);
        }
        return Result.error("申请不存在");
    }

    /**
     * 审核通过（第一步资料审核）
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> approveBasicReview(Long applyId, Long reviewerId) {
        PsychologistApply apply = this.getById(applyId);
        if (apply != null) {
            apply.setStatus(PsychologistApply.STATUS_PAPER);
            apply.setStep(PsychologistApply.STEP_PAPER);
            apply.setExamDeadline(LocalDateTime.now().plusWeeks(1));
            apply.setPaperResult(PsychologistApply.RESULT_PENDING);
            if (reviewerId != null) {
                apply.setReviewerId(reviewerId);
                apply.setReviewTime(LocalDateTime.now());
            }
            apply.setUpdateTime(LocalDateTime.now());
            this.updateById(apply);

            sysMessageService.sendMessage(apply.getUserId(), "入驻申请资料审核通过",
                    "恭喜！您的入驻申请资料审核通过。请在1周内完成笔试考核，考核时间及相关事宜将通过微信与您沟通确认。", 1);
            return Result.success("资料审核通过，已进入笔试阶段");
        }
        return Result.error("申请不存在");
    }

    /**
     * 审核拒绝
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> rejectApply(Long applyId, String reason, Long reviewerId) {
        PsychologistApply apply = this.getById(applyId);
        if (apply != null) {
            apply.setStatus(PsychologistApply.STATUS_REJECTED);
            apply.setRejectReason(reason);
            if (reviewerId != null) {
                apply.setReviewerId(reviewerId);
                apply.setReviewTime(LocalDateTime.now());
            }
            apply.setUpdateTime(LocalDateTime.now());
            this.updateById(apply);

            sysMessageService.sendMessage(apply.getUserId(), "入驻申请审核结果",
                    "感谢您入驻我们，但是不符合我们的条件~" + (reason != null ? "原因：" + reason : ""), 1);
            return Result.success("申请已驳回");
        }
        return Result.error("申请不存在");
    }

    @Override
    public List<PsychologistApplyVO> getAllApplyList(String status) {
        LambdaQueryWrapper<PsychologistApply> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty() && !status.equals("ALL")) {
            wrapper.eq(PsychologistApply::getStatus, status);
        }
        wrapper.orderByDesc(PsychologistApply::getCreateTime);
        List<PsychologistApply> list = this.list(wrapper);
        return list.stream().map(this::convertToVO).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<PsychologistApplyVO> getApprovedPsychologists() {
        LambdaQueryWrapper<PsychologistApply> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PsychologistApply::getStatus, PsychologistApply.STATUS_APPROVED);
        wrapper.orderByDesc(PsychologistApply::getUpdateTime);
        List<PsychologistApply> list = this.list(wrapper);
        return list.stream().map(this::convertToVO).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public PsychologistApplyVO getApplyById(Long id) {
        PsychologistApply apply = this.getById(id);
        return convertToVO(apply);
    }

    private PsychologistApplyVO convertToVO(PsychologistApply apply) {
        if (apply == null) return null;

        PsychologistApplyVO vo = new PsychologistApplyVO();
        vo.setId(apply.getId());
        vo.setUserId(apply.getUserId());
        vo.setApplyCount(apply.getApplyCount());
        vo.setStatus(apply.getStatus());
        vo.setStep(apply.getStep());
        vo.setRealName(apply.getRealName());
        vo.setPhone(apply.getPhone());
        vo.setCountry(apply.getCountry());
        vo.setContactWechat(apply.getContactWechat());
        vo.setCaseHours(apply.getCaseHours());
        vo.setSupervisionHours(apply.getSupervisionHours());
        vo.setConsultationPrice(apply.getConsultationPrice());
        vo.setResumeUrl(apply.getResumeUrl());
        vo.setEducation(apply.getEducation());
        vo.setQualificationUrls(apply.getQualificationUrls());
        vo.setSupervisionProofUrls(apply.getSupervisionProofUrls());
        vo.setExperienceProofUrls(apply.getExperienceProofUrls());
        vo.setOtherProofUrls(apply.getOtherProofUrls());
        vo.setSelfNarration(apply.getSelfNarration());
        vo.setRejectReason(apply.getRejectReason());
        vo.setExamDeadline(apply.getExamDeadline());
        vo.setPaperResult(apply.getPaperResult());
        vo.setReportResult(apply.getReportResult());
        vo.setInterviewResult(apply.getInterviewResult());
        vo.setInterviewTime(apply.getInterviewTime());
        vo.setInterviewLocation(apply.getInterviewLocation());
        vo.setReviewerId(apply.getReviewerId());
        vo.setReviewTime(apply.getReviewTime());
        vo.setCreateTime(apply.getCreateTime());
        vo.setUpdateTime(apply.getUpdateTime());

        // 获取用户信息
        if (apply.getUserId() != null) {
            User user = userMapper.selectById(apply.getUserId());
            if (user != null) {
                vo.setUserNickname(user.getNickname());
                vo.setUserAvatar(user.getHeadPath());
                vo.setUserRole(user.getRole());
            }
        }

        return vo;
    }

    private String getStatusName(String status) {
        if (status == null) return "";
        switch (status) {
            case "FILLING": return "填写资料中";
            case "REVIEWING": return "管理员审核中";
            case "PAPER": return "笔试考核阶段";
            case "REPORT": return "案例报告阶段";
            case "INTERVIEW": return "线下面谈阶段";
            case "APPROVED": return "入驻成功";
            case "REJECTED": return "入驻失败";
            default: return status;
        }
    }

    private String getStepName(String step) {
        if (step == null) return "";
        switch (step) {
            case "BASIC": return "基本资料";
            case "PAPER": return "笔试";
            case "REPORT": return "案例报告";
            case "INTERVIEW": return "面谈";
            default: return step;
        }
    }

    private String toJson(List<String> list) throws JsonProcessingException {
        if (list == null || list.isEmpty()) {
            return "[]";
        }
        return objectMapper.writeValueAsString(list);
    }
}
