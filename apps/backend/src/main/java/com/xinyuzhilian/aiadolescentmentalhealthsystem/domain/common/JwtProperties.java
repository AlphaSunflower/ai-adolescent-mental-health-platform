package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Setter
@Getter
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String secret;
    private long expiration = 86400000L;  // 默认24小时（毫秒）
    private long rememberExpiration = 2592000000L;  // 默认30天（毫秒）
    private String issuer;

    @PostConstruct
    public void init() {
        // 如果配置文件中没有设置rememberExpiration，默认30天
        if (rememberExpiration == 0) {
            rememberExpiration = 2592000000L;
        }
        // 安全：JWT 签名密钥必须由外部提供（JWT_SECRET）。缺失、过短或仍为公开默认值时，启动即失败（fail-fast），
        // 防止在密钥泄露/弱密钥下仍以可伪造 token 运行。HS256 要求 >= 32 字节(256-bit)。
        String knownDevSecret = "ai-adolescent-mental-health-dev-secret-key-2024";
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("未配置 JWT 签名密钥：请通过环境变量 JWT_SECRET 提供随机的强密钥");
        }
        if (knownDevSecret.equals(secret)) {
            throw new IllegalStateException("JWT 签名密钥仍为公开默认值：请通过环境变量 JWT_SECRET 替换为随机的强密钥");
        }
        if (secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT 签名密钥过短(<32字节)：请配置随机 256-bit 密钥");
        }
    }
}
