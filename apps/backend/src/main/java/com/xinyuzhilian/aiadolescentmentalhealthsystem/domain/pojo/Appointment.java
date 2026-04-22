package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("appointment")
public class Appointment implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;

    @TableField("patient_contact_id")
    private Long patientContactId;

    @TableField("doctor_id")
    private Long doctorId;

    @TableField("schedule_id")
    private Long scheduleId;

    private String description; // 病情描述
    private java.math.BigDecimal fee; // 挂号�?    @TableField("pay_status")
    private Integer payStatus; // 0-Unpaid, 1-Paid, 2-Refunded
    @TableField("pay_time")
    private LocalDateTime payTime;

    private Integer status; // 0-Pending Diagnosis(Paid), 1-Completed, 2-Cancelled, 3-Missed, 4-Unpaid

    private Integer type; // 预约类型(0-线下, 1-线上)

    @TableField("is_rescheduled")
    private Integer isRescheduled; // 是否已改期(0-否, 1-是)

    @TableField("create_time")
    private LocalDateTime createTime;
}
