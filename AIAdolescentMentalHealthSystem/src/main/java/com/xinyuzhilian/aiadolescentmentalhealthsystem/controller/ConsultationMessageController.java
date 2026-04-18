package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.ConsultationMessage;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl.ConsultationMessageSseServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IConsultationMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 医患咨询消息控制器
 */
@RestController
@RequestMapping("/consultation/message")
@RequiredArgsConstructor
public class ConsultationMessageController {

    private final IConsultationMessageService messageService;
    private final ConsultationMessageSseServiceImpl sseService;
    private final com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.AppointmentMapper appointmentMapper;
    private final com.xinyuzhilian.aiadolescentmentalhealthsystem.utils.JwtUtil jwtUtil;

    @PostMapping("/send")
    public Result<String> sendMessage(@RequestBody ConsultationMessage message, @CurrentUserId Long userId) {
        return messageService.sendMessage(message, userId);
    }

    @GetMapping("/history/{appointmentId}")
    public Result<List<ConsultationMessage>> getMessages(@PathVariable Long appointmentId, @CurrentUserId Long userId) {
        return Result.success(messageService.getMessages(appointmentId, userId));
    }

    /**
     * SSE实时消息流
     * 用于客户端订阅指定预约的消息实时推送
     */
    @GetMapping("/stream/{appointmentId}")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter stream(@PathVariable Long appointmentId,
                                                                                   @RequestParam(required = false) String token) {
        Long userId = null;
        try {
            if (token != null && !token.isEmpty()) {
                io.jsonwebtoken.Claims claims = jwtUtil.parse(token);
                Object uid = claims.get("userId");
                if (uid != null) {
                    userId = Long.valueOf(uid.toString());
                }
            }
        } catch (Exception ignored) {}
        if (userId == null) {
            org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter = new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(0L);
            emitter.complete();
            return emitter;
        }
        com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Appointment appt = appointmentMapper.selectById(appointmentId);
        if (appt == null || (!appt.getUserId().equals(userId) && !appt.getDoctorId().equals(userId))) {
            org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter = new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(0L);
            emitter.complete();
            return emitter;
        }
        return sseService.addEmitter(appointmentId);
    }
}
