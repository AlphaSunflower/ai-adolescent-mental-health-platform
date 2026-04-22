package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistMessage;

import java.util.List;
import java.util.Map;

/**
 * 心理咨询聊天消息服务接口
 * 提供聊天消息的发送和查询功能
 *
 * @author AI Developer
 * @since 2026-04-14
 */
public interface IPsychologistMessageService extends IService<PsychologistMessage> {

    /**
     * 发送消息
     *
     * @param appointmentId 预约ID
     * @param senderId 发送者ID
     * @param receiverId 接收者ID
     * @param content 消息内容
     * @param contentType 消息类型（0-文本，1-图片，2-系统消息）
     * @return 发送的消息
     */
    PsychologistMessage sendMessage(Long appointmentId, Long senderId, Long receiverId, String content, Integer contentType);

    /**
     * 获取消息历史
     *
     * @param appointmentId 预约ID
     * @return 消息列表
     */
    List<PsychologistMessage> getMessageHistory(Long appointmentId);

    /**
     * 获取某时间之后的新消息
     *
     * @param appointmentId 预约ID
     * @param lastTime 上次获取消息的时间
     * @return 新消息列表
     */
    List<PsychologistMessage> getNewMessages(Long appointmentId, String lastTime);

    /**
     * 发送系统消息
     *
     * @param appointmentId 预约ID
     * @param content 消息内容
     * @return 系统消息
     */
    PsychologistMessage sendSystemMessage(Long appointmentId, String content);

    /**
     * 标记消息已读
     *
     * @param appointmentId 预约ID
     * @param userId 用户ID
     */
    void markAsRead(Long appointmentId, Long userId);

    /**
     * 获取未读消息数量
     *
     * @param appointmentId 预约ID
     * @param userId 用户ID
     * @return 未读消息数量
     */
    Long getUnreadCount(Long appointmentId, Long userId);

    /**
     * 发送图片消息
     *
     * @param appointmentId 预约ID
     * @param senderId 发送者ID
     * @param receiverId 接收者ID
     * @param imageUrl 图片URL
     * @return 发送的消息
     */
    PsychologistMessage sendImageMessage(Long appointmentId, Long senderId, Long receiverId, String imageUrl);
}
