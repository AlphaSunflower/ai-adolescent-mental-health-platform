package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.search.dto.SearchRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.search.vo.GlobalSearchVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ISearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 搜索控制器
 * 提供全文搜索、搜索历史、热门关键词、搜索建议等功能
 */
@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final ISearchService searchService;

    /**
     * 全局搜索（文章+课程）
     */
    @GetMapping("/global")
    public Result<GlobalSearchVO> globalSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "all") String type,
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(required = false, defaultValue = "relevance") String sortBy,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean isFree,
            @CurrentUserId Long userId) {

        SearchRequest request = new SearchRequest();
        request.setKeyword(keyword);
        request.setType(type);
        request.setPageNum(pageNum);
        request.setPageSize(pageSize);
        request.setSortBy(sortBy);
        request.setCategory(category);
        request.setMinPrice(minPrice);
        request.setMaxPrice(maxPrice);
        request.setIsFree(isFree);

        return searchService.globalSearch(request, userId);
    }

    /**
     * 搜索文章
     */
    @GetMapping("/articles")
    public Result<GlobalSearchVO> searchArticles(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(required = false, defaultValue = "relevance") String sortBy,
            @RequestParam(required = false) String category,
            @CurrentUserId Long userId) {

        SearchRequest request = new SearchRequest();
        request.setKeyword(keyword);
        request.setType("article");
        request.setPageNum(pageNum);
        request.setPageSize(pageSize);
        request.setSortBy(sortBy);
        request.setCategory(category);

        return searchService.searchArticles(request, userId);
    }

    /**
     * 搜索课程
     */
    @GetMapping("/courses")
    public Result<GlobalSearchVO> searchCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(required = false, defaultValue = "relevance") String sortBy,
            @RequestParam(required = false) String category,
            @CurrentUserId Long userId) {

        SearchRequest request = new SearchRequest();
        request.setKeyword(keyword);
        request.setType("course");
        request.setPageNum(pageNum);
        request.setPageSize(pageSize);
        request.setSortBy(sortBy);
        request.setCategory(category);

        return searchService.searchCourses(request, userId);
    }

    /**
     * 获取热门关键词
     */
    @GetMapping("/hot-keywords")
    public Result<List<String>> getHotKeywords() {
        return searchService.getHotKeywords();
    }

    /**
     * 保存搜索历史
     */
    @PostMapping("/history")
    public Result<String> saveSearchHistory(
            @RequestBody(required = false) String keyword,
            @RequestParam(required = false) String type,
            @CurrentUserId Long userId) {
        return searchService.saveSearchHistory(keyword, type, userId);
    }

    /**
     * 获取搜索历史
     */
    @GetMapping("/history")
    public Result<List<String>> getSearchHistory(@CurrentUserId Long userId) {
        return searchService.getSearchHistory(userId);
    }

    /**
     * 清空搜索历史
     */
    @DeleteMapping("/history")
    public Result<String> clearSearchHistory(@CurrentUserId Long userId) {
        return searchService.clearSearchHistory(userId);
    }

    /**
     * 获取搜索建议（自动补全）
     */
    @GetMapping("/suggestions")
    public Result<List<String>> getSearchSuggestions(@RequestParam String keyword) {
        return searchService.getSearchSuggestions(keyword);
    }
}
