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
 * 用户-心理咨询师咨询记录表
 * 存储用户咨询过的心理师记录，用于展示"咨询过的心理咨询师"
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("user_psychologist_history")
@ApiModel(value = "UserPsychologistHistory对象", description = "用户-心理咨询师咨询记录表")
public class UserPsychologistHistory implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "用户ID")
    @TableField("user_id")
    private Long userId;

    @ApiModelProperty(value = "心理咨询师ID")
    @TableField("psychologist_id")
    private Long psychologistId;

    @ApiModelProperty(value = "预约次数")
    @TableField("appointment_count")
    private Integer appointmentCount;

    @ApiModelProperty(value = "最后一次预约时间")
    @TableField("last_appointment_time")
    private LocalDateTime lastAppointmentTime;

    @ApiModelProperty(value = "最后一次预约ID")
    @TableField("last_appointment_id")
    private Long lastAppointmentId;

    @ApiModelProperty(value = "首次咨询时间")
    @TableField("create_time")
    private LocalDateTime createTime;

    @ApiModelProperty(value = "更新时间")
    @TableField("update_time")
    private LocalDateTime updateTime;
}
