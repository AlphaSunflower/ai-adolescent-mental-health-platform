package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Article;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Course;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto.AdminOverviewDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.AiSessionMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.ArticleMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.AssessmentRecordMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.CourseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.StatsMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements IStatsService {

    private final StatsMapper statsMapper;
    private final UserMapper userMapper;
    private final ArticleMapper articleMapper;
    private final CourseMapper courseMapper;
    private final AssessmentRecordMapper assessmentRecordMapper;
    private final AiSessionMapper aiSessionMapper;

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

        // 内容统计
        LambdaQueryWrapper<Article> articleWrapper = new LambdaQueryWrapper<>();
        articleWrapper.eq(Article::getStatus, 1);
        dto.setTotalArticles(articleMapper.selectCount(articleWrapper));

        LambdaQueryWrapper<Course> courseWrapper = new LambdaQueryWrapper<>();
        courseWrapper.eq(Course::getStatus, 1);
        dto.setTotalCourses(courseMapper.selectCount(courseWrapper));

        dto.setTotalAssessments(assessmentRecordMapper.selectCount(null));
        dto.setTotalAiConsultations(aiSessionMapper.selectCount(null));
        dto.setTotalPsychologists(userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getIsPsychologist, 1)));

        // 趋势数据
        dto.setUserTrend(statsMapper.countUsersByMonth(6));
        dto.setArticleTrend(statsMapper.countArticlesByMonth(6));
        dto.setCourseTrend(statsMapper.countArticlesByMonth(6));
        dto.setAssessmentTrend(statsMapper.countAssessmentsByMonth(6));
        dto.setAiConsultationTrend(statsMapper.countAiSessionsByMonth(6));

        // 分布数据
        dto.setUserRoleDistribution(statsMapper.countUsersByRole());

        // 排行榜
        dto.setArticleRanking(statsMapper.getArticleViewRanking(10));
        dto.setCourseRanking(statsMapper.getCourseStudentRanking(5));

        return dto;
    }
}
