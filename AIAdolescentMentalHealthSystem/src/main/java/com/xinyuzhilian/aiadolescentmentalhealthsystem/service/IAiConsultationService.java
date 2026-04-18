package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.dto.AiChatDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.AiMessage;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.AiSession;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

public interface IAiConsultationService {
    AiSession createSession(Long userId);
    List<AiSession> getUserSessions(Long userId);
    List<AiMessage> getSessionMessages(Long sessionId, Long userId);
    SseEmitter chat(Long userId, AiChatDTO chatDTO);
    void deleteSession(Long sessionId, Long userId);
}
