package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserInfoVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserFollowService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserPrivacyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserFollowController {

    private final IUserFollowService userFollowService;
    private final IUserPrivacyService userPrivacyService;

    @PostMapping("/follow/{userId}")
    public Result<String> follow(@PathVariable Long userId, @CurrentUserId Long currentUserId) {
        userFollowService.follow(currentUserId, userId);
        return Result.success("关注成功");
    }

    @DeleteMapping("/follow/{userId}")
    public Result<String> unfollow(@PathVariable Long userId, @CurrentUserId Long currentUserId) {
        userFollowService.unfollow(currentUserId, userId);
        return Result.success("取消关注成功");
    }

    @GetMapping("/followings")
    public Result<PageResult<UserInfoVO>> getMyFollowings(
            @CurrentUserId Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return Result.success(userFollowService.getFollowings(userId, page, size));
    }

    @GetMapping("/followers")
    public Result<PageResult<UserInfoVO>> getMyFollowers(
            @CurrentUserId Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return Result.success(userFollowService.getFollowers(userId, page, size));
    }

    @GetMapping("/{userId}/followings")
    public Result<PageResult<UserInfoVO>> getUserFollowings(
            @PathVariable Long userId,
            @CurrentUserId Long currentUserId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        if (!userPrivacyService.canViewFollowings(userId, currentUserId)) {
            return Result.error(403, "该用户设置了隐私，不允许查看关注列表");
        }
        return Result.success(userFollowService.getFollowings(userId, page, size));
    }

    @GetMapping("/{userId}/followers")
    public Result<PageResult<UserInfoVO>> getUserFollowers(
            @PathVariable Long userId,
            @CurrentUserId Long currentUserId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        if (!userPrivacyService.canViewFans(userId, currentUserId)) {
            return Result.error(403, "该用户设置了隐私，不允许查看粉丝列表");
        }
        return Result.success(userFollowService.getFollowers(userId, page, size));
    }

    @GetMapping("/follow/{userId}/status")
    public Result<Boolean> getFollowStatus(@PathVariable Long userId, @CurrentUserId Long currentUserId) {
        boolean isFollowing = userFollowService.isFollowing(currentUserId, userId);
        return Result.success(isFollowing);
    }
}
