package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IEmailVerifyService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 用户管理控制器
 * 处理用户个人信息查询、修改等操作
 */
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;
    private final IEmailVerifyService emailVerifyService;

    /**
     * 获取当前登录用户信息
     */
    @GetMapping("/info")
    public Result<User> getUserInfo(@CurrentUserId Long userId) {
        return Result.success(userService.getUserInfo(userId));
    }

    /**
     * 获取邮箱修改次数信息
     */
    @GetMapping("/email/change-info")
    public Result<Map<String, Object>> getEmailChangeInfo(@CurrentUserId Long userId) {
        return Result.success(userService.getEmailChangeInfo(userId));
    }

    /**
     * 发送修改邮箱的验证码（发到新邮箱）
     */
    @PostMapping("/email/send-code")
    public Result<String> sendChangeEmailCode(
            @CurrentUserId Long userId,
            @RequestBody Map<String, String> body) {
        String newEmail = body.get("email");
        if (newEmail == null || !newEmail.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            return Result.error("邮箱格式不正确");
        }
        try {
            emailVerifyService.sendVerifyCode(newEmail, null, null, IEmailVerifyService.SCENE_CHANGE_EMAIL);
            return Result.success("验证码已发送到 " + maskEmail(newEmail), null);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("验证码发送失败：" + e.getMessage());
        }
    }

    /**
     * 更新当前登录用户信息（支持邮箱修改）
     *
     * @param user      用户信息对象
     * @param emailCode 邮箱验证码（修改邮箱时必填）
     * @param newEmail  新邮箱地址（仅修改邮箱时传入）
     */
    @PostMapping("/update")
    public Result<User> updateUserInfo(
            @CurrentUserId Long userId,
            @RequestBody Map<String, Object> body) {
        try {
            User user = mapToUser(body);
            String emailCode = (String) body.get("emailCode");
            String newEmail = (String) body.get("newEmail");
            User updatedUser = userService.updateUserInfo(userId, user, emailCode, newEmail);
            return Result.success("保存成功", updatedUser);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("保存失败：" + e.getMessage());
        }
    }

    private User mapToUser(Map<String, Object> body) {
        User user = new User();
        if (body.get("id") != null) user.setId(((Number) body.get("id")).longValue());
        if (body.get("nickname") != null) user.setNickname((String) body.get("nickname"));
        if (body.get("sex") != null) user.setSex(((Number) body.get("sex")).intValue());
        if (body.get("birthday") != null) user.setBirthday(java.time.LocalDate.parse((String) body.get("birthday")));
        if (body.get("phone") != null) user.setPhone((String) body.get("phone"));
        if (body.get("signature") != null) user.setSignature((String) body.get("signature"));
        if (body.get("headPath") != null) user.setHeadPath((String) body.get("headPath"));
        return user;
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        int at = email.indexOf("@");
        String name = email.substring(0, at);
        String domain = email.substring(at);
        if (name.length() <= 3) return "***" + domain;
        return name.substring(0, 3) + "***" + domain;
    }
}
