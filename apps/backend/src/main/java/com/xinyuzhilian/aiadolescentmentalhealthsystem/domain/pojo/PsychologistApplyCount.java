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
 * 心理咨询师申请次数记录表实体
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("psychologist_apply_count")
@ApiModel(value = "PsychologistApplyCount对象", description = "心理咨询师申请次数记录表")
public class PsychologistApplyCount implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "user_id", type = IdType.INPUT)
    private Long userId;

    @ApiModelProperty(value = "累计申请次数")
    @TableField("apply_count")
    private Integer applyCount;

    @ApiModelProperty(value = "最后申请时间")
    @TableField("last_apply_time")
    private LocalDateTime lastApplyTime;

    @ApiModelProperty(value = "是否永久拒绝(0-否,1-是)")
    @TableField("permanently_rejected")
    private Integer permanentlyRejected;
}
