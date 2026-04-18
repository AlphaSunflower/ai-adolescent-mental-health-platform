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
@TableName("hot_search")
@ApiModel(value = "HotSearch对象", description = "热门搜索表")
public class HotSearch implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "搜索关键词")
    private String keyword;

    @ApiModelProperty(value = "搜索次数")
    private Integer searchCount;

    @ApiModelProperty(value = "关联类型: all/article/course")
    private String type;

    @ApiModelProperty(value = "状态: 0-禁用 1-启用")
    private Integer status;

    @ApiModelProperty(value = "更新时间")
    private LocalDateTime updateTime;
}
