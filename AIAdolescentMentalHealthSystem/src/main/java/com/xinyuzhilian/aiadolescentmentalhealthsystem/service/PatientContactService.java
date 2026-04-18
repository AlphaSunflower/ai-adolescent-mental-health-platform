package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PatientContact;

import java.util.List;

public interface PatientContactService extends IService<PatientContact> {
    Result<List<PatientContact>> listMyPatients(Long userId);
    Result<String> addPatient(PatientContact patient, Long userId);
    Result<String> updatePatient(PatientContact patient, Long userId);
    Result<String> deletePatient(Long id, Long userId);
}
