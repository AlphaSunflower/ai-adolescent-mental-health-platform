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
import java.time.LocalDateTime;

/**
 * 心理咨询师资料变更审核表
 * 存储心理师资料变更的审核记录
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("psychologist_profile_audit")
@ApiModel(value = "PsychologistProfileAudit对象", description = "心理咨询师资料变更审核表")
public class PsychologistProfileAudit implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "心理咨询师ID")
    @TableField("psychologist_id")
    private Long psychologistId;

    @ApiModelProperty(value = "变更字段名")
    @TableField("field_name")
    private String fieldName;

    @ApiModelProperty(value = "原值")
    @TableField("old_value")
    private String oldValue;

    @ApiModelProperty(value = "新值")
    @TableField("new_value")
    private String newValue;

    @ApiModelProperty(value = "证明材料URLs（JSON数组）")
    @TableField("proof_urls")
    private String proofUrls;

    @ApiModelProperty(value = "审核状态（0-待审核，1-已通过，2-已拒绝）")
    @TableField("audit_status")
    private Integer auditStatus;

    @ApiModelProperty(value = "审核备注")
    @TableField("audit_remark")
    private String auditRemark;

    @ApiModelProperty(value = "申请理由")
    @TableField("reason")
    private String reason;

    @ApiModelProperty(value = "审核人ID")
    @TableField("auditor_id")
    private Long auditorId;

    @ApiModelProperty(value = "审核时间")
    @TableField("audit_time")
    private LocalDateTime auditTime;

    @ApiModelProperty(value = "申请时间")
    @TableField("create_time")
    private LocalDateTime createTime;

    // ========== 审核状态常量 ==========

    /** 待审核 */
    public static final int STATUS_PENDING = 0;
    /** 已通过 */
    public static final int STATUS_PASSED = 1;
    /** 已拒绝 */
    public static final int STATUS_REJECTED = 2;

    // ========== 变更字段名常量 ==========

    /** 资质标签 */
    public static final String FIELD_QUALIFICATION = "qualification";
    /** 擅长领域 */
    public static final String FIELD_FIELD = "field";
    /** 价格 */
    public static final String FIELD_PRICE = "price";
    /** 线下价格 */
    public static final String FIELD_OFFLINE_PRICE = "offline_price";
    /** 姓名 */
    public static final String FIELD_NAME = "name";
    /** 咨询经验年限 */
    public static final String FIELD_YEARS_EXPERIENCE = "years_experience";
}
