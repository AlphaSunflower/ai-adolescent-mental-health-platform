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
@TableName("user_stats")
@ApiModel(value = "UserStats对象", description = "用户统计数据")
public class UserStats implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "user_id")
    private Long userId;

    @ApiModelProperty(value = "关注数")
    @TableField("follow_count")
    private Integer followCount;

    @ApiModelProperty(value = "粉丝数")
    @TableField("fan_count")
    private Integer fanCount;

    @ApiModelProperty(value = "发布文章数")
    @TableField("article_count")
    private Integer articleCount;

    @ApiModelProperty(value = "获赞数")
    @TableField("like_count")
    private Integer likeCount;

    @TableField("update_time")
    private LocalDateTime updateTime;
}
