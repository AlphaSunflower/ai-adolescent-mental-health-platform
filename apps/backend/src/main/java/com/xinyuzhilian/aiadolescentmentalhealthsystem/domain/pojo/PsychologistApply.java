package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 心理咨询师入驻申请表实体
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("psychologist_apply")
@ApiModel(value = "PsychologistApply对象", description = "心理咨询师入驻申请表")
public class PsychologistApply implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "用户ID")
    @TableField("user_id")
    private Long userId;

    @ApiModelProperty(value = "申请次数(第几次申请)")
    @TableField("apply_count")
    private Integer applyCount;

    @ApiModelProperty(value = "状态(FILLING-填写资料,REVIEWING-管理员审核,PAPER-笔试考核,REPORT-案例报告,INTERVIEW-线下面谈,APPROVED-入驻成功,REJECTED-入驻失败)")
    @TableField("status")
    private String status;

    @ApiModelProperty(value = "当前步骤(BASIC-基本资料,PAPER-笔试,REPORT-案例报告,INTERVIEW-面谈)")
    @TableField("step")
    private String step;

    // ==================== 基本资料字段 ====================

    @ApiModelProperty(value = "真实姓名")
    @TableField("real_name")
    private String realName;

    @ApiModelProperty(value = "手机号")
    @TableField("phone")
    private String phone;

    @ApiModelProperty(value = "国家/地区")
    @TableField("country")
    private String country;

    @ApiModelProperty(value = "微信/邮箱联系方式")
    @TableField("contact_wechat")
    private String contactWechat;

    @ApiModelProperty(value = "咨询个案时长(less_500/500_1000/1000_3000/more_3000)")
    @TableField("case_hours")
    private String caseHours;

    @ApiModelProperty(value = "个体督导时长(less_80/80_150/more_150)")
    @TableField("supervision_hours")
    private String supervisionHours;

    @ApiModelProperty(value = "咨询定价")
    @TableField("consultation_price")
    private BigDecimal consultationPrice;

    @ApiModelProperty(value = "个人简历附件URL")
    @TableField("resume_url")
    private String resumeUrl;

    @ApiModelProperty(value = "学历及相关专业")
    @TableField("education")
    private String education;

    // ==================== 案例报告字段 ====================

    @ApiModelProperty(value = "专业资质材料附件(JSON数组)")
    @TableField("qualification_urls")
    private String qualificationUrls;

    @ApiModelProperty(value = "督导证明附件(JSON数组)")
    @TableField("supervision_proof_urls")
    private String supervisionProofUrls;

    @ApiModelProperty(value = "个人体验证明附件(JSON数组)")
    @TableField("experience_proof_urls")
    private String experienceProofUrls;

    @ApiModelProperty(value = "其他相关证明附件(JSON数组)")
    @TableField("other_proof_urls")
    private String otherProofUrls;

    @ApiModelProperty(value = "个人自我叙述")
    @TableField("self_narration")
    private String selfNarration;

    // ==================== 审核信息 ====================

    @ApiModelProperty(value = "拒绝/失败原因")
    @TableField("reject_reason")
    private String rejectReason;

    @ApiModelProperty(value = "笔试截止时间")
    @TableField("exam_deadline")
    private LocalDateTime examDeadline;

    @ApiModelProperty(value = "笔试结果(-1-未开始,0-进行中,1-通过,2-失败)")
    @TableField("paper_result")
    private Integer paperResult;

    @ApiModelProperty(value = "案例报告结果(-1-未提交,0-待审核,1-通过,2-失败)")
    @TableField("report_result")
    private Integer reportResult;

    @ApiModelProperty(value = "面谈结果(-1-未开始,0-待审核,1-通过,2-失败)")
    @TableField("interview_result")
    private Integer interviewResult;

    @ApiModelProperty(value = "面谈时间")
    @TableField("interview_time")
    private LocalDateTime interviewTime;

    @ApiModelProperty(value = "面谈地点")
    @TableField("interview_location")
    private String interviewLocation;

    @ApiModelProperty(value = "审核人ID")
    @TableField("reviewer_id")
    private Long reviewerId;

    @ApiModelProperty(value = "审核时间")
    @TableField("review_time")
    private LocalDateTime reviewTime;

    @ApiModelProperty(value = "创建时间")
    @TableField("create_time")
    private LocalDateTime createTime;

    @ApiModelProperty(value = "更新时间")
    @TableField("update_time")
    private LocalDateTime updateTime;

    // ==================== 状态常量 ====================
    public static final String STATUS_FILLING = "FILLING";
    public static final String STATUS_REVIEWING = "REVIEWING";
    public static final String STATUS_PAPER = "PAPER";
    public static final String STATUS_REPORT = "REPORT";
    public static final String STATUS_INTERVIEW = "INTERVIEW";
    public static final String STATUS_APPROVED = "APPROVED";
    public static final String STATUS_REJECTED = "REJECTED";

    // ==================== 步骤常量 ====================
    public static final String STEP_BASIC = "BASIC";
    public static final String STEP_PAPER = "PAPER";
    public static final String STEP_REPORT = "REPORT";
    public static final String STEP_INTERVIEW = "INTERVIEW";

    // ==================== 结果常量 ====================
    public static final int RESULT_NOT_STARTED = -1;
    public static final int RESULT_PENDING = 0;
    public static final int RESULT_PASS = 1;
    public static final int RESULT_FAIL = 2;
}
