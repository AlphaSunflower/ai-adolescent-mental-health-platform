package com.xinyuzhilian.aiadolescentmentalhealthsystem.utils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Properties;

/**
 * 邮件发送工具类
 * 支持纯文本邮件和 HTML 邮件
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MailUtils {

    private final MailProperties mailProperties;

    /**
     * 发送纯文本邮件
     *
     * @param toAddress 收件人邮箱
     * @param subject   邮件主题
     * @param message   邮件正文（纯文本）
     */
    public void sendTextEmail(String toAddress, String subject, String message) throws MessagingException {
        Session session = createSession();
        MimeMessage msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress(mailProperties.getUsername()));
        msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toAddress));
        msg.setSubject(subject);
        msg.setText(message);
        Transport.send(msg);
        log.info("[MailUtils] 文本邮件发送成功 -> {}, subject: {}", toAddress, subject);
    }

    /**
     * 发送 HTML 邮件
     *
     * @param toAddress  收件人邮箱
     * @param subject    邮件主题
     * @param htmlContent HTML 格式的邮件正文
     */
    public void sendHtmlEmail(String toAddress, String subject, String htmlContent) throws MessagingException {
        Session session = createSession();
        MimeMessage msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress(mailProperties.getUsername()));
        msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toAddress));
        msg.setSubject(subject);
        msg.setContent(htmlContent, "text/html; charset=utf-8");
        Transport.send(msg);
        log.info("[MailUtils] HTML邮件发送成功 -> {}, subject: {}", toAddress, subject);
    }

    /**
     * 创建邮件会话
     */
    private Session createSession() {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", mailProperties.getHost());
        props.put("mail.smtp.port", mailProperties.getPort());

        return Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(
                        mailProperties.getUsername(),
                        mailProperties.getPassword()
                );
            }
        });
    }
}
