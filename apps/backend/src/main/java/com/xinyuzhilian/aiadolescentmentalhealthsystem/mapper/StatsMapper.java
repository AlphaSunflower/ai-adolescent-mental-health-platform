package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 统计数据 Mapper 接口
 */
@Mapper
public interface StatsMapper {

    /**
     * 按月统计新增用户数
     */
    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m') as month, COUNT(*) as count " +
            "FROM user WHERE deleted = 0 GROUP BY DATE_FORMAT(create_time, '%Y-%m') ORDER BY month DESC LIMIT #{limit}")
    List<Map<String, Object>> countUsersByMonth(@Param("limit") int limit);

    /**
     * 按月统计AI问诊会话数
     */
    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m') as month, COUNT(*) as count " +
            "FROM ai_session GROUP BY DATE_FORMAT(create_time, '%Y-%m') ORDER BY month DESC LIMIT #{limit}")
    List<Map<String, Object>> countAiSessionsByMonth(@Param("limit") int limit);

    /**
     * 按月统计测评记录数
     */
    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m') as month, COUNT(*) as count " +
            "FROM assessment_record GROUP BY DATE_FORMAT(create_time, '%Y-%m') ORDER BY month DESC LIMIT #{limit}")
    List<Map<String, Object>> countAssessmentsByMonth(@Param("limit") int limit);

    /**
     * 按月统计文章发布数
     */
    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m') as month, COUNT(*) as count " +
            "FROM article WHERE status = 1 GROUP BY DATE_FORMAT(create_time, '%Y-%m') ORDER BY month DESC LIMIT #{limit}")
    List<Map<String, Object>> countArticlesByMonth(@Param("limit") int limit);

    /**
     * 统计用户角色分布
     */
    @Select("SELECT role, COUNT(*) as count FROM user WHERE deleted = 0 GROUP BY role")
    List<Map<String, Object>> countUsersByRole();

    /**
     * 统计文章阅读量
     */
    @Select("SELECT id, title, view_count as viewCount FROM article WHERE status = 1 ORDER BY view_count DESC LIMIT #{limit}")
    List<Map<String, Object>> getArticleViewRanking(@Param("limit") int limit);

    /**
     * 统计课程学习人数
     */
    @Select("SELECT c.id, c.title, COUNT(ucp.user_id) as studentCount " +
            "FROM course c LEFT JOIN user_course_progress ucp ON c.id = ucp.course_id " +
            "WHERE c.status = 1 GROUP BY c.id, c.title ORDER BY studentCount DESC LIMIT #{limit}")
    List<Map<String, Object>> getCourseStudentRanking(@Param("limit") int limit);
}
