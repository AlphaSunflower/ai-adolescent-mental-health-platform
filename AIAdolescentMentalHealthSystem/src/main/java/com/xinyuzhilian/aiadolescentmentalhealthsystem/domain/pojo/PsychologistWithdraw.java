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
 * 心理咨询师提现记录表
 * 存储心理师的提现申请记录
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("psychologist_withdraw")
@ApiModel(value = "PsychologistWithdraw对象", description = "心理咨询师提现记录表")
public class PsychologistWithdraw implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "心理咨询师ID")
    @TableField("psychologist_id")
    private Long psychologistId;

    @ApiModelProperty(value = "提现金额")
    private BigDecimal amount;

    @ApiModelProperty(value = "状态（0-处理中，1-已提现，2-已拒绝）")
    private Integer status;

    @ApiModelProperty(value = "银行名称")
    @TableField("bank_name")
    private String bankName;

    @ApiModelProperty(value = "银行账号")
    @TableField("bank_account")
    private String bankAccount;

    @ApiModelProperty(value = "开户名")
    @TableField("account_name")
    private String accountName;

    @ApiModelProperty(value = "备注")
    private String remark;

    @ApiModelProperty(value = "申请时间")
    @TableField("create_time")
    private LocalDateTime createTime;

    @ApiModelProperty(value = "处理时间")
    @TableField("process_time")
    private LocalDateTime processTime;

    // ========== 状态常量 ==========

    /** 处理中 */
    public static final int STATUS_PROCESSING = 0;
    /** 已提现 */
    public static final int STATUS_SUCCESS = 1;
    /** 已拒绝 */
    public static final int STATUS_REJECTED = 2;
}
