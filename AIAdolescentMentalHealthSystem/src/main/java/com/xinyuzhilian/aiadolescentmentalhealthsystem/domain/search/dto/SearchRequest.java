package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.search.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
@ApiModel(value = "SearchRequest", description = "搜索请求参数")
public class SearchRequest {

    @ApiModelProperty(value = "搜索关键词")
    private String keyword;

    @ApiModelProperty(value = "搜索类型: all/article/course")
    private String type = "all";

    @ApiModelProperty(value = "页码", example = "1")
    private Integer pageNum = 1;

    @ApiModelProperty(value = "每页大小", example = "10")
    private Integer pageSize = 10;

    @ApiModelProperty(value = "排序方式: relevance/time/popular")
    private String sortBy = "relevance";

    @ApiModelProperty(value = "分类")
    private String category;

    @ApiModelProperty(value = "最小价格")
    private Double minPrice;

    @ApiModelProperty(value = "最大价格")
    private Double maxPrice;

    @ApiModelProperty(value = "是否免费")
    private Boolean isFree;
}
