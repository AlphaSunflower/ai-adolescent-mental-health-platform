package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.search.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

@Data
@ApiModel(value = "GlobalSearchVO", description = "统一搜索结果VO")
public class GlobalSearchVO {

    @ApiModelProperty(value = "总记录数")
    private Long total;

    @ApiModelProperty(value = "当前页码")
    private Integer pageNum;

    @ApiModelProperty(value = "每页大小")
    private Integer pageSize;

    @ApiModelProperty(value = "总页数")
    private Integer totalPages;

    @ApiModelProperty(value = "搜索结果列表")
    private List<SearchResultVO> data;

    @Data
    @ApiModel(value = "SearchResultVO", description = "单个搜索结果")
    public static class SearchResultVO {

        private Long id;

        @ApiModelProperty(value = "文章类型: official-官方文章, user-用户文章")
        private String articleType;

        @ApiModelProperty(value = "用户文章时需要此字段")
        private Long userId;

        private String type;

        private String title;

        private String description;

        private String coverImage;

        private String author;

        private String createTime;

        private Integer viewCount;

        private Integer likeCount;

        private String category;

        private List<String> tags;

        private Integer duration;

        private Double price;

        private Boolean isFree;

        private Integer status;
    }
}
