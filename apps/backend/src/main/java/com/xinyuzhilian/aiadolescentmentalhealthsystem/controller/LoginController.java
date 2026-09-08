package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ILoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class LoginController {

    private final ILoginService loginService;

    /* ==================== 邮箱登录/注册 ==================== */

    /**
     * 发送邮箱验证码（注册/登录共用）
     * 接口：POST /user/email/send
     */
    @PostMapping("/user/email/send")
    public Result<String> sendEmailCode(@RequestBody HashMap<String, String> map) {
        return loginService.sendEmailCode(map.get("email"), map.get("scene"));
    }

    /**
     * 邮箱 + 验证码登录
     * 接口：POST /user/login/email
     */
    @PostMapping("/user/login/email")
    public Result<HashMap<Object,Object>> loginByEmailCode(@RequestBody HashMap<String, String> map) {
        return loginService.loginByEmailCode(map.get("email"), map.get("code"));
    }

    /**
     * 邮箱 + 密码登录
     * 接口：POST /user/login/email/password
     */
    @PostMapping("/user/login/email/password")
    public Result<HashMap<Object,Object>> loginByEmailPassword(@RequestBody HashMap<String, String> map) {
        String rememberStr = map.get("remember");
        Boolean remember = "true".equalsIgnoreCase(rememberStr) || "1".equals(rememberStr);
        return loginService.loginByEmailPassword(map.get("email"), map.get("password"), remember);
    }

    /**
     * 邮箱 + 验证码注册
     * 接口：POST /user/register/email
     */
    @PostMapping("/user/register/email")
    public Result<String> registerWithEmail(@RequestBody HashMap<String, String> map) {
        return loginService.registerWithEmail(
                map.get("email"),
                map.get("code"),
                map.get("username"),
                map.get("password"),
                map.get("phone"),
                map.get("nickname")
        );
    }

    /* ==================== 忘记密码 ==================== */

    /**
     * 发送忘记密码验证码
     * 接口：POST /user/forgot/send
     * 条件：用户名+邮箱必须匹配同一账号
     */
    @PostMapping("/user/forgot/send")
    public Result<String> sendForgotPasswordCode(@RequestBody HashMap<String, String> map) {
        return loginService.sendForgotPasswordCode(map.get("username"), map.get("email"));
    }

    /**
     * 重置密码
     * 接口：POST /user/forgot/reset
     */
    @PostMapping("/user/forgot/reset")
    public Result<String> resetPassword(@RequestBody HashMap<String, String> map) {
        return loginService.resetPassword(
                map.get("username"),
                map.get("email"),
                map.get("code"),
                map.get("newPassword"),
                map.get("confirmPassword")
        );
    }

    /**
     * 验证忘记密码验证码（仅验证，不重置）
     * 接口：POST /user/forgot/verify
     * Step1 点击"下一步"时调用此接口验证
     */
    @PostMapping("/user/forgot/verify")
    public Result<String> verifyForgotCode(@RequestBody HashMap<String, String> map) {
        return loginService.verifyForgotCode(
                map.get("username"),
                map.get("email"),
                map.get("code")
        );
    }

    /* ==================== 原有接口 ==================== */

    @PostMapping("/user/login")
    public Result<HashMap<Object,Object>> login(@RequestBody User user,
                                                @RequestParam(required = false, defaultValue = "false") Boolean remember) {
        return loginService.login(user, remember);
    }

    @PostMapping("/user/register")
    public Result<String> register(@RequestBody User user) {
        return loginService.register(user);
    }

    @PostMapping("/user/logout")
    public Result<String> logout(@CurrentUserId Long userId, @RequestHeader(value = "token", required = false) String token) {
        return loginService.logout(userId, token);
    }
}
