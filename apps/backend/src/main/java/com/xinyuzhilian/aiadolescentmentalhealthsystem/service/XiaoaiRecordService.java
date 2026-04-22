package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

/**
 * 小爱倾听师会话记录服务接口
 * 用于记录和管理小爱倾听的会话数据
 */
public interface XiaoaiRecordService {

    /**
     * 创建新会话
     * @param userId 用户ID
     * @return 会话ID
     */
    Long createSession(Long userId);

    /**
     * 结束会话
     * @param sessionId 会话ID
     * @param endReason 结束原因
     */
    void endSession(Long sessionId, String endReason);

    /**
     * 记录消息
     * @param sessionId 会话ID
     * @param role 角色（user/assistant）
     * @param content 消息内容
     */
    void recordMessage(Long sessionId, String role, String content);

    /**
     * 更新会话时长
     * @param sessionId 会话ID
     * @param seconds 增加的秒数
     */
    void updateSessionDuration(Long sessionId, int seconds);

    /**
     * 获取用户今日已使用时长（秒）
     * @param userId 用户ID
     * @return 已使用秒数
     */
    int getTodayUsedSeconds(Long userId);

    /**
     * 扣除用户时长
     * @param userId 用户ID
     * @param seconds 秒数
     */
    void consumeTime(Long userId, int seconds);
}
