package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.AssessmentRecordVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.AssessmentRecord;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.AssessmentTemplate;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IAssessmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 心理测评控制器
 * 处理心理测评相关的请求，包括模板管理、测评提交等
 */
@RestController
@RequestMapping("/assessment")
@RequiredArgsConstructor
public class AssessmentController {

    private final IAssessmentService assessmentService;

    /**
     * 获取测评模板详情
     *
     * @param id 模板ID
     * @return 测评模板对象
     */
    @GetMapping("/template/{id}")
    public Result<AssessmentTemplate> getTemplate(@PathVariable Long id) {
        return assessmentService.getTemplate(id);
    }

    /**
     * 获取公开测评量表列表
     *
     * @return 测评量表列表
     */
    @GetMapping("/templates")
    public Result<List<AssessmentTemplate>> getPublicTemplates() {
        return assessmentService.getPublicTemplates();
    }

    /**
     * 提交测评结果
     *
     * @param templateId 模板ID
     * @param requestBody    用户提交的答案映射
     * @param userId     当前登录用户ID
     * @return 测评记录对象
     */
    @PostMapping("/submit/{templateId}")
    public Result<AssessmentRecord> submit(
            @PathVariable Long templateId,
            @RequestBody Map<String, Object> requestBody,
            @CurrentUserId Long userId) {
        
        Long patientContactId = null;
        if (requestBody.containsKey("patientContactId")) {
            patientContactId = Long.valueOf(requestBody.get("patientContactId").toString());
        }
        Object answers = requestBody.get("answers");
        
        return assessmentService.submitAssessment(userId, templateId, patientContactId, answers);
    }

    /**
     * 获取用户测评记录列表
     */
    @GetMapping("/records")
    public Result<PageResult<AssessmentRecordVO>> getUserRecords(
            @CurrentUserId Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long patientContactId) {
        return assessmentService.getUserRecords(userId, page, size, patientContactId);
    }

    /**
     * 获取单条测评记录详情
     */
    @GetMapping("/record/{recordId}")
    public Result<AssessmentRecordVO> getRecordDetail(
            @PathVariable Long recordId,
            @CurrentUserId Long userId) {
        return assessmentService.getRecordDetail(recordId, userId);
    }

    // --- 管理员接口 ---

    /**
     * 分页查询测评模板列表（管理员）
     *
     * @param page  页码，默认1
     * @param size  每页大小，默认10
     * @param title 标题关键词过滤
     * @return 分页结果
     */
    @GetMapping("/admin/templates")
    public Result<PageResult<AssessmentTemplate>> getAdminTemplates(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String title) {
        
        return Result.success(assessmentService.getAdminTemplates(page, size, title));
    }

    /**
     * 保存或更新测评模板
     *
     * @param template 模板对象
     * @return 操作结果消息
     */
    @PostMapping("/template")
    public Result<String> saveTemplate(@RequestBody AssessmentTemplate template) {
        assessmentService.saveTemplate(template);
        return Result.success("保存成功", null);
    }

    /**
     * 删除测评模板
     *
     * @param id 模板ID
     * @return 操作结果消息
     */
    @DeleteMapping("/template/{id}")
    public Result<String> deleteTemplate(@PathVariable Long id) {
        assessmentService.deleteTemplate(id);
        return Result.success("删除成功", null);
    }
}
