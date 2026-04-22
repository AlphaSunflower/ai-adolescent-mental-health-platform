package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
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
 * 平台收入表
 * 统一记录平台各模块的收入来源，支持可拓展
 *
 * 收入模块（income_module）：
 * - CONSULTATION：心理咨询模块收入
 * - MEMBER：会员收入（预留）
 *
 * 心理咨询收入计算规则（用户评分后触发）：
 * 评分0-1.5：抽成60%，咨询师收入40%
 * 评分1.5-3：抽成45%，咨询师收入55%
 * 评分3-4.5：抽成30%，咨询师收入70%
 * 评分4.5-5：抽成15%，咨询师收入85%
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("platform_income")
@ApiModel(value = "PlatformIncome对象", description = "平台收入表")
public class PlatformIncome implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 收入模块：CONSULTATION-心理咨询，MEMBER-会员 */
    public static final String MODULE_CONSULTATION = "CONSULTATION";
    public static final String MODULE_MEMBER = "MEMBER";

    @ApiModelProperty(value = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "收入模块：CONSULTATION-心理咨询，MEMBER-会员")
    private String incomeModule;

    @ApiModelProperty(value = "关联订单号（心理咨询模块对应预约ID）")
    private Long orderId;

    @ApiModelProperty(value = "心理咨询师ID（心理咨询模块时不为空）")
    private Long psychologistId;

    @ApiModelProperty(value = "用户ID")
    private Long userId;

    @ApiModelProperty(value = "订单总金额")
    private BigDecimal orderFee;

    @ApiModelProperty(value = "抽成比例（0-1之间的小数）")
    private BigDecimal commissionRate;

    @ApiModelProperty(value = "平台抽成金额")
    private BigDecimal commissionAmount;

    @ApiModelProperty(value = "用户评分（1-5，心理咨询模块有效）")
    private BigDecimal ratingScore;

    @ApiModelProperty(value = "备注/描述")
    private String remark;

    @ApiModelProperty(value = "创建时间")
    private LocalDateTime createTime;

    @ApiModelProperty(value = "更新时间")
    private LocalDateTime updateTime;
}
