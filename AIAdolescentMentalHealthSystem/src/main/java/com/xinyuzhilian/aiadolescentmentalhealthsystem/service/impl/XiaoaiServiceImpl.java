package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.config.RedisCache;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.LoginUser;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.XiaoaiMessage;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.XiaoaiSession;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.XiaoaiUsageStat;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.xiaoai.dto.XiaoaiMessageDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.XiaoaiMessageMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.XiaoaiSessionMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.XiaoaiUsageStatMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.XiaoaiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 小爱倾听师服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class XiaoaiServiceImpl implements XiaoaiService {

    private final XiaoaiUsageStatMapper usageStatMapper;
    private final XiaoaiSessionMapper sessionMapper;
    private final XiaoaiMessageMapper messageMapper;
    private final RedisCache redisCache;

    // 默认每日免费时长（秒）
    private static final int DEFAULT_DAILY_LIMIT = 300; // 5分钟

    // VIP 每日时长限制
    private static final int VIP_DAILY_LIMIT = 1800; // 30分钟

    // SVIP 每日时长限制
    private static final int SVIP_DAILY_LIMIT = 3600; // 60分钟

    @Override
    public int getRemainingSeconds(Long userId) {
        if (userId == null) {
            return DEFAULT_DAILY_LIMIT;
        }

        // 获取每日限制
        int dailyLimit = getDailyLimit(userId);

        // 获取今日已使用时长
        int usedSeconds = getTodayUsedSeconds(userId);

        // 计算剩余时长
        int remaining = dailyLimit - usedSeconds;
        log.info("[小爱倾听] 剩余时长计算 - userId: {}, 每日限制: {}, 已使用: {}, 剩余: {}", 
                userId, dailyLimit, usedSeconds, Math.max(0, remaining));
        return Math.max(0, remaining);
    }

    @Override
    public int getMemberType(Long userId) {
        if (userId == null) {
            return 0;
        }

        // 从 Redis 获取 LoginUser
        String loginKey = "login:" + userId;
        LoginUser loginUser = redisCache.getCacheObject(loginKey);
        
        if (loginUser != null) {
            Integer memberType = loginUser.getMemberType();
            if (memberType != null) {
                // 检查会员是否过期
                LocalDateTime expireTime = loginUser.getMemberExpireTime();
                if (expireTime == null || expireTime.isAfter(LocalDateTime.now())) {
                    log.info("[小爱倾听] 获取会员类型 - userId: {}, memberType: {}", userId, memberType);
                    return memberType;
                }
            }
        }

        // 默认返回非会员
        log.info("[小爱倾听] 未找到有效会员信息，返回非会员 - userId: {}", userId);
        return 0;
    }

    @Override
    public int getDailyLimit(Long userId) {
        if (userId == null) {
            return DEFAULT_DAILY_LIMIT;
        }

        int memberType = getMemberType(userId);

        switch (memberType) {
            case 2: // SVIP
                return SVIP_DAILY_LIMIT;
            case 1: // VIP
                return VIP_DAILY_LIMIT;
            default: // 非会员
                return DEFAULT_DAILY_LIMIT;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<XiaoaiMessageDTO> getTodayMessages(Long userId) {
        if (userId == null) {
            return List.of();
        }

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();

        // 查询今日该用户的所有会话
        LambdaQueryWrapper<XiaoaiSession> sessionWrapper = new LambdaQueryWrapper<>();
        sessionWrapper.eq(XiaoaiSession::getUserId, userId)
                .ge(XiaoaiSession::getStartTime, startOfDay)
                .lt(XiaoaiSession::getStartTime, endOfDay)
                .orderByAsc(XiaoaiSession::getCreateTime);
        List<XiaoaiSession> sessions = sessionMapper.selectList(sessionWrapper);

        if (sessions.isEmpty()) {
            return List.of();
        }

        // 获取所有会话ID
        List<Long> sessionIds = sessions.stream()
                .map(XiaoaiSession::getId)
                .collect(Collectors.toList());

        // 查询所有会话的消息
        LambdaQueryWrapper<XiaoaiMessage> messageWrapper = new LambdaQueryWrapper<>();
        messageWrapper.in(XiaoaiMessage::getSessionId, sessionIds)
                .orderByAsc(XiaoaiMessage::getCreateTime);
        List<XiaoaiMessage> messages = messageMapper.selectList(messageWrapper);

        // 转换为DTO
        return messages.stream().map(msg -> {
            XiaoaiMessageDTO dto = new XiaoaiMessageDTO();
            dto.setId(msg.getId());
            dto.setSessionId(msg.getSessionId());
            dto.setRole(msg.getRole());
            dto.setContent(msg.getContent());
            dto.setCreateTime(msg.getCreateTime());
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * 获取今日已使用秒数
     */
    private int getTodayUsedSeconds(Long userId) {
        LocalDate today = LocalDate.now();

        LambdaQueryWrapper<XiaoaiUsageStat> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(XiaoaiUsageStat::getUserId, userId)
                .eq(XiaoaiUsageStat::getLastDate, today);
        XiaoaiUsageStat usageStat = usageStatMapper.selectOne(wrapper);

        if (usageStat == null) {
            return 0;
        }

        return usageStat.getTotalSeconds() != null ? usageStat.getTotalSeconds() : 0;
    }

    @Override
    @Transactional
    public void reportUsage(Long userId, int seconds) {
        if (userId == null || seconds <= 0) {
            log.warn("[小爱倾听] 无效的上报参数, userId: {}, seconds: {}", userId, seconds);
            return;
        }

        LocalDate today = LocalDate.now();

        // 查询或创建今日使用记录
        LambdaQueryWrapper<XiaoaiUsageStat> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(XiaoaiUsageStat::getUserId, userId)
                .eq(XiaoaiUsageStat::getLastDate, today);
        XiaoaiUsageStat usageStat = usageStatMapper.selectOne(wrapper);

        if (usageStat == null) {
            // 检查是否已存在该用户的任意记录（兼容只有user_id唯一索引的情况）
            LambdaQueryWrapper<XiaoaiUsageStat> existWrapper = new LambdaQueryWrapper<>();
            existWrapper.eq(XiaoaiUsageStat::getUserId, userId);
            XiaoaiUsageStat existing = usageStatMapper.selectOne(existWrapper);

            if (existing != null) {
                // 已有记录，更新时长和日期
                int current = existing.getTotalSeconds() != null ? existing.getTotalSeconds() : 0;
                existing.setTotalSeconds(current + seconds);
                existing.setLastDate(today);
                existing.setUpdateTime(LocalDateTime.now());
                usageStatMapper.updateById(existing);
                log.info("[小爱倾听] 更新时长记录(已有记录), userId: {}, seconds: {}, 累计: {}", userId, seconds, existing.getTotalSeconds());
            } else {
                // 创建新记录
                usageStat = new XiaoaiUsageStat();
                usageStat.setUserId(userId);
                usageStat.setTotalSeconds(seconds);
                usageStat.setLastDate(today);
                usageStat.setCreateTime(LocalDateTime.now());
                usageStat.setUpdateTime(LocalDateTime.now());
                usageStatMapper.insert(usageStat);
                log.info("[小爱倾听] 创建时长记录, userId: {}, seconds: {}", userId, seconds);
            }
        } else {
            // 更新已使用时长
            int current = usageStat.getTotalSeconds() != null ? usageStat.getTotalSeconds() : 0;
            usageStat.setTotalSeconds(current + seconds);
            usageStat.setUpdateTime(LocalDateTime.now());
            usageStatMapper.updateById(usageStat);
            log.info("[小爱倾听] 更新时长记录, userId: {}, seconds: {}, 累计: {}", userId, seconds, usageStat.getTotalSeconds());
        }
    }
}
