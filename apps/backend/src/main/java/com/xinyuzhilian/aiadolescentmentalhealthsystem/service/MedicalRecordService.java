package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.MedicalRecord;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.vo.MedicalRecordVO;

import java.util.List;

public interface MedicalRecordService extends IService<MedicalRecord> {
    Result<List<MedicalRecordVO>> listByPatient(Long patientId, Long userId);
    Result<String> addRecord(MedicalRecord record, List<String> images, Long userId);
    Result<String> updateRecord(MedicalRecord record, List<String> images, Long userId);
    Result<String> deleteRecord(Long id, Long userId);
    Result<MedicalRecordVO> getDetail(Long id, Long userId);
}
