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
 * 心理咨询师收入表
 * 存储心理师的收入记录
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("psychologist_income")
@ApiModel(value = "PsychologistIncome对象", description = "心理咨询师收入表")
public class PsychologistIncome implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "心理咨询师ID")
    @TableField("psychologist_id")
    private Long psychologistId;

    @ApiModelProperty(value = "预约ID")
    @TableField("appointment_id")
    private Long appointmentId;

    @ApiModelProperty(value = "订单金额")
    @TableField("order_fee")
    private BigDecimal orderFee;

    @ApiModelProperty(value = "抽成比例")
    @TableField("commission_rate")
    private BigDecimal commissionRate;

    @ApiModelProperty(value = "抽成金额")
    @TableField("commission_amount")
    private BigDecimal commissionAmount;

    @ApiModelProperty(value = "实际收入")
    @TableField("income_amount")
    private BigDecimal incomeAmount;

    @ApiModelProperty(value = "用户评分")
    @TableField("rating_score")
    private BigDecimal ratingScore;

    @ApiModelProperty(value = "创建时间")
    @TableField("create_time")
    private LocalDateTime createTime;
}
