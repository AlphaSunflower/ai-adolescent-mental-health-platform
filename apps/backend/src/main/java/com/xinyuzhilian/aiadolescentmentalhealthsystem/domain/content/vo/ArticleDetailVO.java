package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Article;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Course;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.AssessmentTemplate;
import lombok.Data;
import java.util.List;

@Data
public class ArticleDetailVO {
    private Article article;
    private boolean isLiked;
    private boolean isDisliked;
    private boolean isCollected;
    private List<Article> recommendedArticles;
    private List<Course> recommendedCourses;
    private List<AssessmentTemplate> recommendedAssessments;
    
    // 作者信息
    private String authorName;
    private String authorAvatar;
    private Integer authorRole;
    private String hospitalName;
}
