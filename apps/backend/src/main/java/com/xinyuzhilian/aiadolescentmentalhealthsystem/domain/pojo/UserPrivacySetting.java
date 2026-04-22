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
@TableName("user_privacy_setting")
@ApiModel(value = "UserPrivacySetting对象", description = "用户隐私设置")
public class UserPrivacySetting implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "user_id")
    private Long userId;

    @ApiModelProperty(value = "允许他人查看点赞(0-否,1-是)")
    @TableField("allow_view_likes")
    private Integer allowViewLikes;

    @ApiModelProperty(value = "允许他人查看发布文章(0-否,1-是)")
    @TableField("allow_view_articles")
    private Integer allowViewArticles;

    @ApiModelProperty(value = "允许他人查看收藏(0-否,1-是)")
    @TableField("allow_view_collections")
    private Integer allowViewCollections;

    @ApiModelProperty(value = "允许他人查看关注(0-否,1-是)")
    @TableField("allow_view_followings")
    private Integer allowViewFollowings;

    @ApiModelProperty(value = "允许他人查看粉丝(0-否,1-是)")
    @TableField("allow_view_fans")
    private Integer allowViewFans;

    @TableField("update_time")
    private LocalDateTime updateTime;
}
