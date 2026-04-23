package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * 心理咨询消息SSE实时推送服务
 * 用于用户与心理咨询师之间的实时消息推送
 *
 * @author AI Developer
 * @since 2026-04-16
 */
@Service
@Slf4j
public class PsychologistMessageSseServiceImpl {

    // 保存每个预约ID对应的所有SSE连接（用户端）
    private final Map<Long, Set<SseEmitter>> appointmentEmitters = new ConcurrentHashMap<>();

    // 保存每个咨询师ID对应的所有SSE连接（咨询师端）
    private final Map<Long, Set<SseEmitter>> psychologistEmitters = new ConcurrentHashMap<>();

    // SSE超时时间：30分钟
    private static final long SSE_TIMEOUT = 1800000L;

    /**
     * 添加用户端的SSE连接
     *
     * @param appointmentId 预约ID
     * @return SseEmitter
     */
    public SseEmitter addUserEmitter(Long appointmentId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        appointmentEmitters.computeIfAbsent(appointmentId, k -> new CopyOnWriteArraySet<>()).add(emitter);

        emitter.onCompletion(() -> removeUserEmitter(appointmentId, emitter));
        emitter.onTimeout(() -> removeUserEmitter(appointmentId, emitter));
        emitter.onError((e) -> {
            log.debug("用户SSE连接错误: appointmentId={}, error={}", appointmentId, e.getMessage());
            removeUserEmitter(appointmentId, emitter);
        });

        // 发送初始连接确认消息
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("{\"type\":\"connected\",\"message\":\"SSE连接已建立\"}"));
            log.info("用户SSE初始消息已发送: appointmentId={}", appointmentId);
        } catch (Exception e) {
            log.warn("发送SSE初始消息失败: appointmentId={}", appointmentId, e);
        }

        log.info("用户SSE连接已建立: appointmentId={}, 当前连接数={}", appointmentId, appointmentEmitters.get(appointmentId).size());
        return emitter;
    }

    /**
     * 添加咨询师端的SSE连接
     *
     * @param psychologistId 咨询师ID
     * @return SseEmitter
     */
    public SseEmitter addPsychologistEmitter(Long psychologistId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        psychologistEmitters.computeIfAbsent(psychologistId, k -> new CopyOnWriteArraySet<>()).add(emitter);

        emitter.onCompletion(() -> removePsychologistEmitter(psychologistId, emitter));
        emitter.onTimeout(() -> removePsychologistEmitter(psychologistId, emitter));
        emitter.onError((e) -> {
            log.debug("咨询师SSE连接错误: psychologistId={}, error={}", psychologistId, e.getMessage());
            removePsychologistEmitter(psychologistId, emitter);
        });

        // 发送初始连接确认消息
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("{\"type\":\"connected\",\"message\":\"SSE连接已建立\"}"));
            log.info("咨询师SSE初始消息已发送: psychologistId={}", psychologistId);
        } catch (Exception e) {
            log.warn("发送咨询师SSE初始消息失败: psychologistId={}", psychologistId, e);
        }

        log.info("咨询师SSE连接已建立: psychologistId={}, 当前连接数={}", psychologistId, psychologistEmitters.get(psychologistId).size());
        return emitter;
    }

    /**
     * 广播消息给指定预约的所有订阅者（用户端）
     *
     * @param appointmentId 预约ID
     * @param message      消息
     */
    public void broadcastToAppointment(Long appointmentId, PsychologistMessage message) {
        Set<SseEmitter> emitters = appointmentEmitters.get(appointmentId);
        if (emitters == null || emitters.isEmpty()) {
            log.debug("预约暂无用户订阅: appointmentId={}", appointmentId);
            return;
        }

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("message")
                        .data(message));
                log.debug("消息已推送到用户: appointmentId={}", appointmentId);
            } catch (Exception e) {
                log.debug("推送消息到用户失败，移除连接: appointmentId={}", appointmentId);
                removeUserEmitter(appointmentId, emitter);
            }
        }
    }

    /**
     * 广播消息给指定咨询师的所有订阅者（咨询师端）
     *
     * @param psychologistId 咨询师ID
     * @param message        消息
     */
    public void broadcastToPsychologist(Long psychologistId, PsychologistMessage message) {
        Set<SseEmitter> emitters = psychologistEmitters.get(psychologistId);
        if (emitters == null || emitters.isEmpty()) {
            log.debug("咨询师暂无连接: psychologistId={}", psychologistId);
            return;
        }

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("message")
                        .data(message));
                log.debug("消息已推送到咨询师: psychologistId={}", psychologistId);
            } catch (Exception e) {
                log.debug("推送消息到咨询师失败，移除连接: psychologistId={}", psychologistId);
                removePsychologistEmitter(psychologistId, emitter);
            }
        }
    }

    /**
     * 移除失效的用户端SSE连接
     *
     * @param appointmentId 预约ID
     * @param emitter      SseEmitter
     */
    private void removeUserEmitter(Long appointmentId, SseEmitter emitter) {
        Set<SseEmitter> set = appointmentEmitters.get(appointmentId);
        if (set != null) {
            set.remove(emitter);
            if (set.isEmpty()) {
                appointmentEmitters.remove(appointmentId);
            }
        }
        log.info("用户SSE连接已移除: appointmentId={}", appointmentId);
    }

    /**
     * 移除失效的咨询师端SSE连接
     *
     * @param psychologistId 咨询师ID
     * @param emitter        SseEmitter
     */
    private void removePsychologistEmitter(Long psychologistId, SseEmitter emitter) {
        Set<SseEmitter> set = psychologistEmitters.get(psychologistId);
        if (set != null) {
            set.remove(emitter);
            if (set.isEmpty()) {
                psychologistEmitters.remove(psychologistId);
            }
        }
        log.info("咨询师SSE连接已移除: psychologistId={}", psychologistId);
    }

    /**
     * 获取当前连接统计信息
     *
     * @return 统计信息
     */
    public Map<String, Object> getConnectionStats() {
        int userConnections = appointmentEmitters.values().stream().mapToInt(Set::size).sum();
        int psychologistConnections = psychologistEmitters.values().stream().mapToInt(Set::size).sum();

        return Map.of(
                "userConnections", userConnections,
                "psychologistConnections", psychologistConnections,
                "totalConnections", userConnections + psychologistConnections
        );
    }
}
