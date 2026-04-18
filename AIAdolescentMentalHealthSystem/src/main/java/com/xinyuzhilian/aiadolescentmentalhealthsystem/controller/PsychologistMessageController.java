package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Psychologist;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistAppointment;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistMessage;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.PsychologistMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPsychologistMessageService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl.PsychologistMessageSseServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 心理咨询聊天消息控制器
 *
 * @author AI Developer
 * @since 2026-04-14
 */
@RestController
@RequestMapping("/psychologist/message")
@RequiredArgsConstructor
@Slf4j
public class PsychologistMessageController {

    private final IPsychologistMessageService messageService;
    private final PsychologistMessageSseServiceImpl sseService;
    private final com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.PsychologistAppointmentMapper appointmentMapper;
    private final PsychologistMapper psychologistMapper;
    private final JwtUtil jwtUtil;

    /**
     * 发送消息
     */
    @PostMapping("/send")
    public Result<PsychologistMessage> sendMessage(
            @RequestBody Map<String, Object> request,
            @CurrentUserId Long userId) {
        try {
            Long appointmentId = Long.valueOf(request.get("appointmentId").toString());
            Long receiverId = Long.valueOf(request.get("receiverId").toString());
            String content = request.get("content").toString();
            Integer contentType = 0;
            if (request.containsKey("contentType")) {
                contentType = Integer.valueOf(request.get("contentType").toString());
            }

            // 发送消息并获取返回的消息对象
            PsychologistMessage message = messageService.sendMessage(
                    appointmentId, userId, receiverId, content, contentType);

            // 通过SSE广播消息给订阅者
            broadcastMessage(appointmentId, message);

            return Result.success(message);
        } catch (Exception e) {
            log.error("发送消息失败: {}", e.getMessage(), e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 发送图片消息
     */
    @PostMapping("/send/image")
    public Result<PsychologistMessage> sendImageMessage(
            @RequestBody Map<String, Object> request,
            @CurrentUserId Long userId) {
        try {
            Long appointmentId = Long.valueOf(request.get("appointmentId").toString());
            Long receiverId = Long.valueOf(request.get("receiverId").toString());
            String imageUrl = request.get("imageUrl").toString();

            // 发送图片消息
            PsychologistMessage message = messageService.sendImageMessage(
                    appointmentId, userId, receiverId, imageUrl);

            // 通过SSE广播消息给订阅者
            broadcastMessage(appointmentId, message);

            return Result.success(message);
        } catch (Exception e) {
            log.error("发送图片消息失败: {}", e.getMessage(), e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取消息历史
     */
    @GetMapping("/history/{appointmentId}")
    public Result<List<PsychologistMessage>> getMessageHistory(
            @PathVariable Long appointmentId,
            @CurrentUserId Long userId) {
        try {
            // 验证用户是否有权限查看该预约的消息
            if (!hasPermission(appointmentId, userId)) {
                return Result.error("无权查看该预约的消息");
            }
            List<PsychologistMessage> messages = messageService.getMessageHistory(appointmentId);
            return Result.success(messages);
        } catch (Exception e) {
            log.error("获取消息历史失败: {}", e.getMessage(), e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取新消息（轮询方式）
     */
    @GetMapping("/new/{appointmentId}")
    public Result<List<PsychologistMessage>> getNewMessages(
            @PathVariable Long appointmentId,
            @RequestParam String lastTime,
            @CurrentUserId Long userId) {
        try {
            // 验证用户是否有权限查看该预约的消息
            if (!hasPermission(appointmentId, userId)) {
                return Result.error("无权查看该预约的消息");
            }
            List<PsychologistMessage> messages = messageService.getNewMessages(appointmentId, lastTime);
            return Result.success(messages);
        } catch (Exception e) {
            log.error("获取新消息失败: {}", e.getMessage(), e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * SSE实时消息流 - 用户端订阅
     * 路径: /psychologist/message/stream/{appointmentId}
     */
    @GetMapping("/stream/{appointmentId}")
    public SseEmitter subscribeUser(
            @PathVariable Long appointmentId,
            @RequestParam(required = false) String token) {
        Long userId = parseUserId(token);
        if (userId == null) {
            log.warn("SSE订阅失败：无法解析用户ID, appointmentId={}", appointmentId);
            SseEmitter emitter = new SseEmitter(0L);
            emitter.complete();
            return emitter;
        }

        // 验证用户是否有权限访问该预约
        if (!hasPermission(appointmentId, userId)) {
            log.warn("SSE订阅失败：无权访问该预约, appointmentId={}, userId={}", appointmentId, userId);
            SseEmitter emitter = new SseEmitter(0L);
            emitter.complete();
            return emitter;
        }

        log.info("用户订阅SSE消息流: appointmentId={}, userId={}", appointmentId, userId);
        return sseService.addUserEmitter(appointmentId);
    }

    /**
     * SSE实时消息流 - 咨询师端订阅
     * 路径: /psychologist/message/stream/psychologist/{psychologistId}
     */
    @GetMapping("/stream/psychologist/{psychologistId}")
    public SseEmitter subscribePsychologist(
            @PathVariable Long psychologistId,
            @RequestParam(required = false) String token) {
        Long userId = parseUserId(token);
        if (userId == null) {
            log.warn("咨询师SSE订阅失败：无法解析用户ID, psychologistId={}", psychologistId);
            SseEmitter emitter = new SseEmitter(0L);
            emitter.complete();
            return emitter;
        }

        // 验证用户是否是该咨询师（通过userId匹配psychologist表的user_id字段）
        if (!isPsychologist(userId, psychologistId)) {
            log.warn("咨询师SSE订阅失败：无权访问, psychologistId={}, userId={}", psychologistId, userId);
            SseEmitter emitter = new SseEmitter(0L);
            emitter.complete();
            return emitter;
        }

        log.info("咨询师订阅SSE消息流: psychologistId={}, userId={}", psychologistId, userId);
        return sseService.addPsychologistEmitter(psychologistId);
    }

    /**
     * 获取咨询师的预约列表（用于咨询师端显示用户列表）
     */
    @GetMapping("/conversations")
    public Result<List<Map<String, Object>>> getConversations(
            @CurrentUserId Long userId) {
        try {
            // 获取当前用户对应的咨询师ID
            Long psychologistId = getPsychologistIdByUserId(userId);
            if (psychologistId == null) {
                return Result.error("用户不是心理咨询师");
            }

            // 查询该咨询师的所有已确认预约
            LambdaQueryWrapper<PsychologistAppointment> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(PsychologistAppointment::getPsychologistId, psychologistId);
            wrapper.eq(PsychologistAppointment::getStatus, PsychologistAppointment.STATUS_CONFIRMED);
            wrapper.orderByDesc(PsychologistAppointment::getCreateTime);
            List<PsychologistAppointment> appointments = appointmentMapper.selectList(wrapper);

            // 转换为对话列表
            List<Map<String, Object>> conversations = appointments.stream().map(appt -> {
                Map<String, Object> map = new HashMap<>();
                map.put("appointmentId", appt.getId());
                map.put("userId", appt.getUserId());
                map.put("psychologistId", appt.getPsychologistId());
                map.put("serviceType", appt.getServiceType());
                map.put("status", appt.getStatus());
                map.put("createTime", appt.getCreateTime());
                map.put("userProblems", appt.getUserProblems());
                map.put("userBasicInfo", appt.getUserBasicInfo());
                return map;
            }).toList();

            return Result.success(conversations);
        } catch (Exception e) {
            log.error("获取对话列表失败: {}", e.getMessage(), e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 广播消息给订阅者
     */
    private void broadcastMessage(Long appointmentId, PsychologistMessage message) {
        try {
            // 获取预约信息
            PsychologistAppointment appointment = appointmentMapper.selectById(appointmentId);
            if (appointment == null) {
                log.warn("广播消息失败：预约不存在, appointmentId={}", appointmentId);
                return;
            }

            // 推送给用户端（按预约ID）
            sseService.broadcastToAppointment(appointmentId, message);

            // 推送给咨询师端（按咨询师ID）
            sseService.broadcastToPsychologist(appointment.getPsychologistId(), message);

            log.debug("消息已广播: appointmentId={}, messageId={}, senderId={}", 
                    appointmentId, message.getId(), message.getSenderId());
        } catch (Exception e) {
            log.error("广播消息失败: {}", e.getMessage(), e);
        }
    }

    /**
     * 验证用户是否有权限访问该预约
     */
    private boolean hasPermission(Long appointmentId, Long userId) {
        try {
            PsychologistAppointment appointment = appointmentMapper.selectById(appointmentId);
            if (appointment == null) {
                return false;
            }
            // 用户是预约者
            boolean isUser = appointment.getUserId().equals(userId);
            // 用户是咨询师
            boolean isPsychologistUser = isPsychologistUserId(userId) && 
                    appointment.getPsychologistId().equals(getPsychologistIdByUserId(userId));
            return isUser || isPsychologistUser;
        } catch (Exception e) {
            log.error("权限验证失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 验证用户是否是心理咨询师（通过userId匹配）
     */
    private boolean isPsychologistUserId(Long userId) {
        try {
            LambdaQueryWrapper<Psychologist> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Psychologist::getUserId, userId);
            wrapper.eq(Psychologist::getStatus, Psychologist.STATUS_ENABLED);
            return psychologistMapper.selectCount(wrapper) > 0;
        } catch (Exception e) {
            log.error("咨询师身份验证失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 验证用户是否是指定咨询师
     */
    private boolean isPsychologist(Long userId, Long psychologistId) {
        try {
            LambdaQueryWrapper<Psychologist> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Psychologist::getUserId, userId);
            wrapper.eq(Psychologist::getId, psychologistId);
            wrapper.eq(Psychologist::getStatus, Psychologist.STATUS_ENABLED);
            return psychologistMapper.selectCount(wrapper) > 0;
        } catch (Exception e) {
            log.error("咨询师身份验证失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 获取用户ID对应的咨询师记录ID
     */
    private Long getPsychologistIdByUserId(Long userId) {
        try {
            LambdaQueryWrapper<Psychologist> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Psychologist::getUserId, userId);
            wrapper.eq(Psychologist::getStatus, Psychologist.STATUS_ENABLED);
            Psychologist psychologist = psychologistMapper.selectOne(wrapper);
            return psychologist != null ? psychologist.getId() : null;
        } catch (Exception e) {
            log.error("获取咨询师ID失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 从Token解析用户ID
     */
    private Long parseUserId(String token) {
        if (token == null || token.isEmpty()) {
            return null;
        }
        try {
            var claims = jwtUtil.parse(token);
            Object uid = claims.get("userId");
            if (uid != null) {
                return Long.valueOf(uid.toString());
            }
        } catch (Exception e) {
            log.debug("解析Token失败: {}", e.getMessage());
        }
        return null;
    }
}
