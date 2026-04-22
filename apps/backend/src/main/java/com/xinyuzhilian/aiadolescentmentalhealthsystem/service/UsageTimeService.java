package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserMembership;

/**
 * 用户时长和会员服务接口
 */
public interface UsageTimeService {

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
     * 扣除使用时长
     * @param userId 用户ID
     * @param seconds 秒数
     */
    void consumeTime(Long userId, int seconds);

    /**
     * 获取或创建用户会员信息
     * @param userId 用户ID
     * @return 用户会员信息
     */
    UserMembership getOrCreateMembership(Long userId);

    /**
     * 获取或创建用户使用时长记录
     * @param userId 用户ID
     * @return 用户使用时长记录
     */
    com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserUsageTime getOrCreateUsageTime(Long userId);
}
