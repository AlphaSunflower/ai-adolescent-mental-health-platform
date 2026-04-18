package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common;

import com.baomidou.mybatisplus.core.metadata.IPage;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "分页结果")
public class PageResult<T> {
    
    @Schema(description = "总记录数")
    private Long total;
    
    @Schema(description = "当前页数")
    private List<T> records;
    
    @Schema(description = "当前页码")
    private Long current;
    
    @Schema(description = "每页数量")
    private Long size;

    @Schema(description = "总页")
    private Long pages;

    public static <T> PageResult<T> build(IPage<T> page) {
        PageResult<T> result = new PageResult<>();
        result.setTotal(page.getTotal());
        result.setRecords(page.getRecords());
        result.setCurrent(page.getCurrent());
        result.setSize(page.getSize());
        result.setPages(page.getPages());
        return result;
    }
    
    // 为了兼容性保留无参构�?    public PageResult() {}
}
