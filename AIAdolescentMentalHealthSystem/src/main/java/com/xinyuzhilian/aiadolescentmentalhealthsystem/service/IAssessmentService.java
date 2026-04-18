package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.AssessmentRecord;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.AssessmentTemplate;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.AssessmentRecordVO;
import java.util.List;

public interface IAssessmentService {
    Result<AssessmentTemplate> getTemplate(Long id);
    Result<List<AssessmentTemplate>> getPublicTemplates();
    Result<AssessmentRecord> submitAssessment(Long userId, Long templateId, Long patientContactId, Object answers);
    Result<PageResult<AssessmentRecordVO>> getUserRecords(Long userId, Integer page, Integer size, Long patientContactId);
    Result<AssessmentRecordVO> getRecordDetail(Long recordId, Long userId);

    PageResult<AssessmentTemplate> getAdminTemplates(Integer page, Integer size, String title);
    void saveTemplate(AssessmentTemplate template);
    void deleteTemplate(Long id);
}
