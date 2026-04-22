package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.XiaoaiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 小爱倾听师 API 控制器
 * 处理前端 XiaoaiListen.vue 调用的4个接口：
 * 1. /api/xiaoai/remaining - 获取剩余时长
 * 2. /api/xiaoai/member-type - 获取会员类型
 * 3. /api/xiaoai/daily-limit - 获取每日限制
 * 4. /api/xiaoai/today-messages - 获取今日消息记录
 */
@Slf4j
@RestController
@RequestMapping("/xiaoai")
@RequiredArgsConstructor
public class XiaoaiController {

    private final XiaoaiService xiaoaiService;

    /**
     * 获取用户剩余时长（秒）
     */
    @GetMapping("/remaining")
    public Result<Integer> getRemainingTime(@CurrentUserId Long userId) {
        log.info("[小爱倾听] 获取剩余时长, userId: {}", userId);
        int remaining = xiaoaiService.getRemainingSeconds(userId);
        return Result.success(remaining);
    }

    /**
     * 获取会员类型
     * @return 0-非会员, 1-VIP, 2-SVIP
     */
    @GetMapping("/member-type")
    public Result<Integer> getMemberType(@CurrentUserId Long userId) {
        log.info("[小爱倾听] 获取会员类型, userId: {}", userId);
        int memberType = xiaoaiService.getMemberType(userId);
        return Result.success(memberType);
    }

    /**
     * 获取每日时长限制
     */
    @GetMapping("/daily-limit")
    public Result<Integer> getDailyLimit(@CurrentUserId Long userId) {
        log.info("[小爱倾听] 获取每日限制, userId: {}", userId);
        int dailyLimit = xiaoaiService.getDailyLimit(userId);
        return Result.success(dailyLimit);
    }

    /**
     * 获取今日消息记录
     */
    @GetMapping("/today-messages")
    public Result<List> getTodayMessages(@CurrentUserId Long userId) {
        log.info("[小爱倾听] 获取今日消息, userId: {}", userId);
        return Result.success(xiaoaiService.getTodayMessages(userId));
    }

    /**
     * 上报使用时长（前端每5秒调用一次）
     * @param
     */
    @PostMapping("/report-usage")
    public Result<String> reportUsage(@CurrentUserId Long userId, @RequestBody Map<String, Integer> body) {
        Integer seconds = body.get("seconds");
        if (seconds == null || seconds <= 0) {
            return Result.error("无效的时长数据");
        }
        log.info("[小爱倾听] 上报使用时长, userId: {}, seconds: {}", userId, seconds);
        xiaoaiService.reportUsage(userId, seconds);
        return Result.success("时长已记录");
    }
}
