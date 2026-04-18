package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.ConsultationField;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistQualification;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IDictDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 字典数据控制器
 *
 * @author AI Developer
 * @since 2026-04-14
 */
@RestController
@RequestMapping("/dict")
@RequiredArgsConstructor
public class DictController {

    private final IDictDataService dictDataService;

    /**
     * 获取所有咨询领域
     */
    @GetMapping("/consultation-fields")
    public Result<List<ConsultationField>> getConsultationFields() {
        List<ConsultationField> fields = dictDataService.getAllConsultationFields();
        return Result.success(fields);
    }

    /**
     * 获取所有资质类型
     */
    @GetMapping("/qualifications")
    public Result<List<PsychologistQualification>> getQualifications() {
        List<PsychologistQualification> qualifications = dictDataService.getAllQualifications();
        return Result.success(qualifications);
    }

    /**
     * 根据ID获取咨询领域
     */
    @GetMapping("/consultation-field/{id}")
    public Result<ConsultationField> getConsultationField(@PathVariable Integer id) {
        ConsultationField field = dictDataService.getConsultationFieldById(id);
        if (field == null) {
            return Result.error("咨询领域不存在");
        }
        return Result.success(field);
    }

    /**
     * 根据ID获取资质类型
     */
    @GetMapping("/qualification/{id}")
    public Result<PsychologistQualification> getQualification(@PathVariable Integer id) {
        PsychologistQualification qualification = dictDataService.getQualificationById(id);
        if (qualification == null) {
            return Result.error("资质类型不存在");
        }
        return Result.success(qualification);
    }

    /**
     * 刷新字典数据缓存
     */
    @PostMapping("/refresh")
    public Result<String> refreshDictCache() {
        dictDataService.refreshDictCache();
        return Result.success("刷新成功");
    }
}
