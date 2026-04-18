package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName(value = "complaint", autoResultMap = true)
public class Complaint implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;

    @TableField("doctor_id")
    private Long doctorId;

    @TableField("appointment_id")
    private Long appointmentId;

    private String content;

    @TableField(value = "proof_images", typeHandler = JacksonTypeHandler.class)
    private List<String> proofImages;

    private Integer status; // 0-待审核, 1-审核通过/已处理, 2-驳回

    @TableField("audit_remark")
    private String auditRemark;

    @TableField("create_time")
    private LocalDateTime createTime;

    @TableField("audit_time")
    private LocalDateTime auditTime;
}
