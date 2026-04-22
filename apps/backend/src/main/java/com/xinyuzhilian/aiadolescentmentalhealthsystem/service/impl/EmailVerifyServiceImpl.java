package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.config.RedisCache;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.EmailVerifyCode;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.EmailVerifyCodeMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IEmailVerifyService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.utils.MailUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;
import java.util.concurrent.TimeUnit;

/**
 * 邮箱验证码服务实现
 * 包含完整的防刷逻辑和邮件发送
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerifyServiceImpl implements IEmailVerifyService {

    private final EmailVerifyCodeMapper emailVerifyCodeMapper;
    private final MailUtils mailUtils;
    private final RedisCache redisCache;

    /** Redis key 前缀 */
    private static final String SEND_FREQ_KEY = "email:verify:send:freq:";       // 60秒发送频率限制
    private static final String SEND_DAILY_KEY = "email:verify:send:daily:";      // 每日发送次数
    private static final String ERROR_COUNT_KEY = "email:verify:error:count:";   // 错误次数（锁定用）
    private static final String VERIFY_CODE_KEY = "email:verify:code:";           // 缓存中的验证码

    /** 发送频率限制：60秒 */
    private static final long SEND_FREQ_SECONDS = 60;
    /** 每日发送上限 */
    private static final int DAILY_SEND_LIMIT = 10;
    /** 验证码有效期：15分钟 */
    private static final long CODE_EXPIRE_MINUTES = 15;
    /** 连续错误锁定时间：15分钟 */
    private static final long ERROR_LOCK_MINUTES = 15;
    /** 最大错误次数 */
    private static final int MAX_ERROR_COUNT = 5;

    @Override
    @Async
    public void sendVerifyCode(String email, String openid, String openidType, String scene) {
        String safeEmail = maskEmail(email);
        String dailyKey = SEND_DAILY_KEY + email;
        String freqKey = SEND_FREQ_KEY + email;
        String errorKey = ERROR_COUNT_KEY + email;

        // 1. 检查是否被锁定
        Boolean locked = redisCache.hasKey(errorKey);
        if (Boolean.TRUE.equals(locked)) {
            Long ttl = getTtl(errorKey);
            throw new RuntimeException("验证失败次数过多，请 " + (ttl > 0 ? ttl / 60 + 1 : 30) + " 分钟后再试");
        }

        // 2. 检查发送频率（60秒限制）
        Boolean freqBlocked = redisCache.hasKey(freqKey);
        if (Boolean.TRUE.equals(freqBlocked)) {
            Long remain = getTtl(freqKey);
            throw new RuntimeException("发送太频繁，请在 " + (remain > 0 ? remain : 60) + " 秒后重试");
        }

        // 3. 检查每日发送次数
        String dailyCountStr = redisCache.getCacheObject(dailyKey);
        int dailyCount = dailyCountStr == null ? 0 : Integer.parseInt(dailyCountStr);
        if (dailyCount >= DAILY_SEND_LIMIT) {
            throw new RuntimeException("今日发送次数已达上限（" + DAILY_SEND_LIMIT + "次），请明天再试");
        }

        // 4. 生成6位验证码
        String code = generateCode();

        // 5. 删除旧的相同场景验证码（避免数据库积累）
        LambdaQueryWrapper<EmailVerifyCode> oldWrapper = new LambdaQueryWrapper<>();
        oldWrapper.eq(EmailVerifyCode::getEmail, email)
                  .eq(EmailVerifyCode::getScene, scene)
                  .eq(EmailVerifyCode::getUsed, 0);
        emailVerifyCodeMapper.delete(oldWrapper);

        // 6. 存入数据库
        EmailVerifyCode verifyRecord = new EmailVerifyCode();
        verifyRecord.setEmail(email);
        verifyRecord.setCode(code);
        verifyRecord.setScene(scene);
        verifyRecord.setOpenid(openid);
        verifyRecord.setOpenidType(openidType);
        verifyRecord.setExpireTime(LocalDateTime.now().plusMinutes(CODE_EXPIRE_MINUTES));
        verifyRecord.setUsed(0);
        emailVerifyCodeMapper.insert(verifyRecord);

        // 7. 设置发送频率限制
        redisCache.setCacheObject(freqKey, "1", (int) SEND_FREQ_SECONDS, TimeUnit.SECONDS);

        // 8. 增加每日发送计数（当天有效）
        redisCache.setCacheObject(dailyKey, String.valueOf(dailyCount + 1),
                getSecondsUntilMidnight(), TimeUnit.SECONDS);

        // 9. 发送邮件（异步，不阻塞主流程）
        try {
            String htmlContent = buildEmailHtml(code);
            mailUtils.sendHtmlEmail(email, "【青少年心理健康平台】您的邮箱验证码", htmlContent);
            log.info("[EmailVerifyService] 验证码发送成功 -> {}, code: {}", safeEmail, code);
        } catch (Exception e) {
            log.error("[EmailVerifyService] 邮件发送失败 -> {}, error: {}", safeEmail, e.getMessage());
            // 邮件发送失败不影响业务流程，验证码已入库
        }
    }

    @Override
    public EmailVerifyCode verifyCodeOnly(String email, String code, String scene) {
        return verifyAndConsumeInternal(email, code, scene, false);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public EmailVerifyCode verifyAndConsumeCode(String email, String code, String scene) {
        return verifyAndConsumeInternal(email, code, scene, true);
    }

    /**
     * 内部验证逻辑
     *
     * @param consume  是否消耗验证码（true=标记已使用，false=仅查询）
     */
    private EmailVerifyCode verifyAndConsumeInternal(String email, String code, String scene, boolean consume) {
        String safeEmail = maskEmail(email);
        String errorKey = ERROR_COUNT_KEY + email;

        // 检查是否被锁定
        Boolean locked = redisCache.hasKey(errorKey);
        if (Boolean.TRUE.equals(locked)) {
            throw new RuntimeException("验证失败次数过多，请15分钟后再试");
        }

        // 查询未使用的验证码
        LambdaQueryWrapper<EmailVerifyCode> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EmailVerifyCode::getEmail, email)
               .eq(EmailVerifyCode::getCode, code)
               .eq(EmailVerifyCode::getScene, scene)
               .eq(EmailVerifyCode::getUsed, 0)
               .gt(EmailVerifyCode::getExpireTime, LocalDateTime.now())
               .orderByDesc(EmailVerifyCode::getCreateTime)
               .last("LIMIT 1");
        EmailVerifyCode record = emailVerifyCodeMapper.selectOne(wrapper);

        if (record == null) {
            // 验证码错误，增加错误计数
            int errorCount = incrementErrorCount(errorKey);
            if (errorCount >= MAX_ERROR_COUNT) {
                // 达到最大错误次数，锁定
                redisCache.setCacheObject(errorKey, "locked",
                        (int) ERROR_LOCK_MINUTES, TimeUnit.MINUTES);
                log.warn("[EmailVerifyService] 邮箱 {} 验证错误次数过多，已锁定{}分钟", safeEmail, ERROR_LOCK_MINUTES);
            }
            throw new RuntimeException("验证码错误或已过期");
        }

        // 验证通过，消耗验证码
        if (consume) {
            record.setUsed(1);
            emailVerifyCodeMapper.updateById(record);
            // 清除错误计数
            redisCache.deleteObject(errorKey);
        }

        log.info("[EmailVerifyService] 验证码验证{} -> {}", consume ? "并消耗" : "通过", safeEmail);
        return record;
    }

    /**
     * 生成6位数字验证码
     */
    private String generateCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    /**
     * 增加错误计数
     */
    private int incrementErrorCount(String key) {
        String countStr = redisCache.getCacheObject(key);
        if (countStr == null || "locked".equals(countStr)) {
            redisCache.setCacheObject(key, "1", (int) ERROR_LOCK_MINUTES, TimeUnit.MINUTES);
            return 1;
        }
        int count = Integer.parseInt(countStr);
        count++;
        redisCache.setCacheObject(key, String.valueOf(count),
                (int) ERROR_LOCK_MINUTES, TimeUnit.MINUTES);
        return count;
    }

    /**
     * 获取 key 的剩余 TTL（秒）
     */
    private long getTtl(String key) {
        Boolean exists = redisCache.hasKey(key);
        if (Boolean.FALSE.equals(exists)) {
            return -1L;
        }
        return redisCache.getExpire(key);
    }

    /**
     * 获取到当天午夜剩余秒数
     */
    private long getSecondsUntilMidnight() {
        long now = System.currentTimeMillis();
        long midnight = java.time.LocalDate.now().plusDays(1)
                .atStartOfDay().toInstant(java.time.ZoneOffset.ofHours(8))
                .toEpochMilli();
        return (midnight - now) / 1000;
    }

    /**
     * 构建验证码 HTML 邮件内容
     */
    private String buildEmailHtml(String code) {
        return "<div style='max-width:480px;margin:0 auto;font-family:Arial,sans-serif;'>" +
                "  <div style='background:#4A90E2;padding:24px;text-align:center;border-radius:8px 8px 0 0;'>" +
                "    <h2 style='color:#fff;margin:0;font-size:20px;'>青少年心理健康平台</h2>" +
                "  </div>" +
                "  <div style='background:#f9fafb;padding:32px 24px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;'>" +
                "    <p style='color:#333;font-size:15px;line-height:1.8;'>您好！</p>" +
                "    <p style='color:#333;font-size:15px;line-height:1.8;'>您正在绑定邮箱，验证码为：</p>" +
                "    <div style='background:#fff;border:2px dashed #4A90E2;border-radius:8px;padding:20px;text-align:center;margin:20px 0;'>" +
                "      <span style='font-size:32px;font-weight:bold;color:#4A90E2;letter-spacing:8px;'>" + code + "</span>" +
                "    </div>" +
                "    <p style='color:#666;font-size:14px;line-height:1.8;'>验证码有效期：<strong>15分钟</strong></p>" +
                "    <p style='color:#999;font-size:13px;line-height:1.8;'>请勿将验证码告知他人。如非本人操作，请忽略此邮件。</p>" +
                "    <hr style='border:none;border-top:1px solid #eee;margin:24px 0;'>" +
                "    <p style='color:#aaa;font-size:12px;text-align:center;'>— 青少年心理健康关爱平台</p>" +
                "  </div>" +
                "</div>";
    }

    /**
     * 邮箱脱敏
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        int atIndex = email.indexOf("@");
        String prefix = email.substring(0, atIndex);
        String suffix = email.substring(atIndex);
        if (prefix.length() <= 2) {
            return prefix.charAt(0) + "***" + suffix;
        }
        return prefix.substring(0, 2) + "***" + suffix;
    }
}
