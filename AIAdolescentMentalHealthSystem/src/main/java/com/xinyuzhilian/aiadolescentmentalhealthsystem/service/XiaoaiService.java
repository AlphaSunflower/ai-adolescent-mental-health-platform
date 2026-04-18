package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.xiaoai.dto.XiaoaiMessageDTO;

import java.util.List;

/**
 * 小爱倾听师服务接口
 */
public interface XiaoaiService {

    /**
     * 获取用户剩余时长（秒）
     * @param userId 用户ID
     * @return 剩余秒数
     */
    int getRemainingSeconds(Long userId);

    /**
     * 获取会员类型
     * @param userId 用户ID
     * @return 0-非会员, 1-VIP, 2-SVIP
     */
    int getMemberType(Long userId);

    /**
     * 获取每日时长限制
     * @param userId 用户ID
     * @return 时长限制（秒）
     */
    int getDailyLimit(Long userId);

    /**
     * 获取今日消息记录
     * @param userId 用户ID
     * @return 消息列表
     */
    List<XiaoaiMessageDTO> getTodayMessages(Long userId);

    /**
     * 上报使用时长
     * @param userId 用户ID
     * @param seconds 本次使用的秒数
     */
    void reportUsage(Long userId, int seconds);
}
