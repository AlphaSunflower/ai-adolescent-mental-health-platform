package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.hospital.dto.DoctorDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Hospital;

public interface IHospitalService extends IService<Hospital> {
    PageResult<Hospital> getHospitals(Integer page, Integer size, String name, Integer status);
    void saveHospital(Hospital hospital);
    void deleteHospital(Long id);
    
    PageResult<DoctorDTO> getMyHospitalDoctors(Long adminId, Integer page, Integer size, String name, Integer status);
    void saveDoctor(Long adminId, DoctorDTO doctorDTO);
    void updateDoctorConsultationSwitch(Long adminId, Long doctorId, Integer onlineEnabled, Integer offlineEnabled);
    void deleteDoctor(Long id);
}
