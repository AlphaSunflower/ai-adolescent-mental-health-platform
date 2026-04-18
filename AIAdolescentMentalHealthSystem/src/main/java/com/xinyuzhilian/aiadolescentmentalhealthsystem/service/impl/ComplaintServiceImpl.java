package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Appointment;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Complaint;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.DoctorProfile;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IComplaintService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements IComplaintService {

    private final ComplaintMapper complaintMapper;
    private final AppointmentMapper appointmentMapper;
    private final IConsultationService consultationService;
    private final UserMapper userMapper;
    private final DoctorProfileMapper doctorProfileMapper;
    private final HospitalMapper hospitalMapper;

    @Override
    public Result<String> submitComplaint(Complaint complaint, Long userId) {
        Appointment appointment = appointmentMapper.selectById(complaint.getAppointmentId());
        if (appointment == null || !appointment.getUserId().equals(userId)) {
            return Result.error("预约不存在或无权投诉");
        }

        complaint.setUserId(userId);
        complaint.setDoctorId(appointment.getDoctorId());
        complaint.setStatus(0); // Pending
        complaint.setCreateTime(LocalDateTime.now());
        
        complaintMapper.insert(complaint);
        return Result.success("投诉已提交，请等待审核");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> auditComplaint(Long complaintId, Integer status, String auditRemark, Long adminUserId) {
        Complaint complaint = complaintMapper.selectById(complaintId);
        if (complaint == null) {
            return Result.error("投诉不存在");
        }

        complaint.setStatus(status);
        complaint.setAuditRemark(auditRemark);
        complaint.setAuditTime(LocalDateTime.now());
        complaintMapper.updateById(complaint);

        // If complaint is accepted, trigger refund
        if (status == 1) {
            consultationService.refundAppointment(complaint.getAppointmentId());
        }

        return Result.success("投诉审核完成");
    }

    @Override
    public PageResult<Complaint> getComplaints(Integer page, Integer size, Long userId, Integer role) {
        Page<Complaint> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Complaint> wrapper = new LambdaQueryWrapper<>();

        if (role == 4) {
            // Super Admin: View all
        } else if (role == 3) {
            // Hospital Admin: View complaints for doctors in their hospital
            LambdaQueryWrapper<com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Hospital> hWrapper = new LambdaQueryWrapper<>();
            hWrapper.eq(com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Hospital::getAdminUserId, userId);
            com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Hospital hospital = hospitalMapper.selectOne(hWrapper);
            if (hospital != null) {
                LambdaQueryWrapper<DoctorProfile> pWrapper = new LambdaQueryWrapper<>();
                pWrapper.eq(DoctorProfile::getHospitalId, hospital.getId());
                java.util.List<Long> doctorIds = doctorProfileMapper.selectList(pWrapper).stream()
                        .map(DoctorProfile::getUserId).collect(java.util.stream.Collectors.toList());
                if (!doctorIds.isEmpty()) {
                    wrapper.in(Complaint::getDoctorId, doctorIds);
                } else {
                    return new PageResult<>(); // No doctors, no complaints
                }
            } else {
                return new PageResult<>();
            }
        } else {
             // Patients: View their own complaints
             wrapper.eq(Complaint::getUserId, userId);
        }
        
        wrapper.orderByDesc(Complaint::getCreateTime);
        Page<Complaint> complaintPage = complaintMapper.selectPage(pageParam, wrapper);

        PageResult<Complaint> result = new PageResult<>();
        result.setRecords(complaintPage.getRecords());
        result.setTotal(complaintPage.getTotal());
        result.setSize(complaintPage.getSize());
        result.setCurrent(complaintPage.getCurrent());
        result.setPages(complaintPage.getPages());
        return result;
    }
}
