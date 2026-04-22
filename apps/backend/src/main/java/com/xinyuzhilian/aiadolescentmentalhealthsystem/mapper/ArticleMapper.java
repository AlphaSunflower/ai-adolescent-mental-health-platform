package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Article;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

public interface ArticleMapper extends BaseMapper<Article> {
    @Update("UPDATE article SET like_count = like_count + #{delta} WHERE id = #{id}")
    int updateLikeCount(@Param("id") Long id, @Param("delta") int delta);

    @Update("UPDATE article SET dislike_count = dislike_count + #{delta} WHERE id = #{id}")
    int updateDislikeCount(@Param("id") Long id, @Param("delta") int delta);

    @Update("UPDATE article SET collection_count = collection_count + #{delta} WHERE id = #{id}")
    int updateCollectionCount(@Param("id") Long id, @Param("delta") int delta);

    @Update("UPDATE article SET comment_count = comment_count + #{delta} WHERE id = #{id}")
    int updateCommentCount(@Param("id") Long id, @Param("delta") int delta);
}
