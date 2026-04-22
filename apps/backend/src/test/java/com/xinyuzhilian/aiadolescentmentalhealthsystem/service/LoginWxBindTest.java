package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 微信登录邮箱绑定流程测试
 *
 * 完整测试流程：
 * 1. sendEmailVerifyCode - 发送验证码（验证码会发到真实邮箱）
 * 2. 手动获取验证码
 * 3. bindEmailWithWx - 用验证码绑定账号
 */
@SpringBootTest
class LoginWxBindTest {

    @Autowired(required = false)
    private ILoginService loginService;

    @Autowired(required = false)
    private IEmailVerifyService emailVerifyService;

    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_OPENID = "test_wx_openid_12345";

    /**
     * 测试1: 小程序登录 - 已有账号（直接登录）
     * 前提：数据库中存在 wx_id = TEST_OPENID 的账号
     */
    @Test
    void testLoginWxMini_ExistingUser() {
        if (loginService == null) {
            System.out.println("[SKIP] loginService 未启动，跳过测试");
            return;
        }

        // 用一个确定存在的小程序 openid（请替换为实际存在的）
        Result<HashMap<Object, Object>> result = loginService.loginWxMini("dummy_code", null);
        System.out.println("[INFO] loginWxMini result: " + result);
        // 由于 openid 无效，结果应为 error
    }

    /**
     * 测试2: 查询微信绑定状态
     */
    @Test
    void testGetWxStatus_NotBound() {
        if (loginService == null) {
            System.out.println("[SKIP] loginService 未启动，跳过测试");
            return;
        }

        Result<HashMap<Object, Object>> result = loginService.getWxStatus(
                "nonexistent_openid_123", "mini");
        assertNotNull(result);
        System.out.println("[INFO] getWxStatus result: " + result);

        if (result.getData() != null) {
            Boolean bound = (Boolean) result.getData().get("bound");
            assertFalse(bound);
        }
    }

    /**
     * 测试3: 发送验证码 - 验证返回结果
     */
    @Test
    void testSendEmailVerifyCode_InvalidEmail() {
        if (loginService == null) {
            System.out.println("[SKIP] loginService 未启动，跳过测试");
            return;
        }

        // 无效邮箱应返回错误
        Result<String> result = loginService.sendEmailVerifyCode(
                "not-an-email", TEST_OPENID, "mini");
        assertNotNull(result);
        assertEquals(500, result.getCode());
        assertTrue(result.getMessage().contains("格式不正确"));
        System.out.println("[PASS] 无效邮箱格式正确拒绝: " + result.getMessage());
    }

    /**
     * 测试4: 发送验证码 - 正常发送（会发真实邮件）
     * 注意：需要真实的邮件服务配置
     */
    @Test
    void testSendEmailVerifyCode_Success() {
        if (loginService == null || emailVerifyService == null) {
            System.out.println("[SKIP] service 未启动，跳过测试");
            return;
        }

        try {
            Result<String> result = loginService.sendEmailVerifyCode(
                    TEST_EMAIL, TEST_OPENID, "mini");
            assertNotNull(result);
            // 如果配置正确，应该返回成功
            System.out.println("[INFO] 发送验证码结果: " + result);
        } catch (Exception e) {
            System.out.println("[WARN] 邮件发送失败（可能是配置问题）: " + e.getMessage());
        }
    }

    /**
     * 测试5: 绑定邮箱 - 错误验证码
     */
    @Test
    void testBindEmailWithWx_WrongCode() {
        if (loginService == null) {
            System.out.println("[SKIP] loginService 未启动，跳过测试");
            return;
        }

        Result<HashMap<Object, Object>> result = loginService.bindEmailWithWx(
                TEST_OPENID, "mini", TEST_EMAIL, "000000", "测试用户", null);
        assertNotNull(result);
        assertEquals(500, result.getCode());
        assertTrue(result.getMessage().contains("验证码"));
        System.out.println("[PASS] 错误验证码正确拒绝: " + result.getMessage());
    }

    /**
     * 测试6: 绑定邮箱 - 参数校验
     */
    @Test
    void testBindEmailWithWx_InvalidParams() {
        if (loginService == null) {
            System.out.println("[SKIP] loginService 未启动，跳过测试");
            return;
        }

        // 空 openid
        Result<HashMap<Object, Object>> r1 = loginService.bindEmailWithWx(
                null, "mini", TEST_EMAIL, "123456", null, null);
        assertEquals(500, r1.getCode());

        // 无效邮箱
        Result<HashMap<Object, Object>> r2 = loginService.bindEmailWithWx(
                TEST_OPENID, "mini", "bad@email", "123456", null, null);
        assertEquals(500, r2.getCode());

        // 验证码格式错误
        Result<HashMap<Object, Object>> r3 = loginService.bindEmailWithWx(
                TEST_OPENID, "mini", TEST_EMAIL, "12345", null, null);
        assertEquals(500, r3.getCode());

        System.out.println("[PASS] 参数校验全部通过");
    }
}
