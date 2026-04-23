package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistMessage;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.PsychologistMessageMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPsychologistMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 心理咨询聊天消息服务实现类
 *
 * @author AI Developer
 * @since 2026-04-14
 */
@Service
@RequiredArgsConstructor
public class PsychologistMessageServiceImpl extends ServiceImpl<PsychologistMessageMapper, PsychologistMessage>
        implements IPsychologistMessageService {

    private final PsychologistMessageMapper messageMapper;

    @Override
    @Transactional
    public PsychologistMessage sendMessage(Long appointmentId, Long senderId, Long receiverId, String content, Integer contentType) {
        PsychologistMessage message = new PsychologistMessage();
        message.setAppointmentId(appointmentId);
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setContent(content);
        message.setContentType(contentType != null ? contentType : PsychologistMessage.TYPE_TEXT);
        message.setCreateTime(LocalDateTime.now());
        messageMapper.insert(message);
        return message;
    }

    @Override
    public List<PsychologistMessage> getMessageHistory(Long appointmentId) {
        return messageMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PsychologistMessage>()
                        .eq(PsychologistMessage::getAppointmentId, appointmentId)
                        .orderByAsc(PsychologistMessage::getCreateTime)
        );
    }

    @Override
    public List<PsychologistMessage> getNewMessages(Long appointmentId, String lastTime) {
        LocalDateTime lastDateTime = LocalDateTime.parse(lastTime);
        return messageMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PsychologistMessage>()
                        .eq(PsychologistMessage::getAppointmentId, appointmentId)
                        .gt(PsychologistMessage::getCreateTime, lastDateTime)
                        .orderByAsc(PsychologistMessage::getCreateTime)
        );
    }

    @Override
    @Transactional
    public PsychologistMessage sendSystemMessage(Long appointmentId, String content) {
        return sendMessage(appointmentId, 0L, 0L, content, PsychologistMessage.TYPE_SYSTEM);
    }

    @Override
    public void markAsRead(Long appointmentId, Long userId) {
        // 消息已读标记（实际应用中可能需要额外的已读状态表）
        // 这里简单处理，不做实际更新
    }

    @Override
    public Long getUnreadCount(Long appointmentId, Long userId) {
        return messageMapper.selectCount(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PsychologistMessage>()
                        .eq(PsychologistMessage::getAppointmentId, appointmentId)
                        .eq(PsychologistMessage::getReceiverId, userId)
                        .eq(PsychologistMessage::getContentType, PsychologistMessage.TYPE_TEXT)
        );
    }

    @Override
    @Transactional
    public PsychologistMessage sendImageMessage(Long appointmentId, Long senderId, Long receiverId, String imageUrl) {
        return sendMessage(appointmentId, senderId, receiverId, imageUrl, PsychologistMessage.TYPE_IMAGE);
    }
}
