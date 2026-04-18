package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.ArticleVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Article;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Course;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IArticleService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ICourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto.CourseDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.utils.ValidatorUtils;
import org.springframework.web.multipart.MultipartFile;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.ArticleCommentVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.ArticleDetailVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.ArticleComment;

import java.util.List;

/**
 * 内容管理控制器
 * 处理文章和课程的增删改查及文件上传
 */
@RestController
@RequestMapping("/content")
@RequiredArgsConstructor
public class ContentController {

    private final IArticleService articleService;
    private final ICourseService courseService;
    private final com.xinyuzhilian.aiadolescentmentalhealthsystem.utils.OSSUtil ossUtil;

    // --- 文章相关 ---

    @GetMapping("/article/detail/{id}")
    public Result<ArticleDetailVO> getArticleDetail(@PathVariable Long id, @CurrentUserId Long userId) {
        return articleService.getArticleDetail(id, userId);
    }

    @PostMapping("/article/interact")
    public Result<String> interact(@RequestParam Long articleId, @RequestParam Integer type, @CurrentUserId Long userId) {
        return articleService.interact(articleId, type, userId);
    }

    @PostMapping("/article/comment")
    public Result<String> addComment(@RequestBody ArticleComment comment, @CurrentUserId Long userId) {
        return articleService.addComment(comment, userId);
    }

    @GetMapping("/article/comments/{articleId}")
    public Result<List<ArticleCommentVO>> getComments(@PathVariable Long articleId, @CurrentUserId Long userId) {
        return articleService.getComments(articleId, userId);
    }

    @PostMapping("/article/comment/like/{commentId}")
    public Result<String> likeComment(@PathVariable Long commentId, @CurrentUserId Long userId) {
        return articleService.likeComment(commentId, userId);
    }

    @PutMapping("/article")
    public Result<String> updateArticle(@RequestBody Article article, @CurrentUserId Long userId, @RequestParam(required = false) Integer role) {
        return articleService.saveArticle(article, userId, role);
    }

    /**
     * 分页查询文章列表（用户端）
     *
     * @param page 页码
     * @param size 每页大小
     * @param type 文章类型过滤
     * @return 文章分页结果
     */
    @GetMapping("/articles")
    public Result<PageResult<Article>> getArticleList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String type) {
        
        return Result.success(articleService.getArticleList(page, size, type));
    }

    /**
     * 获取文章详情
     *
     * @param id 文章ID
     * @return 文章详情
     */
    @GetMapping("/article/{id}")
    public Result<Article> getArticleDetail(@PathVariable Long id) {
        return Result.success(articleService.getById(id));
    }

    // --- 课程相关 ---

    /**
     * 保存课程（包含详情）
     *
     * @param courseDTO 课程数据传输对象
     * @return 操作结果
     */
    @PostMapping("/course")
    public Result<String> saveCourse(@RequestBody CourseDTO courseDTO) {
        try {
            courseService.saveCourseWithDetails(courseDTO);
            return Result.success("保存成功", null);
        } catch (Exception e) {
            return Result.error(500, "保存失败: " + e.getMessage());
        }
    }

    /**
     * 上传课程封面
     *
     * @param file 封面文件
     * @return 上传后的URL
     */
    @PostMapping("/course/cover/upload")
    public Result<String> uploadCover(MultipartFile file) {
        try {
            ValidatorUtils.validateImage(file);
            String url = ossUtil.uploadFile(file, "course/cover");
            return Result.success("上传成功", url);
        } catch (Exception e) {
            return Result.error(400, e.getMessage());
        }
    }

    /**
     * 分页查询课程列表（用户端）
     *
     * @param page 页码
     * @param size 每页大小
     * @param type 课程类型过滤
     * @return 课程分页结果
     */
    @GetMapping("/courses")
    public Result<PageResult<Course>> getCourseList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String type) {
        
        return Result.success(courseService.getCourseList(page, size, type));
    }

    /**
     * 获取课程详情
     *
     * @param id 课程ID
     * @return 课程详情
     */
    @GetMapping("/course/{id}")
    public Result<Course> getCourseDetail(@PathVariable Long id) {
        return Result.success(courseService.getById(id));
    }

    // --- 管理员接口 ---

    /**
     * 保存或更新文章（管理员）
     *
     * @param article 文章对象
     * @return 操作结果
     */
    @PostMapping("/article")
    public Result<String> saveArticle(@RequestBody Article article, @CurrentUserId Long userId, @RequestParam(required = false) Integer role) {
        return articleService.saveArticle(article, userId, role);
    }

    /**
     * 删除文章（管理员）
     *
     * @param id 文章ID
     * @return 操作结果
     */
    @DeleteMapping("/article/{id}")
    public Result<String> deleteArticle(@PathVariable Long id, @CurrentUserId Long userId, @RequestParam(required = false) Integer role) {
        return articleService.deleteArticle(id, userId, role);
    }

    /**
     * 保存课程（旧接口，管理员）
     *
     * @param course 课程对象
     * @return 操作结果
     */
    @PostMapping("/course/old")
    public Result<String> saveCourseOld(@RequestBody Course course) {
        courseService.saveCourseOld(course);
        return Result.success("保存成功", null);
    }

    /**
     * 删除课程（管理员）
     *
     * @param id 课程ID
     * @return 操作结果
     */
    @DeleteMapping("/course/{id}")
    public Result<String> deleteCourse(@PathVariable Long id) {
        courseService.removeById(id);
        return Result.success("删除成功", null);
    }
    
    /**
     * 分页查询文章列表（管理员）
     * 超级管理员可以查看所有文章（包括用户文章和官方文章）
     *
     * @param page  页码
     * @param size  每页大小
     * @param title 标题关键词
     * @return 文章分页结果（包含来源标识）
     */
    @GetMapping("/admin/articles")
    public Result<PageResult<ArticleVO>> getAdminArticles(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String title,
            @CurrentUserId Long userId,
            @RequestParam(required = false) Integer role) {

        return Result.success(articleService.getAllArticlesForAdmin(page, size, title, userId, role));
    }

    /**
     * 分页查询课程列表（管理员）
     *
     * @param page  页码
     * @param size  每页大小
     * @param title 标题关键词
     * @param type  课程分类(VIDEO/AUDIO等)
     * @return 课程分页结果
     */
    @GetMapping("/admin/courses")
    public Result<PageResult<Course>> getAdminCourses(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String type) {

        return Result.success(courseService.getAdminCourses(page, size, title, type));
    }

    /**
     * 获取课程详情（管理员，包含DTO详情）
     *
     * @param id 课程ID
     * @return 课程详情DTO
     */
    @GetMapping("/admin/course/{id}")
    public Result<CourseDTO> getAdminCourseDetail(@PathVariable Long id) {
        return Result.success(courseService.getCourseWithDetails(id));
    }
}
