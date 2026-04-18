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
@TableName("course_source")
public class CourseSource implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("course_id")
    private Long courseId;

    @TableField("source_type")
    private String sourceType; // third_party, self_hosted

    @TableField("source_name")
    private String sourceName; // e.g., Bilibili

    @TableField("source_url")
    private String sourceUrl;

    @TableField("storage_provider")
    private String storageProvider; // oss, local, cdn

    @TableField("create_time")
    private LocalDateTime createTime;
}
