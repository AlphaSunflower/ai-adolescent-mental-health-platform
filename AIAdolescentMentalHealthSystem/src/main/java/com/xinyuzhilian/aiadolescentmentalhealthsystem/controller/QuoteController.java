package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.InspirationalQuote;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IInspirationalQuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quote")
@RequiredArgsConstructor
public class QuoteController {

    private final IInspirationalQuoteService quoteService;

    // Public: Get daily quote
    @GetMapping("/daily")
    public Result<List<InspirationalQuote>> getDailyQuote() {
        return Result.success(quoteService.getDailyQuote());
    }

    // Admin: List quotes
    @GetMapping("/list")
    public Result<PageResult<InspirationalQuote>> listQuotes(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String content) {
        
        Page<InspirationalQuote> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<InspirationalQuote> wrapper = new LambdaQueryWrapper<>();
        if (content != null && !content.isEmpty()) {
            wrapper.like(InspirationalQuote::getContent, content);
        }
        wrapper.orderByDesc(InspirationalQuote::getCreateTime);
        return Result.success(PageResult.build(quoteService.page(pageParam, wrapper)));
    }

    // Admin: Add/Update quote
    @PostMapping
    public Result<String> saveQuote(@RequestBody InspirationalQuote quote) {
        if (quote.getId() == null) {
            quoteService.save(quote);
        } else {
            quoteService.updateById(quote);
        }
        return Result.success("保存成功", null);
    }

    // Admin: Delete quote
    @DeleteMapping("/{id}")
    public Result<String> deleteQuote(@PathVariable Long id) {
        quoteService.removeById(id);
        return Result.success("删除成功", null);
    }
}
