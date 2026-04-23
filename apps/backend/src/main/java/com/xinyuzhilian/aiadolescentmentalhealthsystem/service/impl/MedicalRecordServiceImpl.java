package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.vo.MedicalRecordVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.MedicalRecordImageMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.MedicalRecordMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.PatientContactMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl extends ServiceImpl<MedicalRecordMapper, MedicalRecord> implements MedicalRecordService {

    private final MedicalRecordImageMapper imageMapper;
    private final PatientContactMapper patientContactMapper;
    private final com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.AppointmentMapper appointmentMapper;
    private final com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserMapper userMapper;

    private boolean hasAccess(Long patientContactId, Long userId) {
        // 1. Check if owner
        PatientContact contact = patientContactMapper.selectById(patientContactId);
        if (contact != null && contact.getUserId().equals(userId)) {
            return true;
        }
        
        // 2. Check if doctor/admin with appointment
        User user = userMapper.selectById(userId);
        if (user != null && (user.getRole() == 2 || user.getRole() == 3)) {
            LambdaQueryWrapper<Appointment> apptWrapper = new LambdaQueryWrapper<>();
            apptWrapper.eq(Appointment::getPatientContactId, patientContactId);
            if (user.getRole() == 2) {
                apptWrapper.eq(Appointment::getDoctorId, userId);
            }
            // For Hospital Admin (Role 3), ideally check hospital ID, but for now allow if any appt exists
            return appointmentMapper.selectCount(apptWrapper) > 0;
        }
        
        return false;
    }

    private boolean checkOwner(Long patientContactId, Long userId) {
        PatientContact contact = patientContactMapper.selectById(patientContactId);
        return contact != null && contact.getUserId().equals(userId);
    }

    @Override
    public Result<List<MedicalRecordVO>> listByPatient(Long patientId, Long userId) {
        if (!hasAccess(patientId, userId)) {
            return Result.error("无权查看");
        }
        LambdaQueryWrapper<MedicalRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MedicalRecord::getPatientContactId, patientId);
        wrapper.orderByDesc(MedicalRecord::getVisitDate);
        List<MedicalRecord> records = baseMapper.selectList(wrapper);
        
        List<MedicalRecordVO> vos = records.stream().map(this::convertToVO).collect(Collectors.toList());
        return Result.success(vos);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> addRecord(MedicalRecord record, List<String> images, Long userId) {
        if (!hasAccess(record.getPatientContactId(), userId)) {
            return Result.error("无权操作");
        }
        baseMapper.insert(record);
        if (images != null && !images.isEmpty()) {
            for (String url : images) {
                MedicalRecordImage img = new MedicalRecordImage();
                img.setRecordId(record.getId());
                img.setImageUrl(url);
                imageMapper.insert(img);
            }
        }
        return Result.success("添加成功");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> updateRecord(MedicalRecord record, List<String> images, Long userId) {
        MedicalRecord existing = baseMapper.selectById(record.getId());
        if (existing == null || !checkOwner(existing.getPatientContactId(), userId)) {
            return Result.error("病历不存在或无权操作");
        }
        baseMapper.updateById(record);
        
        // Update images: simplest is to delete and re-insert
        LambdaQueryWrapper<MedicalRecordImage> imgWrapper = new LambdaQueryWrapper<>();
        imgWrapper.eq(MedicalRecordImage::getRecordId, record.getId());
        imageMapper.delete(imgWrapper);
        
        if (images != null && !images.isEmpty()) {
            for (String url : images) {
                MedicalRecordImage img = new MedicalRecordImage();
                img.setRecordId(record.getId());
                img.setImageUrl(url);
                imageMapper.insert(img);
            }
        }
        return Result.success("更新成功");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> deleteRecord(Long id, Long userId) {
        MedicalRecord existing = baseMapper.selectById(id);
        if (existing == null || !checkOwner(existing.getPatientContactId(), userId)) {
            return Result.error("病历不存在或无权操作");
        }
        baseMapper.deleteById(id);
        LambdaQueryWrapper<MedicalRecordImage> imgWrapper = new LambdaQueryWrapper<>();
        imgWrapper.eq(MedicalRecordImage::getRecordId, id);
        imageMapper.delete(imgWrapper);
        return Result.success("删除成功");
    }

    @Override
    public Result<MedicalRecordVO> getDetail(Long id, Long userId) {
        MedicalRecord record = baseMapper.selectById(id);
        if (record == null || !hasAccess(record.getPatientContactId(), userId)) {
            return Result.error("病历不存在或无权查看");
        }
        return Result.success(convertToVO(record));
    }

    private MedicalRecordVO convertToVO(MedicalRecord record) {
        MedicalRecordVO vo = new MedicalRecordVO();
        vo.setId(record.getId());
        vo.setPatientContactId(record.getPatientContactId());
        vo.setAppointmentId(record.getAppointmentId());
        vo.setSymptoms(record.getSymptoms());
        vo.setVisitDate(record.getVisitDate());
        vo.setDepartment(record.getDepartment());
        vo.setHospital(record.getHospital());
        vo.setRemarks(record.getRemarks());
        vo.setCreateTime(record.getCreateTime());
        
        LambdaQueryWrapper<MedicalRecordImage> imgWrapper = new LambdaQueryWrapper<>();
        imgWrapper.eq(MedicalRecordImage::getRecordId, record.getId());
        List<MedicalRecordImage> imgs = imageMapper.selectList(imgWrapper);
        vo.setImages(imgs.stream().map(MedicalRecordImage::getImageUrl).collect(Collectors.toList()));
        return vo;
    }
}
