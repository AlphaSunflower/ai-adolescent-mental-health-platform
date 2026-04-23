package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Appointment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 统计数据 Mapper 接口
 */
@Mapper
public interface StatsMapper extends BaseMapper<Appointment> {

    /**
     * 按月统计新增用户数
     */
    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m') as month, COUNT(*) as count " +
            "FROM user WHERE deleted = 0 GROUP BY DATE_FORMAT(create_time, '%Y-%m') ORDER BY month DESC LIMIT #{limit}")
    List<Map<String, Object>> countUsersByMonth(@Param("limit") int limit);

    /**
     * 按月统计预约数
     */
    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m') as month, COUNT(*) as count " +
            "FROM appointment GROUP BY DATE_FORMAT(create_time, '%Y-%m') ORDER BY month DESC LIMIT #{limit}")
    List<Map<String, Object>> countAppointmentsByMonth(@Param("limit") int limit);

    /**
     * 按日统计预约数（近30天）
     */
    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m-%d') as day, COUNT(*) as count " +
            "FROM appointment WHERE create_time >= DATE_SUB(CURDATE(), INTERVAL #{days} DAY) " +
            "GROUP BY DATE_FORMAT(create_time, '%Y-%m-%d') ORDER BY day ASC")
    List<Map<String, Object>> countAppointmentsByDay(@Param("days") int days);

    /**
     * 统计各医院用户数
     */
    @Select("SELECT h.id as hospitalId, h.name as hospitalName, COUNT(u.id) as count " +
            "FROM hospital h LEFT JOIN user u ON u.role = 2 AND u.id IN " +
            "(SELECT user_id FROM doctor_profile WHERE hospital_id = h.id) " +
            "GROUP BY h.id, h.name")
    List<Map<String, Object>> countUsersByHospital();

    /**
     * 统计各医院预约数
     */
    @Select("SELECT h.id as hospitalId, h.name as hospitalName, COUNT(a.id) as count " +
            "FROM hospital h LEFT JOIN appointment a ON a.doctor_id IN " +
            "(SELECT user_id FROM doctor_profile WHERE hospital_id = h.id) " +
            "GROUP BY h.id, h.name")
    List<Map<String, Object>> countAppointmentsByHospital();

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
     * 统计医生接诊量排行
     */
    @Select("SELECT u.nickname as doctorName, dp.real_name as realName, COUNT(a.id) as count " +
            "FROM appointment a " +
            "JOIN user u ON a.doctor_id = u.id " +
            "JOIN doctor_profile dp ON dp.user_id = u.id " +
            "GROUP BY a.doctor_id, u.nickname, dp.real_name " +
            "ORDER BY count DESC LIMIT #{limit}")
    List<Map<String, Object>> countDoctorAppointmentsRanking(@Param("limit") int limit);

    /**
     * 按月统计咨询反馈数
     */
    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m') as month, COUNT(*) as count " +
            "FROM consultation_feedback GROUP BY DATE_FORMAT(create_time, '%Y-%m') ORDER BY month DESC LIMIT #{limit}")
    List<Map<String, Object>> countFeedbackByMonth(@Param("limit") int limit);

    /**
     * 统计用户角色分布
     */
    @Select("SELECT role, COUNT(*) as count FROM user WHERE deleted = 0 GROUP BY role")
    List<Map<String, Object>> countUsersByRole();

    /**
     * 统计预约状态分布
     */
    @Select("SELECT status, COUNT(*) as count FROM appointment GROUP BY status")
    List<Map<String, Object>> countAppointmentsByStatus();

    /**
     * 统计各科室预约量
     */
    @Select("SELECT d.id as departmentId, d.name as departmentName, COUNT(a.id) as count " +
            "FROM department d LEFT JOIN appointment a ON a.doctor_id IN " +
            "(SELECT user_id FROM doctor_profile WHERE department_id = d.id) " +
            "GROUP BY d.id, d.name")
    List<Map<String, Object>> countAppointmentsByDepartment();

    /**
     * 统计咨询满意度分布
     */
    @Select("SELECT rating, COUNT(*) as count FROM consultation_feedback WHERE rating IS NOT NULL GROUP BY rating")
    List<Map<String, Object>> countFeedbackByRating();

    /**
     * 按日统计某医生预约数（近30天）
     */
    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m-%d') as day, COUNT(*) as count " +
            "FROM appointment WHERE doctor_id = #{doctorId} AND create_time >= DATE_SUB(CURDATE(), INTERVAL #{days} DAY) " +
            "GROUP BY DATE_FORMAT(create_time, '%Y-%m-%d') ORDER BY day ASC")
    List<Map<String, Object>> countDoctorAppointmentsByDay(@Param("doctorId") Long doctorId, @Param("days") int days);

    /**
     * 统计某医院各科室预约量
     */
    @Select("SELECT d.id as departmentId, d.name as departmentName, COUNT(a.id) as count " +
            "FROM department d LEFT JOIN appointment a ON a.doctor_id IN " +
            "(SELECT user_id FROM doctor_profile WHERE department_id = d.id AND hospital_id = #{hospitalId}) " +
            "WHERE d.hospital_id = #{hospitalId} " +
            "GROUP BY d.id, d.name")
    List<Map<String, Object>> countDepartmentAppointmentsByHospital(@Param("hospitalId") Long hospitalId);

    /**
     * 统计某医院用户数（普通用户）
     */
    @Select("SELECT COUNT(DISTINCT a.user_id) as count " +
            "FROM appointment a WHERE a.doctor_id IN " +
            "(SELECT user_id FROM doctor_profile WHERE hospital_id = #{hospitalId})")
    Long countHospitalPatients(@Param("hospitalId") Long hospitalId);

    /**
     * 统计某医生患者数
     */
    @Select("SELECT COUNT(DISTINCT a.user_id) as count FROM appointment a WHERE a.doctor_id = #{doctorId}")
    Long countDoctorPatients(@Param("doctorId") Long doctorId);

    /**
     * 按月统计某医生预约数
     */
    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m') as month, COUNT(*) as count " +
            "FROM appointment WHERE doctor_id = #{doctorId} " +
            "GROUP BY DATE_FORMAT(create_time, '%Y-%m') ORDER BY month DESC LIMIT #{limit}")
    List<Map<String, Object>> countDoctorAppointmentsByMonth(@Param("doctorId") Long doctorId, @Param("limit") int limit);

    /**
     * 统计病历记录数（用于健康分析）
     */
    @Select("SELECT COUNT(*) as count FROM medical_record WHERE doctor_id = #{doctorId}")
    Long countDoctorMedicalRecords(@Param("doctorId") Long doctorId);

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
