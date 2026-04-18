package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.dto.AiChatDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.AiMessage;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.AiSession;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IAiConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiConsultationController {

    private final IAiConsultationService aiConsultationService;

    @GetMapping("/sessions")
    public Result<List<AiSession>> getUserSessions(@CurrentUserId Long userId) {
        return Result.success(aiConsultationService.getUserSessions(userId));
    }

    @PostMapping("/session")
    public Result<AiSession> createSession(@CurrentUserId Long userId) {
        return Result.success(aiConsultationService.createSession(userId));
    }

    @DeleteMapping("/session/{id}")
    public Result<String> deleteSession(@PathVariable Long id, @CurrentUserId Long userId) {
        aiConsultationService.deleteSession(id, userId);
        return Result.success("删除成功", null);
    }

    @GetMapping("/session/{id}/messages")
    public Result<List<AiMessage>> getSessionMessages(@PathVariable Long id, @CurrentUserId Long userId) {
        return Result.success(aiConsultationService.getSessionMessages(id, userId));
    }

    @PostMapping("/chat")
    public SseEmitter chat(@RequestBody AiChatDTO chatDTO, @CurrentUserId Long userId) {
        return aiConsultationService.chat(userId, chatDTO);
    }
}
