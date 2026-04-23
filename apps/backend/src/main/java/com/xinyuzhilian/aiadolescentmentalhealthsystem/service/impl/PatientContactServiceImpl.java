package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PatientContact;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.PatientContactMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.PatientContactService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientContactServiceImpl extends ServiceImpl<PatientContactMapper, PatientContact> implements PatientContactService {

    @Override
    public Result<List<PatientContact>> listMyPatients(Long userId) {
        LambdaQueryWrapper<PatientContact> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PatientContact::getUserId, userId);
        wrapper.orderByDesc(PatientContact::getCreateTime);
        return Result.success(baseMapper.selectList(wrapper));
    }

    @Override
    public Result<String> addPatient(PatientContact patient, Long userId) {
        patient.setUserId(userId);
        baseMapper.insert(patient);
        return Result.success("添加成功");
    }

    @Override
    public Result<String> updatePatient(PatientContact patient, Long userId) {
        PatientContact existing = baseMapper.selectById(patient.getId());
        if (existing == null || !existing.getUserId().equals(userId)) {
            return Result.error("就诊人不存在或无权操作");
        }
        patient.setUserId(userId); // Ensure userId cannot be changed
        baseMapper.updateById(patient);
        return Result.success("更新成功");
    }

    @Override
    public Result<String> deletePatient(Long id, Long userId) {
        PatientContact existing = baseMapper.selectById(id);
        if (existing == null || !existing.getUserId().equals(userId)) {
            return Result.error("就诊人不存在或无权操作");
        }
        baseMapper.deleteById(id);
        return Result.success("删除成功");
    }
}
