package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserPrivacyVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserStatsVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserPrivacySetting;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserPrivacyService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserStatsController {

    private final IUserStatsService userStatsService;
    private final IUserPrivacyService userPrivacyService;

    @GetMapping("/stats")
    public Result<UserStatsVO> getMyStats(@CurrentUserId Long userId) {
        return Result.success(userStatsService.getStatsVO(userId));
    }

    @GetMapping("/stats/{userId}")
    public Result<UserStatsVO> getUserStats(@PathVariable Long userId) {
        return Result.success(userStatsService.getStatsVO(userId));
    }

    @GetMapping("/privacy")
    public Result<UserPrivacyVO> getPrivacySetting(@CurrentUserId Long userId) {
        return Result.success(userPrivacyService.getPrivacyVO(userId));
    }

    @PutMapping("/privacy")
    public Result<String> updatePrivacySetting(@RequestBody UserPrivacySetting setting, @CurrentUserId Long userId) {
        setting.setUserId(userId);
        userPrivacyService.updatePrivacySetting(setting);
        return Result.success("隐私设置已保存");
    }
}
