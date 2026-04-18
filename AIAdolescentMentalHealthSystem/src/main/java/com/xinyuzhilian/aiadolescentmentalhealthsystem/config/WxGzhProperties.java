package com.xinyuzhilian.aiadolescentmentalhealthsystem.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 微信公众号配置属性类
 * 对应 application.yml 中的 wx-gzh 配置
 */
@Data
@Component
@ConfigurationProperties("wx-gzh")
public class WxGzhProperties {

    /** 微信公众号 AppID */
    private String appid;

    /** 微信公众号 AppSecret */
    private String secret;

    /**
     * 授权回调基础地址（用于生成微信回调 URL）
     * - 本地测试：用 ngrok 穿透后的 HTTPS 地址，如 https://xxxx.ngrok.io
     * - 服务器测试：填测试机公网 IP 或域名
     * - 生产环境：填你的公网域名，如 https://api.yourdomain.com
     * - 为空时使用相对路径（仅前端和后端同源时可用）
     */
    private String callbackBaseUrl;
}
