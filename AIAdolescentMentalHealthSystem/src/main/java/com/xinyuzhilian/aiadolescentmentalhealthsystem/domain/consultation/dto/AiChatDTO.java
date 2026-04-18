package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.dto;

import lombok.Data;

@Data
public class AiChatDTO {
    private String message;
    private Long sessionId; // If null, create new session
    private Boolean enableThinking; // Default false
}
