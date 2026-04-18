package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.ConsultationMessage;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Set;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * SSE实时消息服务
 * 用于医患咨询消息的实时推送
 */
@Service
public class ConsultationMessageSseServiceImpl {

    // 保存每个会话ID对应的所有SSE连接
    private final Map<Long, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();

    /**
     * 添加新的SSE连接
     */
    public SseEmitter addEmitter(Long appointmentId) {
        // 设置超时时间，这里设为30分钟(1800000毫秒)
        SseEmitter emitter = new SseEmitter(1800000L);

        emitters.computeIfAbsent(appointmentId, k -> new CopyOnWriteArraySet<>()).add(emitter);

        // 当连接完成或超时时，将其从集合中移除
        emitter.onCompletion(() -> removeEmitter(appointmentId, emitter));
        emitter.onTimeout(() -> removeEmitter(appointmentId, emitter));
        emitter.onError((e) -> removeEmitter(appointmentId, emitter));

        return emitter;
    }

    /**
     * 广播消息给该会话的所有订阅者
     */
    public void broadcast(Long appointmentId, ConsultationMessage message) {
        Set<SseEmitter> set = emitters.get(appointmentId);
        if (set == null || set.isEmpty()) return;

        for (SseEmitter emitter : set) {
            try {
                // 发送JSON格式的消息
                emitter.send(message);
            } catch (Exception e) {
                // 发送异常说明连接已断开，移除该emitter
                removeEmitter(appointmentId, emitter);
            }
        }
    }

    /**
     * 移除失效的SSE连接
     */
    private void removeEmitter(Long appointmentId, SseEmitter emitter) {
        Set<SseEmitter> set = emitters.get(appointmentId);
        if (set != null) {
            set.remove(emitter);
            if (set.isEmpty()) {
                emitters.remove(appointmentId);
            }
        }
    }
}
