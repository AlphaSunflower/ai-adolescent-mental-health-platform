package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.MedicalRecord;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.vo.MedicalRecordVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.MedicalRecordService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medical-record")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @GetMapping("/list/{patientId}")
    public Result<List<MedicalRecordVO>> listByPatient(@PathVariable Long patientId, @CurrentUserId Long userId) {
        return medicalRecordService.listByPatient(patientId, userId);
    }

    @PostMapping("/add")
    public Result<String> addRecord(@RequestBody RecordRequest request, @CurrentUserId Long userId) {
        return medicalRecordService.addRecord(request.getRecord(), request.getImages(), userId);
    }

    @PutMapping("/update")
    public Result<String> updateRecord(@RequestBody RecordRequest request, @CurrentUserId Long userId) {
        return medicalRecordService.updateRecord(request.getRecord(), request.getImages(), userId);
    }

    @DeleteMapping("/{id}")
    public Result<String> deleteRecord(@PathVariable Long id, @CurrentUserId Long userId) {
        return medicalRecordService.deleteRecord(id, userId);
    }

    @GetMapping("/{id}")
    public Result<MedicalRecordVO> getDetail(@PathVariable Long id, @CurrentUserId Long userId) {
        return medicalRecordService.getDetail(id, userId);
    }

    @Data
    public static class RecordRequest {
        private MedicalRecord record;
        private List<String> images;
    }
}
