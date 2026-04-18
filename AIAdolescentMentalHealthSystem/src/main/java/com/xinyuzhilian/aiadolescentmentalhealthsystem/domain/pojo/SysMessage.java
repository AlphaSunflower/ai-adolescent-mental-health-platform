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
@TableName("sys_message")
@ApiModel(value = "SysMessage对象", description = "系统消息")
public class SysMessage implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "接收用户ID")
    @TableField("user_id")
    private Long userId;

    @ApiModelProperty(value = "消息标题")
    @TableField("title")
    private String title;

    @ApiModelProperty(value = "消息内容")
    @TableField("content")
    private String content;

    @ApiModelProperty(value = "类型(1-系统通知,2-文章审核,3-文章下架)")
    @TableField("type")
    private Integer type;

    @ApiModelProperty(value = "来源类型(0-系统,1-关注,2-文章点赞,3-评论点赞,4-评论回复)")
    @TableField("source_type")
    private Integer sourceType;

    @ApiModelProperty(value = "来源ID(文章ID/评论ID等)")
    @TableField("source_id")
    private Long sourceId;

    @ApiModelProperty(value = "扩展类型(用于区分文章类型:0-官方文章,1-用户文章)")
    @TableField("extra_type")
    private Integer extraType;

    @ApiModelProperty(value = "文章作者ID(用于用户文章跳转)")
    @TableField("article_author_id")
    private Long articleAuthorId;

    @ApiModelProperty(value = "触发通知的用户ID")
    @TableField("from_user_id")
    private Long fromUserId;

    @ApiModelProperty(value = "触发通知的用户昵称")
    @TableField(exist = false)
    private String fromUserNickname;

    @ApiModelProperty(value = "触发通知的用户头像")
    @TableField(exist = false)
    private String fromUserAvatar;

    @ApiModelProperty(value = "是否已读(0-否,1-是)")
    @TableField("is_read")
    private Integer isRead;

    @TableField("create_time")
    private LocalDateTime createTime;
}
