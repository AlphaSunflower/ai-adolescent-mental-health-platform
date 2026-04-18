package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("doctor_schedule")
public class DoctorSchedule implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("doctor_id")
    private Long doctorId;

    @TableField("work_date")
    private LocalDate workDate;

    @TableField("work_shift")
    private Integer workShift; // 1-Morning, 2-Afternoon, 3-Night

    @TableField("max_patients")
    private Integer maxPatients;

    @TableField("booked_count")
    private Integer bookedCount;

    private Integer status; // 0-Stop, 1-Normal

    @TableField("create_time")
    private LocalDateTime createTime;
}
