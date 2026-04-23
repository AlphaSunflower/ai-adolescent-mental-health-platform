package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.HotSearch;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface HotSearchMapper extends BaseMapper<HotSearch> {

    /**
     * 获取启用的热门关键词列表（按搜索次数降序）
     */
    @Select("SELECT keyword FROM hot_search WHERE status = 1 ORDER BY search_count DESC LIMIT #{limit}")
    List<String> selectTopKeywords(@Param("limit") int limit);

    /**
     * 关键词前缀匹配搜索建议
     */
    @Select("<script>" +
            "SELECT keyword FROM hot_search " +
            "WHERE status = 1 AND keyword LIKE CONCAT(#{prefix}, '%') " +
            "ORDER BY search_count DESC LIMIT 10" +
            "</script>")
    List<String> selectSuggestions(@Param("prefix") String prefix);

    /**
     * 文章标题前缀匹配搜索建议
     */
    @Select("<script>" +
            "SELECT DISTINCT title FROM article " +
            "WHERE status = 1 AND title LIKE CONCAT(#{prefix}, '%') " +
            "ORDER BY view_count DESC LIMIT 5" +
            "</script>")
    List<String> selectArticleSuggestions(@Param("prefix") String prefix);

    /**
     * 课程标题前缀匹配搜索建议
     */
    @Select("<script>" +
            "SELECT DISTINCT title FROM course " +
            "WHERE status = 1 AND title LIKE CONCAT(#{prefix}, '%') " +
            "ORDER BY id DESC LIMIT 5" +
            "</script>")
    List<String> selectCourseSuggestions(@Param("prefix") String prefix);
}
