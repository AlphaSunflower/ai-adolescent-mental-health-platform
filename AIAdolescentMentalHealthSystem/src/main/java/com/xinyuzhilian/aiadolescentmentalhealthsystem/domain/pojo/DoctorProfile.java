package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import io.swagger.annotations.ApiModel;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName(value = "doctor_profile", autoResultMap = true)
@ApiModel(value="DoctorProfile对象", description="医生档案")
public class DoctorProfile implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "user_id")
    private Long userId;

    @TableField("hospital_id")
    private Long hospitalId;

    @TableField("department_id")
    private Long departmentId;

    @TableField("real_name")
    private String realName;

    private String title;

    private String specialty;

    @TableField("introduction")
    private String introduction;

    @TableField("consultation_price")
    private BigDecimal consultationPrice;

    @TableField("is_online_consult_enabled")
    private Integer isOnlineConsultEnabled;

    @TableField("is_offline_consult_enabled")
    private Integer isOfflineConsultEnabled;

    @TableField("rating_score")
    private BigDecimal ratingScore;

    @TableField(value = "schedule_config", typeHandler = JacksonTypeHandler.class)
    private Object scheduleConfig;

    @TableField("create_time")
    private LocalDateTime createTime;
}
