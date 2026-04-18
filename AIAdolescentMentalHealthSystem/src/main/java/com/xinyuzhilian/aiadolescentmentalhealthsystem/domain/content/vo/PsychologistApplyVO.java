package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 心理咨询师入驻申请VO
 */
@Data
@ApiModel(value = "PsychologistApplyVO对象", description = "心理咨询师入驻申请视图对象")
public class PsychologistApplyVO {

    @ApiModelProperty(value = "申请ID")
    private Long id;

    @ApiModelProperty(value = "用户ID")
    private Long userId;

    @ApiModelProperty(value = "申请次数")
    private Integer applyCount;

    @ApiModelProperty(value = "状态")
    private String status;

    @ApiModelProperty(value = "状态名称")
    private String statusName;

    @ApiModelProperty(value = "当前步骤")
    private String step;

    @ApiModelProperty(value = "步骤名称")
    private String stepName;

    // 基本资料
    @ApiModelProperty(value = "真实姓名")
    private String realName;

    @ApiModelProperty(value = "手机号")
    private String phone;

    @ApiModelProperty(value = "国家/地区")
    private String country;

    @ApiModelProperty(value = "联系方式")
    private String contactWechat;

    @ApiModelProperty(value = "咨询个案时长")
    private String caseHours;

    @ApiModelProperty(value = "咨询个案时长名称")
    private String caseHoursName;

    @ApiModelProperty(value = "个体督导时长")
    private String supervisionHours;

    @ApiModelProperty(value = "个体督导时长名称")
    private String supervisionHoursName;

    @ApiModelProperty(value = "咨询定价")
    private BigDecimal consultationPrice;

    @ApiModelProperty(value = "个人简历URL")
    private String resumeUrl;

    @ApiModelProperty(value = "学历及相关专业")
    private String education;

    // 案例报告
    @ApiModelProperty(value = "专业资质材料URL列表")
    private String qualificationUrls;

    @ApiModelProperty(value = "督导证明URL列表")
    private String supervisionProofUrls;

    @ApiModelProperty(value = "个人体验证明URL列表")
    private String experienceProofUrls;

    @ApiModelProperty(value = "其他相关证明URL列表")
    private String otherProofUrls;

    @ApiModelProperty(value = "个人自我叙述")
    private String selfNarration;

    // 审核信息
    @ApiModelProperty(value = "拒绝/失败原因")
    private String rejectReason;

    @ApiModelProperty(value = "笔试截止时间")
    private LocalDateTime examDeadline;

    @ApiModelProperty(value = "笔试结果(-1-未开始,0-进行中,1-通过,2-失败)")
    private Integer paperResult;

    @ApiModelProperty(value = "笔试结果名称")
    private String paperResultName;

    @ApiModelProperty(value = "案例报告结果")
    private Integer reportResult;

    @ApiModelProperty(value = "案例报告结果名称")
    private String reportResultName;

    @ApiModelProperty(value = "面谈结果")
    private Integer interviewResult;

    @ApiModelProperty(value = "面谈结果名称")
    private String interviewResultName;

    @ApiModelProperty(value = "面谈时间")
    private LocalDateTime interviewTime;

    @ApiModelProperty(value = "面谈地点")
    private String interviewLocation;

    @ApiModelProperty(value = "审核人ID")
    private Long reviewerId;

    @ApiModelProperty(value = "审核时间")
    private LocalDateTime reviewTime;

    // 用户信息
    @ApiModelProperty(value = "用户昵称")
    private String userNickname;

    @ApiModelProperty(value = "用户头像")
    private String userAvatar;

    @ApiModelProperty(value = "用户角色")
    private Integer userRole;

    // 时间
    @ApiModelProperty(value = "创建时间")
    private LocalDateTime createTime;

    @ApiModelProperty(value = "更新时间")
    private LocalDateTime updateTime;

    public String getStatusName() {
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

    public String getStepName() {
        if (step == null) return "";
        switch (step) {
            case "BASIC": return "基本资料";
            case "PAPER": return "笔试";
            case "REPORT": return "案例报告";
            case "INTERVIEW": return "面谈";
            default: return step;
        }
    }

    public String getCaseHoursName() {
        if (caseHours == null) return "";
        switch (caseHours) {
            case "less_500": return "少于500小时";
            case "500_1000": return "500-1000小时";
            case "1000_3000": return "1000-3000小时";
            case "more_3000": return "3000小时以上";
            default: return caseHours;
        }
    }

    public String getSupervisionHoursName() {
        if (supervisionHours == null) return "";
        switch (supervisionHours) {
            case "less_80": return "少于80小时";
            case "80_150": return "80-150小时";
            case "more_150": return "150小时以上";
            default: return supervisionHours;
        }
    }

    public String getPaperResultName() {
        if (paperResult == null) return "未开始";
        switch (paperResult) {
            case -1: return "未开始";
            case 0: return "进行中";
            case 1: return "通过";
            case 2: return "未通过";
            default: return String.valueOf(paperResult);
        }
    }

    public String getReportResultName() {
        if (reportResult == null) return "未提交";
        switch (reportResult) {
            case -1: return "未提交";
            case 0: return "待审核";
            case 1: return "通过";
            case 2: return "未通过";
            default: return String.valueOf(reportResult);
        }
    }

    public String getInterviewResultName() {
        if (interviewResult == null) return "未开始";
        switch (interviewResult) {
            case -1: return "未开始";
            case 0: return "待审核";
            case 1: return "通过";
            case 2: return "未通过";
            default: return String.valueOf(interviewResult);
        }
    }
}
