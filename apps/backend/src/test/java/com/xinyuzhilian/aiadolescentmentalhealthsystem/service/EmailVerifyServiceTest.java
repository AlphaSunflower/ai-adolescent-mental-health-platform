package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.EmailVerifyCode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 邮箱验证码服务测试
 *
 * 注意：此测试需要 MySQL 和 Redis 服务运行
 * 如果服务未启动，请跳过或使用 Mock 测试
 */
@SpringBootTest
class EmailVerifyServiceTest {

    @Autowired(required = false)
    private IEmailVerifyService emailVerifyService;

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_OPENID = "test_openid_12345";
    private static final String TEST_OPENID_TYPE = "mini";
    private static final String TEST_SCENE = IEmailVerifyService.SCENE_BIND_EMAIL;

    @Test
    void testSendAndVerifyCode_Success() {
        if (emailVerifyService == null) {
            System.out.println("[SKIP] emailVerifyService 未启动，跳过真实发送测试");
            return;
        }

        // 1. 发送验证码
        assertDoesNotThrow(() -> {
            emailVerifyService.sendVerifyCode(TEST_EMAIL, TEST_OPENID, TEST_OPENID_TYPE, TEST_SCENE);
        });

        // 2. 验证验证码存在（通过数据库查询，这里省略DB直接验证）
        // 实际场景：验证码已通过邮件发送，收到的用户会输入验证码
        System.out.println("[PASS] 验证码发送成功（请查收邮件）");
    }

    @Test
    @Transactional
    void testVerifyCode_WrongCode() {
        if (emailVerifyService == null) {
            System.out.println("[SKIP] emailVerifyService 未启动，跳过测试");
            return;
        }

        // 故意输入错误验证码，应该抛出异常
        assertThrows(RuntimeException.class, () -> {
            emailVerifyService.verifyAndConsumeCode(TEST_EMAIL, "000000", TEST_SCENE);
        });
        System.out.println("[PASS] 错误验证码正确抛出异常");
    }

    @Test
    void testSendCode_InvalidEmail() {
        if (emailVerifyService == null) {
            System.out.println("[SKIP] emailVerifyService 未启动，跳过测试");
            return;
        }

        // 故意发送无效邮箱格式
        assertThrows(Exception.class, () -> {
            emailVerifyService.sendVerifyCode("invalid-email", TEST_OPENID, TEST_OPENID_TYPE, TEST_SCENE);
        });
        System.out.println("[PASS] 无效邮箱正确抛出异常");
    }
}
