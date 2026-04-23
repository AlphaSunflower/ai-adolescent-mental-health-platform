package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.search.dto.SearchRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.search.vo.GlobalSearchVO;

import java.util.List;

public interface ISearchService {

    /**
     * 全局搜索（文章+课程）
     */
    Result<GlobalSearchVO> globalSearch(SearchRequest request, Long userId);

    /**
     * 搜索文章
     */
    Result<GlobalSearchVO> searchArticles(SearchRequest request, Long userId);

    /**
     * 搜索课程
     */
    Result<GlobalSearchVO> searchCourses(SearchRequest request, Long userId);

    /**
     * 保存搜索历史
     */
    Result<String> saveSearchHistory(String keyword, String searchType, Long userId);

    /**
     * 获取用户搜索历史
     */
    Result<List<String>> getSearchHistory(Long userId);

    /**
     * 清空用户搜索历史
     */
    Result<String> clearSearchHistory(Long userId);

    /**
     * 获取热门关键词
     */
    Result<List<String>> getHotKeywords();

    /**
     * 获取搜索建议
     */
    Result<List<String>> getSearchSuggestions(String keyword);
}
