package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.dto.AppointmentCompletionRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.dto.AppointmentRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.vo.AppointmentDetailVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.vo.AppointmentVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.vo.MedicalRecordVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IConsultationFeedbackService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IConsultationService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsultationServiceImpl implements IConsultationService {

    private final DoctorScheduleMapper scheduleMapper;
    private final AppointmentMapper appointmentMapper;
    private final DoctorProfileMapper doctorProfileMapper;
    private final UserMapper userMapper;
    private final DoctorPatientRelationMapper relationMapper;
    private final HospitalMapper hospitalMapper;
    private final IConsultationFeedbackService feedbackService;
    private final PatientContactMapper patientContactMapper;
    private final MedicalRecordService medicalRecordService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> bookAppointment(AppointmentRequest request, Long userId) {
        DoctorSchedule schedule = scheduleMapper.selectById(request.getScheduleId());
        if (schedule == null || schedule.getStatus() != 1) {
            return Result.error("排班不存在或已停诊");
        }
        if (schedule.getBookedCount() >= schedule.getMaxPatients()) {
            return Result.error("号源已满");
        }

        // Validate patient contact
        if (request.getPatientContactId() != null) {
            PatientContact contact = patientContactMapper.selectById(request.getPatientContactId());
            if (contact == null || !contact.getUserId().equals(userId)) {
                return Result.error("就诊人信息无效");
            }
        }

        LambdaQueryWrapper<Appointment> active = new LambdaQueryWrapper<>();
        active.eq(Appointment::getUserId, userId);
        active.eq(Appointment::getScheduleId, request.getScheduleId());
        active.in(Appointment::getStatus, 0, 1, 4);
        if (appointmentMapper.selectCount(active) > 0) {
            return Result.error("您已预约该时段");
        }

        Integer appointmentType = request.getType() != null ? request.getType() : 0;
        DoctorProfile doctor = doctorProfileMapper.selectOne(
                new LambdaQueryWrapper<DoctorProfile>().eq(DoctorProfile::getUserId, schedule.getDoctorId()));
        if (doctor == null) {
            return Result.error("医生档案不存在");
        }
        if (appointmentType == 1 && doctor.getIsOnlineConsultEnabled() != null && doctor.getIsOnlineConsultEnabled() == 0) {
            return Result.error("该医生当前未开启线上咨询");
        }
        if (appointmentType == 0 && doctor.getIsOfflineConsultEnabled() != null && doctor.getIsOfflineConsultEnabled() == 0) {
            return Result.error("该医生当前未开启线下咨询");
        }

        Appointment appointment = new Appointment();
        appointment.setUserId(userId);
        appointment.setPatientContactId(request.getPatientContactId());
        appointment.setDoctorId(schedule.getDoctorId());
        appointment.setScheduleId(schedule.getId());
        appointment.setDescription(request.getDescription());
        appointment.setType(appointmentType);

        appointment.setFee(doctor != null ? doctor.getConsultationPrice() : java.math.BigDecimal.ZERO);
        
        appointment.setStatus(4);
        appointment.setPayStatus(0);
        appointmentMapper.insert(appointment);

        schedule.setBookedCount(schedule.getBookedCount() + 1);
        scheduleMapper.updateById(schedule);

        return Result.success("预约成功，请前往支付", String.valueOf(appointment.getId()));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> payAppointment(Long id, Long userId) {
        Appointment appointment = appointmentMapper.selectById(id);
        if (appointment == null || !appointment.getUserId().equals(userId)) {
            return Result.error("预约不存在");
        }
        if (appointment.getStatus() != 4 || appointment.getPayStatus() != 0) {
            return Result.error("订单状态异常或已支付");
        }

        appointment.setPayStatus(1);
        appointment.setPayTime(LocalDateTime.now());
        appointment.setStatus(0);
        appointmentMapper.updateById(appointment);

        LambdaQueryWrapper<DoctorPatientRelation> relationWrapper = new LambdaQueryWrapper<>();
        relationWrapper.eq(DoctorPatientRelation::getDoctorId, appointment.getDoctorId());
        relationWrapper.eq(DoctorPatientRelation::getPatientId, userId);
        if (relationMapper.selectCount(relationWrapper) == 0) {
            DoctorPatientRelation relation = new DoctorPatientRelation();
            relation.setDoctorId(appointment.getDoctorId());
            relation.setPatientId(userId);
            relation.setStatus("NEW");
            relationMapper.insert(relation);
        }

        return Result.success("支付成功", null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> cancelAppointment(Long id, Long userId) {
        Appointment appointment = appointmentMapper.selectById(id);
        if (appointment == null || !appointment.getUserId().equals(userId)) {
            return Result.error("预约不存在");
        }
        if (appointment.getStatus() == 1 || appointment.getStatus() == 2 || appointment.getStatus() == 3) {
            return Result.error("预约已完成、已取消或已爽约，无法取消");
        }
        
        if (appointment.getPayStatus() == 1) {
            appointment.setPayStatus(2); // Refunded
        }
        
        appointment.setStatus(2);
        appointmentMapper.updateById(appointment);

        DoctorSchedule schedule = scheduleMapper.selectById(appointment.getScheduleId());
        if (schedule != null) {
            schedule.setBookedCount(Math.max(0, schedule.getBookedCount() - 1));
            scheduleMapper.updateById(schedule);
        }

        return Result.success("取消成功" + (appointment.getPayStatus() == 2 ? "，费用已退回" : ""), null);
    }

    @Override
    public Result<AppointmentDetailVO> getAppointmentDetail(Long id, Long userId) {
        Appointment appointment = appointmentMapper.selectById(id);
        if (appointment == null) {
            return Result.error("预约不存在");
        }
        
        // Allow patient or assigned doctor or hospital admin to view
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }
        
        boolean canView = appointment.getUserId().equals(userId) || appointment.getDoctorId().equals(userId) || user.getRole() == 3 || user.getRole() == 4;
        if (!canView) {
             return Result.error("无权查看");
        }

        AppointmentDetailVO vo = new AppointmentDetailVO();
        vo.setId(appointment.getId());
        vo.setUserId(appointment.getUserId());
        vo.setStatus(appointment.getStatus());
        vo.setType(appointment.getType());
        vo.setCreateTime(appointment.getCreateTime());
        vo.setDescription(appointment.getDescription());
        vo.setFee(appointment.getFee());
        vo.setPayStatus(appointment.getPayStatus());
        vo.setPayTime(appointment.getPayTime());

        if (appointment.getPatientContactId() != null) {
            PatientContact contact = patientContactMapper.selectById(appointment.getPatientContactId());
            if (contact != null) {
                vo.setPatientName(contact.getName());
                User u = userMapper.selectById(appointment.getUserId());
                if (u != null) {
                    vo.setPatientPhone(u.getPhone());
                }
            }
        } else {
            User u = userMapper.selectById(appointment.getUserId());
            if (u != null) {
                vo.setPatientName(u.getNickname() + "(本人)");
                vo.setPatientPhone(u.getPhone());
            }
        }

        DoctorProfile p = doctorProfileMapper.selectById(appointment.getDoctorId());
        if (p != null) {
            vo.setDoctorName(p.getRealName());
            vo.setDoctorTitle(p.getTitle());
            if (p.getHospitalId() != null) {
                Hospital h = hospitalMapper.selectById(p.getHospitalId());
                if (h != null) {
                    vo.setHospitalName(h.getName());
                    vo.setHospitalAddress(h.getAddress());
                }
            }
        }
        
        DoctorSchedule s = scheduleMapper.selectById(appointment.getScheduleId());
        if (s != null) {
            vo.setWorkDate(s.getWorkDate());
            vo.setWorkShift(s.getWorkShift());
        }

        LambdaQueryWrapper<ConsultationFeedback> feedbackWrapper = new LambdaQueryWrapper<>();
        feedbackWrapper.eq(ConsultationFeedback::getAppointmentId, appointment.getId());
        ConsultationFeedback feedback = feedbackService.getOne(feedbackWrapper);
        
        if (feedback != null) {
            vo.setFeedbackContent(feedback.getContent());
            vo.setFeedbackRating(feedback.getRating());
            vo.setFeedbackReply(feedback.getReplyContent());
        }

        // Fetch medical record if exists
        LambdaQueryWrapper<MedicalRecord> recordWrapper = new LambdaQueryWrapper<>();
        recordWrapper.eq(MedicalRecord::getAppointmentId, appointment.getId());
        MedicalRecord record = medicalRecordService.getOne(recordWrapper);
        if (record != null) {
            Result<MedicalRecordVO> recordDetail = medicalRecordService.getDetail(record.getId(), userId);
            if (recordDetail.getCode() == 200) {
                vo.setMedicalRecord(recordDetail.getData());
            }
        }

        return Result.success(vo);
    }

    @Override
    public PageResult<AppointmentVO> myAppointments(Integer page, Integer size, Long userId) {
        Page<Appointment> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Appointment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Appointment::getUserId, userId);
        wrapper.orderByDesc(Appointment::getCreateTime);
        
        Page<Appointment> appointmentPage = appointmentMapper.selectPage(pageParam, wrapper);
        
        List<AppointmentVO> vos = appointmentPage.getRecords().stream().map(a -> {
            AppointmentVO vo = new AppointmentVO();
            vo.setId(a.getId());
            vo.setStatus(a.getStatus());
            vo.setType(a.getType());
            vo.setCreateTime(a.getCreateTime());
            vo.setDescription(a.getDescription());
            vo.setFee(a.getFee());
            vo.setPayStatus(a.getPayStatus());
            
            DoctorSchedule s = scheduleMapper.selectById(a.getScheduleId());
            if (s != null) {
                vo.setWorkDate(s.getWorkDate());
                vo.setWorkShift(s.getWorkShift());
            }
            
            DoctorProfile p = doctorProfileMapper.selectById(a.getDoctorId());
            if (p != null) {
                vo.setDoctorName(p.getRealName());
                if (p.getHospitalId() != null) {
                    Hospital h = hospitalMapper.selectById(p.getHospitalId());
                    if (h != null) {
                        vo.setHospitalName(h.getName());
                    }
                }
            }
            return vo;
        }).collect(Collectors.toList());

        PageResult<AppointmentVO> result = new PageResult<>();
        result.setRecords(vos);
        result.setTotal(appointmentPage.getTotal());
        result.setSize(appointmentPage.getSize());
        result.setCurrent(appointmentPage.getCurrent());
        result.setPages(appointmentPage.getPages());
        return result;
    }

    @Override
    public PageResult<AppointmentVO> getDoctorAppointments(Integer page, Integer size, Integer status, Long doctorId) {
        Page<Appointment> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Appointment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Appointment::getDoctorId, doctorId);
        if (status != null) {
            wrapper.eq(Appointment::getStatus, status);
        }
        wrapper.orderByDesc(Appointment::getCreateTime);
        
        Page<Appointment> appointmentPage = appointmentMapper.selectPage(pageParam, wrapper);
        
        List<AppointmentVO> vos = appointmentPage.getRecords().stream().map(a -> {
            AppointmentVO vo = new AppointmentVO();
            vo.setId(a.getId());
            vo.setUserId(a.getUserId());
            vo.setPatientContactId(a.getPatientContactId());
            vo.setStatus(a.getStatus());
            vo.setType(a.getType());
            vo.setCreateTime(a.getCreateTime());
            vo.setDescription(a.getDescription());
            vo.setFee(a.getFee());
            vo.setPayStatus(a.getPayStatus());
            
            DoctorSchedule s = scheduleMapper.selectById(a.getScheduleId());
            if (s != null) {
                vo.setWorkDate(s.getWorkDate());
                vo.setWorkShift(s.getWorkShift());
            }
            
            if (a.getPatientContactId() != null) {
                PatientContact contact = patientContactMapper.selectById(a.getPatientContactId());
                if (contact != null) {
                    vo.setPatientName(contact.getName());
                    // Use user phone for contact
                    User u = userMapper.selectById(a.getUserId());
                    if (u != null) {
                        vo.setPatientPhone(u.getPhone());
                    }
                }
            } else {
                User u = userMapper.selectById(a.getUserId());
                if (u != null) {
                    vo.setPatientName(u.getNickname() + "(本人)");
                    vo.setPatientPhone(u.getPhone());
                }
            }
            return vo;
        }).collect(Collectors.toList());

        PageResult<AppointmentVO> result = new PageResult<>();
        result.setRecords(vos);
        result.setTotal(appointmentPage.getTotal());
        result.setSize(appointmentPage.getSize());
        result.setCurrent(appointmentPage.getCurrent());
        result.setPages(appointmentPage.getPages());
        return result;
    }

    @Override
    public void updateAppointmentStatus(Long id, Integer status) {
        Appointment appointment = appointmentMapper.selectById(id);
        if (appointment == null) {
            throw new RuntimeException("预约不存在");
        }
        appointment.setStatus(status);
        appointmentMapper.updateById(appointment);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> completeAppointment(AppointmentCompletionRequest request, Long doctorId) {
        log.info("Completing appointment: {}, doctorId: {}", request, doctorId);
        Appointment appointment = appointmentMapper.selectById(request.getId());
        if (appointment == null || !appointment.getDoctorId().equals(doctorId)) {
            return Result.error("预约不存在");
        }
        
        // 1. Mark appointment as completed
        appointment.setStatus(1);
        appointmentMapper.updateById(appointment);
        
        // 2. Create medical record if patientContactId is present
        if (appointment.getPatientContactId() != null) {
            log.info("Creating medical record for patient contact: {}", appointment.getPatientContactId());
            MedicalRecord record = new MedicalRecord();
            record.setPatientContactId(appointment.getPatientContactId());
            record.setAppointmentId(appointment.getId());
            record.setSymptoms(request.getSymptoms());
            record.setVisitDate(LocalDate.now());
            record.setDepartment(request.getDepartment());
            record.setHospital(request.getHospital());
            record.setRemarks(request.getRemarks());
            
            Result<String> recordResult = medicalRecordService.addRecord(record, request.getImages(), appointment.getUserId());
            log.info("Medical record creation result: {}", recordResult);
            if (recordResult.getCode() != 200) {
                return recordResult;
            }
        } else {
            log.warn("Appointment {} has no patient contact ID, skipping medical record creation", appointment.getId());
        }
        
        return Result.success("就诊已完成，病历已保存");
    }

    @Override
    public Result<String> missedAppointment(Long id, Long doctorId) {
        Appointment appointment = appointmentMapper.selectById(id);
        if (appointment == null || !appointment.getDoctorId().equals(doctorId)) {
            return Result.error("预约不存在");
        }
        appointment.setStatus(3);
        appointmentMapper.updateById(appointment);
        return Result.success("成功标记为爽约");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> rescheduleAppointment(Long id, Long newScheduleId, Long doctorId) {
        Appointment appointment = appointmentMapper.selectById(id);
        if (appointment == null || !appointment.getDoctorId().equals(doctorId)) {
            return Result.error("预约不存在");
        }
        if (appointment.getStatus() != 0 || appointment.getPayStatus() != 1) {
            return Result.error("预约状态异常，无法改期");
        }

        DoctorSchedule newSchedule = scheduleMapper.selectById(newScheduleId);
        if (newSchedule == null || !newSchedule.getDoctorId().equals(doctorId) || newSchedule.getStatus() != 1) {
            return Result.error("新排班无效");
        }
        if (newSchedule.getBookedCount() >= newSchedule.getMaxPatients()) {
            return Result.error("新排班已满");
        }

        DoctorSchedule oldSchedule = scheduleMapper.selectById(appointment.getScheduleId());
        if (oldSchedule != null) {
            oldSchedule.setBookedCount(Math.max(0, oldSchedule.getBookedCount() - 1));
            scheduleMapper.updateById(oldSchedule);
        }

        appointment.setScheduleId(newScheduleId);
        appointment.setIsRescheduled(1);
        appointmentMapper.updateById(appointment);

        newSchedule.setBookedCount(newSchedule.getBookedCount() + 1);
        scheduleMapper.updateById(newSchedule);

        return Result.success("改期成功");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> refundAppointment(Long id) {
        Appointment appointment = appointmentMapper.selectById(id);
        if (appointment == null) {
            return Result.error("预约不存在");
        }
        if (appointment.getPayStatus() != 1) {
            return Result.error("未支付或已退费");
        }

        appointment.setPayStatus(2); // Refunded
        appointment.setStatus(2); // Cancelled
        appointmentMapper.updateById(appointment);

        DoctorSchedule schedule = scheduleMapper.selectById(appointment.getScheduleId());
        if (schedule != null) {
            schedule.setBookedCount(Math.max(0, schedule.getBookedCount() - 1));
            scheduleMapper.updateById(schedule);
        }

        return Result.success("退费成功");
    }
}
