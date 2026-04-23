package com.xinyuzhilian.aiadolescentmentalhealthsystem.utils;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 邮件发送配置属性类
 * 对应 application.yml 中的 send.mail 配置
 */
@Data
@Component
@ConfigurationProperties("send.mail")
public class MailProperties {

    /** 发送服务器，如 smtp.qq.com */
    private String host;

    /** 端口，如 587 */
    private String port;

    /** 邮箱用户名（发件人地址） */
    private String username;

    /** 邮箱授权码 */
    private String password;
}
