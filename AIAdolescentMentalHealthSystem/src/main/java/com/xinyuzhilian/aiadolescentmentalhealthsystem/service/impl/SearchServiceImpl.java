package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Article;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Course;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.HotSearch;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.SearchHistory;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserArticle;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.search.dto.SearchRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.search.vo.GlobalSearchVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.search.vo.GlobalSearchVO.SearchResultVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.ArticleMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.CourseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.HotSearchMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.SearchHistoryMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserArticleMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ISearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements ISearchService {

    private final ArticleMapper articleMapper;
    private final CourseMapper courseMapper;
    private final SearchHistoryMapper searchHistoryMapper;
    private final HotSearchMapper hotSearchMapper;
    private final UserArticleMapper userArticleMapper;

    @Override
    public Result<GlobalSearchVO> globalSearch(SearchRequest request, Long userId) {
        GlobalSearchVO vo = new GlobalSearchVO();

        int pageNum = request.getPageNum() != null ? request.getPageNum() : 1;
        int pageSize = request.getPageSize() != null ? request.getPageSize() : 10;

        List<SearchResultVO> articleResults = searchArticlesInternal(request);
        List<SearchResultVO> courseResults = searchCoursesInternal(request);
        List<SearchResultVO> userArticleResults = searchUserArticlesInternal(request);

        List<SearchResultVO> allResults = new ArrayList<>();
        allResults.addAll(articleResults);
        allResults.addAll(userArticleResults);
        allResults.addAll(courseResults);

        long total = allResults.size();
        int totalPages = (int) Math.ceil((double) total / pageSize);

        int fromIndex = (pageNum - 1) * pageSize;
        int toIndex = Math.min(fromIndex + pageSize, allResults.size());
        List<SearchResultVO> pagedResults = fromIndex < allResults.size()
                ? allResults.subList(fromIndex, toIndex)
                : new ArrayList<>();

        vo.setTotal(total);
        vo.setPageNum(pageNum);
        vo.setPageSize(pageSize);
        vo.setTotalPages(totalPages);
        vo.setData(pagedResults);

        if (StringUtils.hasText(request.getKeyword())) {
            incrementHotSearchCount(request.getKeyword());
        }

        return Result.success(vo);
    }

    @Override
    public Result<GlobalSearchVO> searchArticles(SearchRequest request, Long userId) {
        GlobalSearchVO vo = new GlobalSearchVO();

        int pageNum = request.getPageNum() != null ? request.getPageNum() : 1;
        int pageSize = request.getPageSize() != null ? request.getPageSize() : 10;

        List<SearchResultVO> results = searchArticlesInternal(request);
        long total = results.size();
        int totalPages = (int) Math.ceil((double) total / pageSize);

        int fromIndex = (pageNum - 1) * pageSize;
        int toIndex = Math.min(fromIndex + pageSize, results.size());
        List<SearchResultVO> pagedResults = fromIndex < results.size()
                ? results.subList(fromIndex, toIndex)
                : new ArrayList<>();

        vo.setTotal(total);
        vo.setPageNum(pageNum);
        vo.setPageSize(pageSize);
        vo.setTotalPages(totalPages);
        vo.setData(pagedResults);

        return Result.success(vo);
    }

    @Override
    public Result<GlobalSearchVO> searchCourses(SearchRequest request, Long userId) {
        GlobalSearchVO vo = new GlobalSearchVO();

        int pageNum = request.getPageNum() != null ? request.getPageNum() : 1;
        int pageSize = request.getPageSize() != null ? request.getPageSize() : 10;

        List<SearchResultVO> results = searchCoursesInternal(request);
        long total = results.size();
        int totalPages = (int) Math.ceil((double) total / pageSize);

        int fromIndex = (pageNum - 1) * pageSize;
        int toIndex = Math.min(fromIndex + pageSize, results.size());
        List<SearchResultVO> pagedResults = fromIndex < results.size()
                ? results.subList(fromIndex, toIndex)
                : new ArrayList<>();

        vo.setTotal(total);
        vo.setPageNum(pageNum);
        vo.setPageSize(pageSize);
        vo.setTotalPages(totalPages);
        vo.setData(pagedResults);

        return Result.success(vo);
    }

    private List<SearchResultVO> searchArticlesInternal(SearchRequest request) {
        if (!StringUtils.hasText(request.getKeyword())) {
            return new ArrayList<>();
        }

        QueryWrapper<Article> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1);
        wrapper.and(w -> w
                .like("title", request.getKeyword())
                .or()
                .like("content", request.getKeyword())
        );

        if ("time".equals(request.getSortBy())) {
            wrapper.orderByDesc("create_time");
        } else if ("popular".equals(request.getSortBy())) {
            wrapper.orderByDesc("view_count");
        } else {
            wrapper.orderByDesc("view_count");
        }

        List<Article> articles = articleMapper.selectList(wrapper);
        return articles.stream().map(this::convertArticleToVO).collect(Collectors.toList());
    }

    private List<SearchResultVO> searchUserArticlesInternal(SearchRequest request) {
        if (!StringUtils.hasText(request.getKeyword())) {
            return new ArrayList<>();
        }

        QueryWrapper<UserArticle> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1);
        wrapper.and(w -> w
                .like("title", request.getKeyword())
                .or()
                .like("content", request.getKeyword())
        );

        if ("time".equals(request.getSortBy())) {
            wrapper.orderByDesc("create_time");
        } else if ("popular".equals(request.getSortBy())) {
            wrapper.orderByDesc("view_count");
        } else {
            wrapper.orderByDesc("create_time");
        }

        List<UserArticle> userArticles = userArticleMapper.selectList(wrapper);
        return userArticles.stream().map(this::convertUserArticleToVO).collect(Collectors.toList());
    }

    private List<SearchResultVO> searchCoursesInternal(SearchRequest request) {
        if (!StringUtils.hasText(request.getKeyword())) {
            return new ArrayList<>();
        }

        QueryWrapper<Course> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1);
        wrapper.and(w -> w
                .like("title", request.getKeyword())
                .or()
                .like("description", request.getKeyword())
        );

        if ("time".equals(request.getSortBy())) {
            wrapper.orderByDesc("create_time");
        } else {
            wrapper.orderByDesc("id");
        }

        List<Course> courses = courseMapper.selectList(wrapper);
        return courses.stream().map(this::convertCourseToVO).collect(Collectors.toList());
    }

    private SearchResultVO convertArticleToVO(Article article) {
        SearchResultVO vo = new SearchResultVO();
        vo.setId(article.getId());
        vo.setArticleType("official");
        vo.setType("article");
        vo.setTitle(article.getTitle());
        String plainContent = article.getContent() != null
                ? article.getContent().replaceAll("<[^>]+>", "").trim()
                : "";
        vo.setDescription(plainContent.length() > 200 ? plainContent.substring(0, 200) + "..." : plainContent);
        vo.setCoverImage(article.getCoverUrl());
        vo.setCreateTime(article.getCreateTime() != null ? article.getCreateTime().toString() : "");
        vo.setViewCount(article.getView_count() != null ? article.getView_count() : 0);
        vo.setLikeCount(article.getLike_count() != null ? article.getLike_count() : 0);
        vo.setStatus(article.getStatus());
        vo.setCategory(article.getType());
        return vo;
    }

    private SearchResultVO convertUserArticleToVO(UserArticle userArticle) {
        SearchResultVO vo = new SearchResultVO();
        vo.setId(userArticle.getId());
        vo.setArticleType("user");
        vo.setUserId(userArticle.getUserId());
        vo.setType("article");
        vo.setTitle(userArticle.getTitle());
        String plainContent = userArticle.getContent() != null
                ? userArticle.getContent().replaceAll("<[^>]+>", "").trim()
                : "";
        vo.setDescription(plainContent.length() > 200 ? plainContent.substring(0, 200) + "..." : plainContent);
        vo.setCoverImage(userArticle.getCoverUrl());
        vo.setCreateTime(userArticle.getCreateTime() != null ? userArticle.getCreateTime().toString() : "");
        vo.setViewCount(userArticle.getViewCount() != null ? userArticle.getViewCount() : 0);
        vo.setLikeCount(userArticle.getLikeCount() != null ? userArticle.getLikeCount() : 0);
        vo.setStatus(userArticle.getStatus());
        return vo;
    }

    private SearchResultVO convertCourseToVO(Course course) {
        SearchResultVO vo = new SearchResultVO();
        vo.setId(course.getId());
        vo.setType("course");
        vo.setTitle(course.getTitle());
        vo.setDescription(course.getDescription());
        vo.setCoverImage(course.getCoverUrl());
        vo.setCreateTime(course.getCreateTime() != null ? course.getCreateTime().toString() : "");
        vo.setStatus(course.getStatus());
        vo.setCategory(course.getType());
        return vo;
    }

    @Override
    public Result<String> saveSearchHistory(String keyword, String searchType, Long userId) {
        if (!StringUtils.hasText(keyword)) {
            return Result.error("关键词不能为空");
        }

        SearchHistory history = new SearchHistory();
        history.setUserId(userId != null ? userId : -1L);
        history.setKeyword(keyword.trim());
        history.setSearchType(searchType != null ? searchType : "all");
        history.setCreateTime(LocalDateTime.now());
        searchHistoryMapper.insert(history);

        return Result.success("保存成功", null);
    }

    @Override
    public Result<List<String>> getSearchHistory(Long userId) {
        Long uid = userId != null ? userId : -1L;
        List<String> history = searchHistoryMapper.selectLatestByUserId(uid);
        return Result.success(history);
    }

    @Override
    public Result<String> clearSearchHistory(Long userId) {
        Long uid = userId != null ? userId : -1L;
        searchHistoryMapper.delete(new QueryWrapper<SearchHistory>().eq("user_id", uid));
        return Result.success("清空成功", null);
    }

    @Override
    public Result<List<String>> getHotKeywords() {
        List<String> keywords = hotSearchMapper.selectTopKeywords(10);
        return Result.success(keywords);
    }

    @Override
    public Result<List<String>> getSearchSuggestions(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return Result.success(new ArrayList<>());
        }

        Set<String> suggestions = new HashSet<>();

        List<String> hotSuggestions = hotSearchMapper.selectSuggestions(keyword.trim());
        suggestions.addAll(hotSuggestions);

        List<String> articleSuggestions = hotSearchMapper.selectArticleSuggestions(keyword.trim());
        suggestions.addAll(articleSuggestions);

        List<String> courseSuggestions = hotSearchMapper.selectCourseSuggestions(keyword.trim());
        suggestions.addAll(courseSuggestions);

        List<String> result = new ArrayList<>(suggestions);
        if (result.size() > 10) {
            result = result.subList(0, 10);
        }

        return Result.success(result);
    }

    private void incrementHotSearchCount(String keyword) {
        QueryWrapper<HotSearch> wrapper = new QueryWrapper<>();
        wrapper.eq("keyword", keyword.trim());
        HotSearch hotSearch = hotSearchMapper.selectOne(wrapper);

        if (hotSearch != null) {
            hotSearch.setSearchCount(hotSearch.getSearchCount() + 1);
            hotSearch.setUpdateTime(LocalDateTime.now());
            hotSearchMapper.updateById(hotSearch);
        }
    }
}
