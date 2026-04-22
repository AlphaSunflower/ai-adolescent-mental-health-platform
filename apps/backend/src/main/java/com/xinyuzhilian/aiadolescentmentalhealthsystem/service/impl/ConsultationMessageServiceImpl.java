package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Appointment;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.ConsultationMessage;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.AppointmentMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.ConsultationMessageMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IConsultationMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 医患咨询消息服务实现
 */
@Service
@RequiredArgsConstructor
public class ConsultationMessageServiceImpl implements IConsultationMessageService {

    private final ConsultationMessageMapper messageMapper;
    private final AppointmentMapper appointmentMapper;
    private final ConsultationMessageSseServiceImpl sseService;

    @Override
    public Result<String> sendMessage(ConsultationMessage message, Long userId) {
        Appointment appointment = appointmentMapper.selectById(message.getAppointmentId());
        if (appointment == null) {
            return Result.error("预约不存在");
        }

        // 验证用户是否是预约的参与者
        boolean isPatient = appointment.getUserId().equals(userId);
        boolean isDoctor = appointment.getDoctorId().equals(userId);
        if (!isPatient && !isDoctor) {
            return Result.error("无权发送消息");
        }

        message.setSenderId(userId);
        message.setReceiverId(isPatient ? appointment.getDoctorId() : appointment.getUserId());
        message.setCreateTime(LocalDateTime.now());

        messageMapper.insert(message);

        // 通过SSE实时推送消息
        try {
            sseService.broadcast(message.getAppointmentId(), message);
        } catch (Exception ignored) {}

        return Result.success("消息发送成功", String.valueOf(message.getId()));
    }

    @Override
    public List<ConsultationMessage> getMessages(Long appointmentId, Long userId) {
        Appointment appointment = appointmentMapper.selectById(appointmentId);
        if (appointment == null) {
            return List.of();
        }

        // 验证用户是否是预约的参与者
        if (!appointment.getUserId().equals(userId) && !appointment.getDoctorId().equals(userId)) {
            return List.of();
        }

        LambdaQueryWrapper<ConsultationMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ConsultationMessage::getAppointmentId, appointmentId);
        wrapper.orderByAsc(ConsultationMessage::getCreateTime);
        return messageMapper.selectList(wrapper);
    }
}
