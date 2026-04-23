package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@ApiModel(value = "ArticleVO对象", description = "管理员文章列表VO（包含来源标识）")
public class ArticleVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "文章ID")
    private Long id;

    @ApiModelProperty(value = "文章标题")
    private String title;

    @ApiModelProperty(value = "封面图URL")
    private String coverUrl;

    @ApiModelProperty(value = "类型(SCIENCE-科普, CASE-案例)")
    private String type;

    @ApiModelProperty(value = "类型名称(科普, 案例)")
    private String tagName;

    @ApiModelProperty(value = "状态0-草稿, 1-已发布, 2-已下架")
    private Integer status;

    @ApiModelProperty(value = "作者ID")
    private Long authorId;

    @ApiModelProperty(value = "作者昵称")
    private String authorNickname;

    @ApiModelProperty(value = "作者头像")
    private String authorAvatar;

    @ApiModelProperty(value = "作者角色: 1-普通用户, 2-医生, 3-医院管理员, 4-超级管理员")
    private Integer authorRole;

    @ApiModelProperty(value = "创建时间")
    private LocalDateTime createTime;

    @ApiModelProperty(value = "来源: admin-管理员文章, user-用户文章")
    private String source;

    @ApiModelProperty(value = "是否可编辑")
    private Boolean editable;
}
