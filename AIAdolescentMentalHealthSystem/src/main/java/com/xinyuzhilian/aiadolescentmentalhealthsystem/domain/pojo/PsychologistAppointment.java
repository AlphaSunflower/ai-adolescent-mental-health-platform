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
 * 心理咨询预约订单表
 * 存储用户的心理咨询预约订单
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("psychologist_appointment")
@ApiModel(value = "PsychologistAppointment对象", description = "心理咨询预约订单表")
public class PsychologistAppointment implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "订单编号")
    @TableField("order_no")
    private String orderNo;

    @ApiModelProperty(value = "用户ID")
    @TableField("user_id")
    private Long userId;

    @ApiModelProperty(value = "心理咨询师ID")
    @TableField("psychologist_id")
    private Long psychologistId;

    @ApiModelProperty(value = "排班ID")
    @TableField("schedule_id")
    private Long scheduleId;

    @ApiModelProperty(value = "服务类型")
    @TableField("service_type")
    private String serviceType;

    @ApiModelProperty(value = "预约时间")
    @TableField("appointment_time")
    private LocalDateTime appointmentTime;

    @ApiModelProperty(value = "费用")
    private BigDecimal fee;

    @ApiModelProperty(value = "支付状态（0-未支付，1-已支付，2-已退款）")
    @TableField("pay_status")
    private Integer payStatus;

    @ApiModelProperty(value = "支付时间")
    @TableField("pay_time")
    private LocalDateTime payTime;

    @ApiModelProperty(value = "预约状态（0-待审核，1-已确认，2-已拒绝，3-进行中，4-已完成，5-已取消，6-已爽约，7-待进行，8-已评价）")
    private Integer status;

    @ApiModelProperty(value = "拒绝/取消原因")
    @TableField("reject_reason")
    private String rejectReason;

    @ApiModelProperty(value = "视频会议链接")
    @TableField("video_link")
    private String videoLink;

    @ApiModelProperty(value = "咨询开始时间")
    @TableField("start_time")
    private LocalDateTime startTime;

    @ApiModelProperty(value = "咨询结束时间")
    @TableField("end_time")
    private LocalDateTime endTime;

    @ApiModelProperty(value = "用户基本情况（JSON）")
    @TableField("user_basic_info")
    private String userBasicInfo;

    @ApiModelProperty(value = "用户困扰描述")
    @TableField("user_problems")
    private String userProblems;

    @ApiModelProperty(value = "过往经历")
    @TableField("user_experience")
    private String userExperience;

    @ApiModelProperty(value = "健康状况")
    @TableField("user_health")
    private String userHealth;

    @ApiModelProperty(value = "咨询内容记录")
    @TableField("consultation_content")
    private String consultationContent;

    @ApiModelProperty(value = "是否已评分（0-否，1-是）")
    @TableField("is_rated")
    private Integer isRated;

    @ApiModelProperty(value = "评分")
    @TableField("rating_score")
    private BigDecimal ratingScore;

    @ApiModelProperty(value = "评价内容")
    @TableField("rating_content")
    private String ratingContent;

    @ApiModelProperty(value = "评分时间")
    @TableField("rating_time")
    private LocalDateTime ratingTime;

    @ApiModelProperty(value = "完成时间")
    @TableField("complete_time")
    private LocalDateTime completeTime;

    @ApiModelProperty(value = "创建时间")
    @TableField("create_time")
    private LocalDateTime createTime;

    @ApiModelProperty(value = "更新时间")
    @TableField("update_time")
    private LocalDateTime updateTime;

    // ========== 支付状态常量 ==========

    /** 未支付 */
    public static final int PAY_STATUS_UNPAID = 0;
    /** 已支付 */
    public static final int PAY_STATUS_PAID = 1;
    /** 已退款 */
    public static final int PAY_STATUS_REFUNDED = 2;

    // ========== 预约状态常量 ==========

    /** 待审核 */
    public static final int STATUS_PENDING = 0;
    /** 已确认 */
    public static final int STATUS_CONFIRMED = 1;
    /** 已拒绝 */
    public static final int STATUS_REJECTED = 2;
    /** 进行中 */
    public static final int STATUS_IN_PROGRESS = 3;
    /** 已完成 */
    public static final int STATUS_COMPLETED = 4;
    /** 已取消 */
    public static final int STATUS_CANCELLED = 5;
    /** 已爽约 */
    public static final int STATUS_MISSED = 6;
    /** 待进行 */
    public static final int STATUS_TO_START = 7;
    /** 已评价 */
    public static final int STATUS_RATED = 8;

    // ========== 服务类型常量 ==========

    /** 视频咨询 */
    public static final String TYPE_VIDEO = "VIDEO";
    /** 语音通话 */
    public static final String TYPE_VOICE = "VOICE";
    /** 文字聊天 */
    public static final String TYPE_TEXT = "TEXT";
    /** 线下咨询 */
    public static final String TYPE_OFFLINE = "OFFLINE";
}
