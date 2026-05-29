package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;

import java.util.HashMap;

public interface ILoginService {

    /* ========== 微信登录类型常量 ========== */
    String OPENID_TYPE_MINI = "mini";
    String OPENID_TYPE_GZH = "gzh";

    Result<HashMap<Object,Object>> login(User user);

    Result<HashMap<Object,Object>> login(User user, Boolean remember);

    Result<String> register(User user);

    /**
     * 微信登录（小程序入口，保持原有签名兼容前端）
     * 找到账号 → 返回正常登录
     * 未找到账号 → 返回 needEmailVerify: true
     */
    Result<HashMap<Object,Object>> loginWx(String code, String userInfo);

    Result<String> logout(Long userId, String token);

    /* ========== 新增接口 ========== */

    /**
     * 小程序微信登录（内部方法）
     */
    Result<HashMap<Object, Object>> loginWxMini(String code, String userInfo);

    /**
     * 微信公众号扫码登录
     * 找到账号 → 返回正常登录
     * 未找到账号 → 返回 needEmailVerify: true
     */
    Result<HashMap<Object, Object>> loginWxGzh(String code);

    /**
     * 查询 OpenID 绑定状态
     * 返回 { bound: true/false, userId, emailVerified }
     */
    Result<HashMap<Object, Object>> getWxStatus(String openid, String openidType);

    /**
     * 发送邮箱验证码
     */
    Result<String> sendEmailVerifyCode(String email, String openid, String openidType);

    /**
     * 邮箱验证并绑定微信账号
     * 1. 验证验证码
     * 2. 有账号 → 绑定 openid
     * 3. 无账号 → 创建账号
     * 4. 返回 JWT Token
     */
    Result<HashMap<Object, Object>> bindEmailWithWx(String openid, String openidType,
                                                     String email, String code,
                                                     String nickname, String headPath);

    /* ========== 邮箱登录/注册（新增） ========== */

    /**
     * 发送邮箱验证码（注册/登录共用）
     */
    Result<String> sendEmailCode(String email, String scene);

    /**
     * 邮箱 + 验证码登录
     */
    Result<HashMap<Object, Object>> loginByEmailCode(String email, String code);

    /**
     * 邮箱 + 密码登录
     */
    Result<HashMap<Object, Object>> loginByEmailPassword(String email, String password, Boolean remember);

    /**
     * 邮箱 + 验证码注册
     */
    Result<String> registerWithEmail(String email, String code, String username,
                                     String password, String phone, String nickname);

    /* ========== 忘记密码（新增） ========== */

    /**
     * 发送忘记密码验证码
     */
    Result<String> sendForgotPasswordCode(String username, String email);

    /**
     * 重置密码
     */
    Result<String> resetPassword(String username, String email, String code,
                                String newPassword, String confirmPassword);

    /**
     * 验证忘记密码验证码（仅验证，不重置）
     */
    Result<String> verifyForgotCode(String username, String email, String code);

    Result<HashMap<Object, Object>> adminLogin(User user, Boolean remember);
}
