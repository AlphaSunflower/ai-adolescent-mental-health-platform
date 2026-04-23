package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.ConsultationMessage;

import java.util.List;

public interface IConsultationMessageService {
    Result<String> sendMessage(ConsultationMessage message, Long userId);
    List<ConsultationMessage> getMessages(Long appointmentId, Long userId);
}
