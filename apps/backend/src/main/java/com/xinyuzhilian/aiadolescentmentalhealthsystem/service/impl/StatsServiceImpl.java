package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto.AdminOverviewDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto.DoctorOverviewDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto.HospitalOverviewDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements IStatsService {

    private final StatsMapper statsMapper;
    private final UserMapper userMapper;
    private final HospitalMapper hospitalMapper;
    private final DoctorProfileMapper doctorProfileMapper;
    private final AppointmentMapper appointmentMapper;
    private final ArticleMapper articleMapper;
    private final CourseMapper courseMapper;
    private final AssessmentRecordMapper assessmentRecordMapper;
    private final ConsultationFeedbackMapper feedbackMapper;
    private final AiSessionMapper aiSessionMapper;
    private final DepartmentMapper departmentMapper;
    private final DoctorScheduleMapper scheduleMapper;
    private final MedicalRecordMapper medicalRecordMapper;

    @Override
    public AdminOverviewDTO getAdminOverview() {
        AdminOverviewDTO dto = new AdminOverviewDTO();

        // 用户统计
        LambdaQueryWrapper<User> userWrapper = new LambdaQueryWrapper<>();
        userWrapper.eq(User::getDeleted, false);
        dto.setTotalUsers(userMapper.selectCount(userWrapper));

        String currentMonth = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        LambdaQueryWrapper<User> monthUserWrapper = new LambdaQueryWrapper<>();
        monthUserWrapper.eq(User::getDeleted, false)
                .likeRight(User::getCreateTime, currentMonth);
        dto.setMonthlyNewUsers(userMapper.selectCount(monthUserWrapper));

        // 医院统计
        dto.setTotalHospitals(hospitalMapper.selectCount(null));

        // 医生统计
        dto.setTotalDoctors(doctorProfileMapper.selectCount(null));

        // 预约统计
        dto.setTotalAppointments(appointmentMapper.selectCount(null));

        LambdaQueryWrapper<Appointment> monthApptWrapper = new LambdaQueryWrapper<>();
        monthApptWrapper.likeRight(Appointment::getCreateTime, currentMonth);
        dto.setMonthlyAppointments(appointmentMapper.selectCount(monthApptWrapper));

        LambdaQueryWrapper<Appointment> pendingWrapper = new LambdaQueryWrapper<>();
        pendingWrapper.eq(Appointment::getStatus, 0);
        dto.setPendingAppointments(appointmentMapper.selectCount(pendingWrapper));

        // 内容统计
        LambdaQueryWrapper<Article> articleWrapper = new LambdaQueryWrapper<>();
        articleWrapper.eq(Article::getStatus, 1);
        dto.setTotalArticles(articleMapper.selectCount(articleWrapper));

        LambdaQueryWrapper<Course> courseWrapper = new LambdaQueryWrapper<>();
        courseWrapper.eq(Course::getStatus, 1);
        dto.setTotalCourses(courseMapper.selectCount(courseWrapper));

        dto.setTotalAssessments(assessmentRecordMapper.selectCount(null));
        dto.setTotalAiConsultations(aiSessionMapper.selectCount(null));

        // 收入统计（预约费）
        List<Appointment> appointments = appointmentMapper.selectList(null);
        BigDecimal totalRevenue = appointments.stream()
                .filter(a -> a.getFee() != null && a.getPayStatus() == 1)
                .map(Appointment::getFee)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalRevenue(totalRevenue);

        // 趋势数据
        dto.setUserTrend(statsMapper.countUsersByMonth(6));
        dto.setAppointmentTrend(statsMapper.countAppointmentsByDay(30));
        dto.setAppointmentByStatus(statsMapper.countAppointmentsByStatus());
        dto.setAppointmentByHospital(statsMapper.countAppointmentsByHospital());

        // 内容趋势
        dto.setArticleTrend(statsMapper.countArticlesByMonth(6));
        dto.setCourseTrend(statsMapper.countArticlesByMonth(6));
        dto.setAssessmentTrend(statsMapper.countAssessmentsByMonth(6));
        dto.setConsultationTrend(statsMapper.countFeedbackByMonth(6));
        dto.setAiConsultationTrend(statsMapper.countAiSessionsByMonth(6));

        // 分布数据
        dto.setUserRoleDistribution(statsMapper.countUsersByRole());
        dto.setSatisfactionDistribution(statsMapper.countFeedbackByRating());
        dto.setDepartmentAppointments(statsMapper.countAppointmentsByDepartment());

        // 排行榜
        dto.setDoctorRanking(statsMapper.countDoctorAppointmentsRanking(10));
        dto.setArticleRanking(statsMapper.getArticleViewRanking(10));
        dto.setCourseRanking(statsMapper.getCourseStudentRanking(5));

        return dto;
    }

    @Override
    public HospitalOverviewDTO getHospitalOverview(Long adminUserId) {
        HospitalOverviewDTO dto = new HospitalOverviewDTO();

        // 获取医院信息
        LambdaQueryWrapper<Hospital> hospitalWrapper = new LambdaQueryWrapper<>();
        hospitalWrapper.eq(Hospital::getAdminUserId, adminUserId);
        Hospital hospital = hospitalMapper.selectOne(hospitalWrapper);
        if (hospital == null) {
            throw new RuntimeException("未找到管理的医院信息");
        }

        dto.setHospitalId(hospital.getId());
        dto.setHospitalName(hospital.getName());

        // 本院患者数
        Long patientCount = statsMapper.countHospitalPatients(hospital.getId());
        dto.setTotalPatients(patientCount != null ? patientCount : 0L);

        // 本月新增患者（通过本院医生的预约）
        String currentMonth = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        List<DoctorProfile> doctors = doctorProfileMapper.selectList(
                new LambdaQueryWrapper<DoctorProfile>().eq(DoctorProfile::getHospitalId, hospital.getId()));
        if (!doctors.isEmpty()) {
            List<Long> doctorIds = doctors.stream().map(DoctorProfile::getUserId).collect(Collectors.toList());
            LambdaQueryWrapper<Appointment> monthPatientWrapper = new LambdaQueryWrapper<>();
            monthPatientWrapper.in(Appointment::getDoctorId, doctorIds)
                    .likeRight(Appointment::getCreateTime, currentMonth);
            dto.setMonthlyNewPatients(appointmentMapper.selectCount(monthPatientWrapper));
        } else {
            dto.setMonthlyNewPatients(0L);
        }

        // 预约统计
        if (!doctors.isEmpty()) {
            List<Long> doctorIds = doctors.stream().map(DoctorProfile::getUserId).collect(Collectors.toList());

            LambdaQueryWrapper<Appointment> allApptWrapper = new LambdaQueryWrapper<>();
            allApptWrapper.in(Appointment::getDoctorId, doctorIds);
            dto.setTotalAppointments(appointmentMapper.selectCount(allApptWrapper));

            LambdaQueryWrapper<Appointment> monthApptWrapper = new LambdaQueryWrapper<>();
            monthApptWrapper.in(Appointment::getDoctorId, doctorIds)
                    .likeRight(Appointment::getCreateTime, currentMonth);
            dto.setMonthlyAppointments(appointmentMapper.selectCount(monthApptWrapper));

            LambdaQueryWrapper<Appointment> pendingWrapper = new LambdaQueryWrapper<>();
            pendingWrapper.in(Appointment::getDoctorId, doctorIds).eq(Appointment::getStatus, 0);
            dto.setPendingAppointments(appointmentMapper.selectCount(pendingWrapper));

            LambdaQueryWrapper<Appointment> completedWrapper = new LambdaQueryWrapper<>();
            completedWrapper.in(Appointment::getDoctorId, doctorIds).eq(Appointment::getStatus, 1);
            dto.setCompletedAppointments(appointmentMapper.selectCount(completedWrapper));

            LambdaQueryWrapper<Appointment> cancelledWrapper = new LambdaQueryWrapper<>();
            cancelledWrapper.in(Appointment::getDoctorId, doctorIds).eq(Appointment::getStatus, 2);
            dto.setCancelledAppointments(appointmentMapper.selectCount(cancelledWrapper));

            // 收入统计
            List<Appointment> appointments = appointmentMapper.selectList(allApptWrapper);
            BigDecimal totalRevenue = appointments.stream()
                    .filter(a -> a.getFee() != null && a.getPayStatus() == 1)
                    .map(Appointment::getFee)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            dto.setTotalRevenue(totalRevenue);

            // 趋势数据
            dto.setAppointmentTrend(statsMapper.countAppointmentsByDay(30));
            dto.setAppointmentByStatus(statsMapper.countAppointmentsByStatus());

            // 科室统计
            dto.setDepartmentAppointments(statsMapper.countDepartmentAppointmentsByHospital(hospital.getId()));

            // 医生排行
            dto.setDoctorRanking(statsMapper.countDoctorAppointmentsRanking(10));

            // 满意度统计
            List<Map<String, Object>> feedbackList = feedbackMapper.selectMaps(
                    new LambdaQueryWrapper<ConsultationFeedback>()
                            .in(ConsultationFeedback::getDoctorId, doctorIds)
                            .isNotNull(ConsultationFeedback::getRating));
            dto.setSatisfactionDistribution(statsMapper.countFeedbackByRating());

            if (!feedbackList.isEmpty()) {
                double avgRating = feedbackList.stream()
                        .mapToInt(m -> ((Number) m.get("rating")).intValue())
                        .average()
                        .orElse(0.0);
                dto.setAverageRating(avgRating);
            } else {
                dto.setAverageRating(0.0);
            }
        } else {
            dto.setTotalAppointments(0L);
            dto.setMonthlyAppointments(0L);
            dto.setPendingAppointments(0L);
            dto.setCompletedAppointments(0L);
            dto.setCancelledAppointments(0L);
            dto.setTotalRevenue(BigDecimal.ZERO);
            dto.setAverageRating(0.0);
        }

        // 医生数量
        dto.setTotalDoctors(doctorProfileMapper.selectCount(
                new LambdaQueryWrapper<DoctorProfile>().eq(DoctorProfile::getHospitalId, hospital.getId())));

        return dto;
    }

    @Override
    public DoctorOverviewDTO getDoctorOverview(Long doctorId) {
        DoctorOverviewDTO dto = new DoctorOverviewDTO();

        // 获取医生信息
        DoctorProfile profile = doctorProfileMapper.selectById(doctorId);
        if (profile == null) {
            throw new RuntimeException("未找到医生信息");
        }

        dto.setDoctorName(profile.getRealName());
        dto.setTitle(profile.getTitle());

        Hospital hospital = hospitalMapper.selectById(profile.getHospitalId());
        if (hospital != null) {
            dto.setHospitalName(hospital.getName());
        }

        Department department = departmentMapper.selectById(profile.getDepartmentId());
        if (department != null) {
            dto.setDepartmentName(department.getName());
        }

        // 患者统计
        Long patientCount = statsMapper.countDoctorPatients(doctorId);
        dto.setTotalPatients(patientCount != null ? patientCount : 0L);

        // 预约统计
        LambdaQueryWrapper<Appointment> allWrapper = new LambdaQueryWrapper<>();
        allWrapper.eq(Appointment::getDoctorId, doctorId);
        dto.setTotalAppointments(appointmentMapper.selectCount(allWrapper));

        String currentMonth = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        LambdaQueryWrapper<Appointment> monthWrapper = new LambdaQueryWrapper<>();
        monthWrapper.eq(Appointment::getDoctorId, doctorId)
                .likeRight(Appointment::getCreateTime, currentMonth);
        dto.setMonthlyAppointments(appointmentMapper.selectCount(monthWrapper));

        LambdaQueryWrapper<Appointment> pendingWrapper = new LambdaQueryWrapper<>();
        pendingWrapper.eq(Appointment::getDoctorId, doctorId).eq(Appointment::getStatus, 0);
        dto.setPendingAppointments(appointmentMapper.selectCount(pendingWrapper));

        LambdaQueryWrapper<Appointment> completedWrapper = new LambdaQueryWrapper<>();
        completedWrapper.eq(Appointment::getDoctorId, doctorId).eq(Appointment::getStatus, 1);
        dto.setCompletedAppointments(appointmentMapper.selectCount(completedWrapper));

        LambdaQueryWrapper<Appointment> cancelledWrapper = new LambdaQueryWrapper<>();
        cancelledWrapper.eq(Appointment::getDoctorId, doctorId).eq(Appointment::getStatus, 2);
        dto.setCancelledAppointments(appointmentMapper.selectCount(cancelledWrapper));

        LambdaQueryWrapper<Appointment> noShowWrapper = new LambdaQueryWrapper<>();
        noShowWrapper.eq(Appointment::getDoctorId, doctorId).eq(Appointment::getStatus, 3);
        dto.setNoShowAppointments(appointmentMapper.selectCount(noShowWrapper));

        // 今日预约
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        LambdaQueryWrapper<Appointment> todayWrapper = new LambdaQueryWrapper<>();
        todayWrapper.eq(Appointment::getDoctorId, doctorId)
                .likeRight(Appointment::getCreateTime, today);
        dto.setTodayAppointments(appointmentMapper.selectCount(todayWrapper));

        LambdaQueryWrapper<Appointment> todayCompletedWrapper = new LambdaQueryWrapper<>();
        todayCompletedWrapper.eq(Appointment::getDoctorId, doctorId)
                .likeRight(Appointment::getCreateTime, today)
                .eq(Appointment::getStatus, 1);
        dto.setTodayCompleted(appointmentMapper.selectCount(todayCompletedWrapper));

        // 明日预约
        String tomorrow = LocalDate.now().plusDays(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        LambdaQueryWrapper<Appointment> tomorrowWrapper = new LambdaQueryWrapper<>();
        tomorrowWrapper.eq(Appointment::getDoctorId, doctorId)
                .likeRight(Appointment::getCreateTime, tomorrow);
        dto.setTomorrowAppointments(appointmentMapper.selectCount(tomorrowWrapper));

        // 收入统计
        List<Appointment> appointments = appointmentMapper.selectList(allWrapper);
        BigDecimal totalRevenue = appointments.stream()
                .filter(a -> a.getFee() != null && a.getPayStatus() == 1)
                .map(Appointment::getFee)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalRevenue(totalRevenue);

        // 病历数 - 通过预约关联查询
        LambdaQueryWrapper<Appointment> apptWrapper = new LambdaQueryWrapper<>();
        apptWrapper.eq(Appointment::getDoctorId, doctorId);
        List<Appointment> doctorAppts = appointmentMapper.selectList(apptWrapper);
        List<Long> apptIds = doctorAppts.stream().map(Appointment::getId).collect(Collectors.toList());

        Long recordCount = 0L;
        if (!apptIds.isEmpty()) {
            LambdaQueryWrapper<MedicalRecord> recordWrapper = new LambdaQueryWrapper<>();
            recordWrapper.in(MedicalRecord::getAppointmentId, apptIds);
            recordCount = medicalRecordMapper.selectCount(recordWrapper);
        }
        dto.setTotalMedicalRecords(recordCount != null ? recordCount : 0L);

        // 趋势数据
        dto.setAppointmentTrend(statsMapper.countDoctorAppointmentsByDay(doctorId, 30));

        // 满意度统计
        List<Map<String, Object>> feedbackList = feedbackMapper.selectMaps(
                new LambdaQueryWrapper<ConsultationFeedback>()
                        .eq(ConsultationFeedback::getDoctorId, doctorId)
                        .isNotNull(ConsultationFeedback::getRating));
        dto.setSatisfactionDistribution(statsMapper.countFeedbackByRating());

        if (!feedbackList.isEmpty()) {
            double avgRating = feedbackList.stream()
                    .mapToInt(m -> ((Number) m.get("rating")).intValue())
                    .average()
                    .orElse(0.0);
            dto.setAverageRating(avgRating);
            dto.setTotalRatings((long) feedbackList.size());

            long goodCount = feedbackList.stream()
                    .filter(m -> ((Number) m.get("rating")).intValue() >= 4)
                    .count();
            dto.setGoodRatingCount(goodCount);
        } else {
            dto.setAverageRating(0.0);
            dto.setTotalRatings(0L);
            dto.setGoodRatingCount(0L);
        }

        // 排班统计
        Long totalSchedules = scheduleMapper.selectCount(
                new LambdaQueryWrapper<DoctorSchedule>().eq(DoctorSchedule::getDoctorId, doctorId));
        Long availableSchedules = scheduleMapper.selectCount(
                new LambdaQueryWrapper<DoctorSchedule>()
                        .eq(DoctorSchedule::getDoctorId, doctorId)
                        .eq(DoctorSchedule::getStatus, 1));
        dto.setTotalSchedules(totalSchedules != null ? totalSchedules : 0L);
        dto.setAvailableSchedules(availableSchedules != null ? availableSchedules : 0L);

        if (totalSchedules != null && totalSchedules > 0 && availableSchedules != null) {
            dto.setScheduleUtilization((double) availableSchedules / totalSchedules * 100);
        } else {
            dto.setScheduleUtilization(0.0);
        }

        return dto;
    }

}
