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
    }
}
