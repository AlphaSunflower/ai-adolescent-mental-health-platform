package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Article;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.AssessmentTemplate;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Course;
import lombok.Data;
import java.util.List;

@Data
public class UserArticleVO {
    private Long id;
    private Long userId;
    private String userNickname;
    private String userAvatar;
    private String title;
    private String content;
    private String coverUrl;
    private Long tagId;
    private String tagName;
    private Integer status;
    private String rejectReason;
    private Integer likeCount;
    private Integer dislikeCount;
    private Integer collectionCount;
    private Integer commentCount;
    private Integer viewCount;
    private String createTime;
    private Boolean liked;
    private Boolean disliked;
    private Boolean collected;
    // 推荐内容
    private List<UserArticleVO> recommendedArticles;
    private List<Course> recommendedCourses;
    private List<AssessmentTemplate> recommendedAssessments;
}
