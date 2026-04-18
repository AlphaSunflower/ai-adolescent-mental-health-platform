package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.dto.AppointmentCompletionRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.dto.AppointmentRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.vo.AppointmentDetailVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.vo.AppointmentVO;

public interface IConsultationService {
    Result<String> bookAppointment(AppointmentRequest request, Long userId);
    Result<String> payAppointment(Long id, Long userId);
    Result<String> cancelAppointment(Long id, Long userId);
    Result<AppointmentDetailVO> getAppointmentDetail(Long id, Long userId);
    PageResult<AppointmentVO> myAppointments(Integer page, Integer size, Long userId);
    PageResult<AppointmentVO> getDoctorAppointments(Integer page, Integer size, Integer status, Long doctorId);
    void updateAppointmentStatus(Long id, Integer status);

    Result<String> completeAppointment(AppointmentCompletionRequest request, Long doctorId);

    Result<String> missedAppointment(Long id, Long doctorId);

    Result<String> rescheduleAppointment(Long id, Long newScheduleId, Long doctorId);

    Result<String> refundAppointment(Long id);
}