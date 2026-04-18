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

@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("article_audit_log")
@ApiModel(value = "ArticleAuditLog对象", description = "文章审核记录")
public class ArticleAuditLog implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "文章ID")
    @TableField("article_id")
    private Long articleId;

    @ApiModelProperty(value = "文章类型(1-管理员文章,2-用户文章)")
    @TableField("article_type")
    private Integer articleType;

    @ApiModelProperty(value = "发布者ID")
    @TableField("user_id")
    private Long userId;

    @ApiModelProperty(value = "审核人ID")
    @TableField("auditor_id")
    private Long auditorId;

    @ApiModelProperty(value = "操作(1-通过,2-拒绝,3-下架)")
    @TableField("action")
    private Integer action;

    @ApiModelProperty(value = "原因")
    @TableField("reason")
    private String reason;

    @TableField("create_time")
    private LocalDateTime createTime;
}
