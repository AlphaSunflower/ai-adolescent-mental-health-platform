package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;

import java.util.HashMap;

public interface ILoginService {

    Result<HashMap<Object,Object>> login(User user);

    Result<HashMap<Object,Object>> login(User user, Boolean remember);

    Result<String> register(User user);

    Result<String> logout(Long userId, String token);

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
