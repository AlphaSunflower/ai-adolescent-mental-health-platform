package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
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
@TableName("search_history")
@ApiModel(value = "SearchHistory对象", description = "搜索历史表")
public class SearchHistory implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "用户ID，-1表示未登录用户")
    private Long userId;

    @ApiModelProperty(value = "搜索关键词")
    private String keyword;

    @ApiModelProperty(value = "搜索类型: all/article/course")
    private String searchType;

    @ApiModelProperty(value = "创建时间")
    private LocalDateTime createTime;
}
