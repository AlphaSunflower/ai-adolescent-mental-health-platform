package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.EmailVerifyCode;

/**
 * 邮箱验证码服务接口
 */
public interface IEmailVerifyService {

    /**
     * 场景常量
     */
    String SCENE_REGISTER = "register";
    String SCENE_LOGIN = "login";
    String SCENE_FORGOT_PASSWORD = "forgot_password";
    String SCENE_CHANGE_EMAIL = "change_email";

    /**
     * 发送邮箱验证码
     *
     * @param email      目标邮箱
     * @param scene      场景，如 register、login
     */
    void sendVerifyCode(String email, String scene);

    /**
     * 验证邮箱验证码是否正确（不消耗验证码）
     * 用于注册时实时校验
     *
     * @param email 邮箱
     * @param code  验证码
     * @param scene 场景
     * @return 验证记录，为null表示验证码无效
     */
    EmailVerifyCode verifyCodeOnly(String email, String code, String scene);

    /**
     * 验证并消耗验证码（一次性）
     * 验证成功后自动标记为已使用
     *
     * @param email 邮箱
     * @param code  验证码
     * @param scene 场景
     * @return 验证通过的记录，null表示验证失败
     */
    EmailVerifyCode verifyAndConsumeCode(String email, String code, String scene);
}
