package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 管理员控制器
 * 处理超级管理员的业务请求
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('4')")
public class AdminController {

    private final IUserService userService;

    // --- 超级管理员接口 (Role 4) ---

    /**
     * 分页查询用户列表
     */
    @GetMapping("/users")
    public Result<PageResult<User>> getUsers(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) Integer status) {

        return Result.success(userService.getUsers(page, size, username, status));
    }

    /**
     * 保存或更新用户
     */
    @PostMapping("/user")
    public Result<String> saveUser(@RequestBody User user) {
        userService.saveUser(user);
        return Result.success("保存成功", null);
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/user/{id}")
    public Result<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success("删除成功", null);
    }

    /**
     * 根据ID获取用户详情
     */
    @GetMapping("/user/{id}")
    public Result<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserInfo(id);
        if (user != null) {
            return Result.success(user);
        }
        return Result.error("用户不存在");
    }
}
