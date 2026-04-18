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
@TableName("cover_image")
public class CoverImage implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("course_id")
    private Long courseId;

    @TableField("cover_type")
    private String coverType; // third_party, self_hosted

    @TableField("cover_url_avif")
    private String coverUrlAvif;

    @TableField("cover_url_webp")
    private String coverUrlWebp;

    @TableField("cover_url_jpeg")
    private String coverUrlJpeg;

    @TableField("md5_hash")
    private String md5Hash;

    @TableField("create_time")
    private LocalDateTime createTime;
}
