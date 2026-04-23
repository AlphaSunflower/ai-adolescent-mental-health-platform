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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 心理咨询师排班表
 * 存储心理师的预约时间排班
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("psychologist_schedule")
@ApiModel(value = "PsychologistSchedule对象", description = "心理咨询师排班表")
public class PsychologistSchedule implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "心理咨询师ID")
    @TableField("psychologist_id")
    private Long psychologistId;

    @ApiModelProperty(value = "排班日期")
    @TableField("schedule_date")
    private LocalDate scheduleDate;

    @ApiModelProperty(value = "时段（MORNING-上午，AFTERNOON-下午，EVENING-晚上）")
    @TableField("time_slot")
    private String timeSlot;

    @ApiModelProperty(value = "开始时间")
    @TableField("start_time")
    private LocalTime startTime;

    @ApiModelProperty(value = "结束时间")
    @TableField("end_time")
    private LocalTime endTime;

    @ApiModelProperty(value = "最大预约人数")
    @TableField("max_appointments")
    private Integer maxAppointments;

    @ApiModelProperty(value = "已预约人数")
    @TableField("booked_count")
    private Integer bookedCount;

    @ApiModelProperty(value = "状态（0-休息，1-可预约）")
    private Integer status;

    @ApiModelProperty(value = "创建时间")
    @TableField("create_time")
    private LocalDateTime createTime;

    @ApiModelProperty(value = "更新时间")
    @TableField("update_time")
    private LocalDateTime updateTime;

    // ========== 时段常量 ==========

    /** 上午 */
    public static final String SLOT_MORNING = "MORNING";
    /** 下午 */
    public static final String SLOT_AFTERNOON = "AFTERNOON";
    /** 晚上 */
    public static final String SLOT_EVENING = "EVENING";

    // ========== 状态常量 ==========

    /** 休息 */
    public static final int STATUS_REST = 0;
    /** 可预约 */
    public static final int STATUS_AVAILABLE = 1;

    /**
     * 获取剩余可预约人数
     */
    public int getAvailableCount() {
        if (maxAppointments == null || bookedCount == null) {
            return 0;
        }
        return Math.max(0, maxAppointments - bookedCount);
    }
}
