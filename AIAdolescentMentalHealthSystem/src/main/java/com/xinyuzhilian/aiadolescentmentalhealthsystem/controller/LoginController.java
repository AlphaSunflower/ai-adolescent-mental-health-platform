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

    /* ==================== 邮箱登录/注册（新增） ==================== */

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

    /* ==================== 忘记密码（新增） ==================== */

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

    /* ==================== 原有接口（保持兼容，但微信登录已禁用） ==================== */

    @PostMapping("/user/login")
    public Result<HashMap<Object,Object>> login(@RequestBody User user,
                                                @RequestParam(required = false, defaultValue = "false") Boolean remember) {
        return loginService.login(user, remember);
    }

    @PostMapping("/user/register")
    public Result<String> register(@RequestBody User user) {
        return loginService.register(user);
    }

    /**
     * 小程序微信登录
     * 返回：
     *   - 已有账号: { code: 200, data: { token, userInfo } }
     *   - 新用户: { code: 200, data: { needEmailVerify: true, openid, openidType: "mini", tempUserInfo } }
     */
    @PostMapping("/user/login/wx")
    public Result<HashMap<Object,Object>> loginWx(@RequestBody HashMap<String, String> map) {
        return loginService.loginWx(map.get("code"), map.get("userInfo"));
    }

    @PostMapping("/user/logout")
    public Result<String> logout(@CurrentUserId Long userId, @RequestHeader(value = "token", required = false) String token) {
        return loginService.logout(userId, token);
    }

    /* ==================== 新增接口 ==================== */

    /**
     * 微信公众号扫码授权回调
     * 前端：用户扫码后，微信会回调你的 redirect_uri，带上 code 参数
     * 前端用这个 code 调用此接口
     * 返回：
     *   - 已有账号: { code: 200, data: { token, userInfo } }
     *   - 新用户: { code: 200, data: { needEmailVerify: true, openid, openidType: "gzh" } }
     */
    @PostMapping("/user/login/wx/gzh/callback")
    public Result<HashMap<Object,Object>> loginWxGzhCallback(@RequestBody HashMap<String, String> map) {
        return loginService.loginWxGzh(map.get("code"));
    }

    /**
     * 查询 OpenID 绑定状态
     * 前端用于检查 openid 是否已绑定账号
     */
    @PostMapping("/user/wx/status")
    public Result<HashMap<Object,Object>> getWxStatus(@RequestBody HashMap<String, String> map) {
        return loginService.getWxStatus(map.get("openid"), map.get("openidType"));
    }

    /**
     * 发送邮箱验证码
     * 用于微信登录后的邮箱绑定流程
     */
    @PostMapping("/user/wx/email/send")
    public Result<String> sendEmailVerifyCode(@RequestBody HashMap<String, String> map) {
        return loginService.sendEmailVerifyCode(
                map.get("email"),
                map.get("openid"),
                map.get("openidType")
        );
    }

    /**
     * 验证邮箱验证码并绑定账号
     * 核心接口：完成邮箱验证 + 账号创建/绑定 + 返回 JWT Token
     */
    @PostMapping("/user/wx/email/bind")
    public Result<HashMap<Object,Object>> bindEmailWithWx(@RequestBody HashMap<String, String> map) {
        return loginService.bindEmailWithWx(
                map.get("openid"),
                map.get("openidType"),
                map.get("email"),
                map.get("code"),
                map.get("nickname"),
                map.get("headPath")
        );
    }
}
