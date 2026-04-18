package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.SearchHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SearchHistoryMapper extends BaseMapper<SearchHistory> {

    /**
     * 获取用户最新的搜索历史（去重，按时间倒序）
     */
    @Select("SELECT sh.keyword FROM search_history sh " +
            "INNER JOIN (" +
            "  SELECT keyword, MAX(create_time) as max_time " +
            "  FROM search_history " +
            "  WHERE user_id = #{userId} " +
            "  GROUP BY keyword" +
            ") latest ON sh.keyword = latest.keyword AND sh.create_time = latest.max_time " +
            "WHERE sh.user_id = #{userId} " +
            "ORDER BY sh.create_time DESC LIMIT 20")
    List<String> selectLatestByUserId(@Param("userId") Long userId);
}
