package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.config.RedisCache;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.constants.RegexConstant;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.JwtProperties;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.LoginUser;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserMembership;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserMembershipMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IEmailVerifyService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ILoginService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class LoginServiceImpl implements ILoginService {

    /* ========== 依赖注入 ========== */
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;
    private final RedisCache redisCache;
    private final IUserService userService;
    private final PasswordEncoder passwordEncoder;
    private final UserMembershipMapper membershipMapper;
    private final IEmailVerifyService emailVerifyService;

    /* ========== Redis Key 前缀 ========== */
    private static final String ONLINE_TOKEN_KEY = "online:user:";
    private static final String BLACKLIST_KEY = "blacklist:token:";

    /* ==================== 1. 用户名密码登录 ==================== */
    @Override
    public Result<HashMap<Object, Object>> login(User user) {
        return login(user, false);
    }

    @Override
    public Result<HashMap<Object, Object>> login(User user, Boolean remember) {
        // 1. 封装Authentication对象
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword());

        // 2. 通过AuthenticationManager认证
        Authentication authenticated = authenticationManager.authenticate(authenticationToken);

        // 3. 获取用户信息
        LoginUser loginUser = (LoginUser) authenticated.getPrincipal();
        if (loginUser.getUser().getId() == null) {
            return Result.error("用户不存在");
        }
        String userId = loginUser.getUser().getId().toString();

        // 4. 单设备登录处理
        handleSingleDeviceLogin(userId);

        // 5. 生成Token并返回
        HashMap<Object, Object> result = buildLoginResult(loginUser.getUser(), remember);
        return Result.success("登录成功", result);
    }

    @Override
    public Result<HashMap<Object, Object>> adminLogin(User user, Boolean remember) {
        HashMap<Object, Object> result = buildLoginResult(user, remember);
        return Result.success("登录成功", result);
    }

    /* ==================== 邮箱登录/注册 ==================== */

    /**
     * 发送邮箱验证码（注册/登录共用）
     *
     * @param email 目标邮箱
     * @param scene 场景：register=注册，login=登录
     */
    public Result<String> sendEmailCode(String email, String scene) {
        // 1. 参数校验
        if (email == null || !email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            return Result.error("邮箱格式不正确");
        }
        if (!IEmailVerifyService.SCENE_REGISTER.equals(scene)
                && !IEmailVerifyService.SCENE_LOGIN.equals(scene)) {
            return Result.error("无效的验证场景");
        }

        // 2. 注册场景：检查邮箱是否已注册
        if (IEmailVerifyService.SCENE_REGISTER.equals(scene)) {
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getEmail, email);
            if (userService.count(wrapper) > 0) {
                return Result.error("该邮箱已注册，请直接登录或使用找回密码");
            }
        }

        // 3. 登录场景：检查邮箱是否已注册
        if (IEmailVerifyService.SCENE_LOGIN.equals(scene)) {
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getEmail, email);
            if (userService.count(wrapper) == 0) {
                return Result.error("该邮箱未注册，请先注册");
            }
        }

        // 4. 发送验证码
        try {
            emailVerifyService.sendVerifyCode(email, scene);
            return Result.success("验证码已发送到 " + maskEmail(email), null);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("验证码发送失败：" + e.getMessage());
        }
    }

    /**
     * 邮箱 + 验证码登录
     */
    public Result<HashMap<Object, Object>> loginByEmailCode(String email, String code) {
        // 1. 参数校验
        if (email == null || !email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            return Result.error("邮箱格式不正确");
        }
        if (code == null || code.length() != 6) {
            return Result.error("验证码格式不正确（6位数字）");
        }

        // 2. 验证邮箱验证码（消耗）
        try {
            emailVerifyService.verifyAndConsumeCode(email, code, IEmailVerifyService.SCENE_LOGIN);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }

        // 3. 根据邮箱查询用户
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getEmail, email);
        User user = userService.getOne(wrapper);

        if (user == null) {
            return Result.error("用户不存在");
        }

        // 4. 检查账号状态
        if (user.getStatus() == 0) {
            return Result.error("账号已被禁用");
        }

        // 5. 返回登录结果
        return Result.success("登录成功", buildLoginResult(user, false));
    }

    /**
     * 邮箱 + 密码登录
     */
    public Result<HashMap<Object, Object>> loginByEmailPassword(String email, String password, Boolean remember) {
        // 1. 参数校验
        if (email == null || !email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            return Result.error("邮箱格式不正确");
        }
        if (password == null || password.isEmpty()) {
            return Result.error("密码不能为空");
        }

        // 2. 根据邮箱查询用户
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getEmail, email);
        User user = userService.getOne(wrapper);

        if (user == null) {
            return Result.error("该邮箱未注册");
        }

        // 3. 检查账号状态
        if (user.getStatus() == 0) {
            return Result.error("账号已被禁用");
        }

        // 4. 校验密码
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return Result.error("密码错误");
        }

        // 5. 返回登录结果
        return Result.success("登录成功", buildLoginResult(user, remember));
    }

    /**
     * 邮箱 + 验证码注册
     * 先验证邮箱验证码，再完成注册
     */
    public Result<String> registerWithEmail(String email, String code, String username,
                                            String password, String phone, String nickname) {
        // 1. 参数校验
        if (email == null || !email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            return Result.error("邮箱格式不正确");
        }
        if (code == null || code.length() != 6) {
            return Result.error("验证码格式不正确（6位数字）");
        }
        if (username == null || !username.matches(RegexConstant.USERNAME)) {
            return Result.error("用户名格式不正确（4-16位字母、数字、下划线、减号）");
        }
        if (password == null || !password.matches(RegexConstant.PASSWORD)) {
            return Result.error("密码格式不正确（8-16位，必须包含大小写字母和数字）");
        }
        if (phone != null && !phone.isEmpty() && !phone.matches(RegexConstant.PHONE)) {
            return Result.error("手机号格式不正确");
        }

        // 2. 验证邮箱验证码（消耗）
        try {
            emailVerifyService.verifyAndConsumeCode(email, code, IEmailVerifyService.SCENE_REGISTER);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }

        // 3. 校验用户名是否存在
        LambdaQueryWrapper<User> userWrapper = new LambdaQueryWrapper<>();
        userWrapper.eq(User::getUsername, username);
        if (userService.count(userWrapper) > 0) {
            return Result.error("用户名已存在");
        }

        // 4. 校验邮箱是否已被注册（双重检查）
        LambdaQueryWrapper<User> emailWrapper = new LambdaQueryWrapper<>();
        emailWrapper.eq(User::getEmail, email);
        if (userService.count(emailWrapper) > 0) {
            return Result.error("该邮箱已被注册");
        }

        // 5. 校验手机号是否已被注册
        if (phone != null && !phone.isEmpty()) {
            LambdaQueryWrapper<User> phoneWrapper = new LambdaQueryWrapper<>();
            phoneWrapper.eq(User::getPhone, phone);
            if (userService.count(phoneWrapper) > 0) {
                return Result.error("该手机号已被注册");
            }
        }

        // 6. 加密密码
        String encodedPassword = passwordEncoder.encode(password);

        // 7. 创建用户
        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setPassword(encodedPassword);
        user.setPhone(phone);
        user.setNickname(nickname != null && !nickname.isEmpty()
                ? nickname : "用户" + UUID.randomUUID().toString().substring(0, 7));
        user.setRole(1);
        user.setStatus(1);
        user.setDeleted(false);
        user.setEmailVerified(1); // 邮箱已验证
        user.setCreateTime(java.time.LocalDateTime.now());

        boolean save = userService.save(user);
        if (!save) {
            return Result.error("注册失败，请稍后重试");
        }

        return Result.success("注册成功", null);
    }

    /* ==================== 忘记密码 ==================== */

    /**
     * 发送忘记密码验证码
     * 条件：用户名+邮箱必须匹配同一账号
     */
    public Result<String> sendForgotPasswordCode(String username, String email) {
        // 1. 参数校验
        if (username == null || username.isEmpty()) {
            return Result.error("用户名不能为空");
        }
        if (email == null || !email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            return Result.error("邮箱格式不正确");
        }

        // 2. 查询该用户名是否存在
        LambdaQueryWrapper<User> userWrapper = new LambdaQueryWrapper<>();
        userWrapper.eq(User::getUsername, username);
        User user = userService.getOne(userWrapper);
        if (user == null) {
            return Result.error("该用户名不存在");
        }

        // 3. 校验用户名和邮箱是否匹配
        if (user.getEmail() == null || !user.getEmail().equalsIgnoreCase(email.trim())) {
            return Result.error("用户名与邮箱不匹配");
        }

        // 4. 检查账号状态
        if (user.getStatus() == 0) {
            return Result.error("账号已被禁用");
        }

        // 5. 发送验证码
        try {
            emailVerifyService.sendVerifyCode(email, IEmailVerifyService.SCENE_FORGOT_PASSWORD);
            return Result.success("验证码已发送到 " + maskEmail(email), null);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("验证码发送失败：" + e.getMessage());
        }
    }

    /**
     * 重置密码（忘记密码场景）
     * 条件：用户名+邮箱+验证码全部匹配
     */
    public Result<String> resetPassword(String username, String email, String code,
                                       String newPassword, String confirmPassword) {
        // 1. 参数校验
        if (username == null || username.isEmpty()) {
            return Result.error("用户名不能为空");
        }
        if (email == null || !email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            return Result.error("邮箱格式不正确");
        }
        if (code == null || code.length() != 6) {
            return Result.error("验证码格式不正确（6位数字）");
        }
        if (newPassword == null || !newPassword.matches(RegexConstant.PASSWORD)) {
            return Result.error("新密码格式不正确（8-16位，必须包含大小写字母和数字）");
        }
        if (confirmPassword == null || !confirmPassword.equals(newPassword)) {
            return Result.error("两次输入的密码不一致");
        }

        // 2. 查询用户
        LambdaQueryWrapper<User> userWrapper = new LambdaQueryWrapper<>();
        userWrapper.eq(User::getUsername, username);
        User user = userService.getOne(userWrapper);
        if (user == null) {
            return Result.error("该用户名不存在");
        }

        // 3. 校验用户名和邮箱是否匹配
        if (user.getEmail() == null || !user.getEmail().equalsIgnoreCase(email.trim())) {
            return Result.error("用户名与邮箱不匹配");
        }

        // 4. 验证邮箱验证码（消耗）
        try {
            emailVerifyService.verifyAndConsumeCode(email, code, IEmailVerifyService.SCENE_FORGOT_PASSWORD);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }

        // 5. 更新密码
        user.setPassword(passwordEncoder.encode(newPassword));
        boolean updated = userService.updateById(user);
        if (!updated) {
            return Result.error("密码重置失败，请稍后重试");
        }

        return Result.success("密码重置成功", null);
    }

    /**
     * 验证忘记密码验证码（仅验证，不重置密码）
     */
    public Result<String> verifyForgotCode(String username, String email, String code) {
        // 1. 参数校验
        if (username == null || username.isEmpty()) {
            return Result.error("用户名不能为空");
        }
        if (email == null || !email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            return Result.error("邮箱格式不正确");
        }
        if (code == null || code.length() != 6) {
            return Result.error("验证码格式不正确（6位数字）");
        }

        // 2. 查询用户
        LambdaQueryWrapper<User> userWrapper = new LambdaQueryWrapper<>();
        userWrapper.eq(User::getUsername, username);
        User user = userService.getOne(userWrapper);
        if (user == null) {
            return Result.error("该用户名不存在");
        }

        // 3. 校验用户名和邮箱是否匹配
        if (user.getEmail() == null || !user.getEmail().equalsIgnoreCase(email.trim())) {
            return Result.error("用户名与邮箱不匹配");
        }

        // 4. 验证邮箱验证码（消耗）
        try {
            emailVerifyService.verifyAndConsumeCode(email, code, IEmailVerifyService.SCENE_FORGOT_PASSWORD);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }

        return Result.success("验证成功", null);
    }

    /* ==================== 退出登录 ==================== */
    @Override
    public Result<String> logout(Long userId, String token) {
        if (userId == null || token == null) {
            return Result.error("参数错误");
        }
        String userIdStr = userId.toString();

        // 1. 清除在线token记录
        String onlineKey = ONLINE_TOKEN_KEY + userIdStr;
        String currentToken = redisCache.getCacheObject(onlineKey);
        if (token.equals(currentToken)) {
            redisCache.deleteObject(onlineKey);
        }

        // 2. 将token加入黑名单
        long remainingTime = jwtUtil.getRemainingTimeMs(token);
        if (remainingTime > 0) {
            redisCache.setCacheObject(BLACKLIST_KEY + token, "1", remainingTime, TimeUnit.MILLISECONDS);
        }

        // 3. 清除用户登录信息
        redisCache.deleteObject("login:" + userIdStr);

        return Result.success("退出登录成功");
    }

    /* ==================== 注册 ==================== */
    @Override
    public Result<String> register(User user) {
        // 0. 参数格式校验
        if (user.getUsername() == null || !user.getUsername().matches(RegexConstant.USERNAME)) {
            return Result.error("用户名格式不正确（4-16位字母、数字、下划线、减号）");
        }
        if (user.getPassword() == null || !user.getPassword().matches(RegexConstant.PASSWORD)) {
            return Result.error("密码格式不正确（8-16位，必须包含大小写字母和数字）");
        }
        if (user.getPhone() != null && !user.getPhone().isEmpty() && !user.getPhone().matches(RegexConstant.PHONE)) {
            return Result.error("手机号格式不正确");
        }

        // 1. 校验用户名是否存在
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUsername, user.getUsername());
        if (userService.count(queryWrapper) > 0) {
            return Result.error("用户名已存在");
        }

        // 2. 校验手机号是否存在
        if (user.getPhone() != null) {
            LambdaQueryWrapper<User> phoneWrapper = new LambdaQueryWrapper<>();
            phoneWrapper.eq(User::getPhone, user.getPhone());
            if (userService.count(phoneWrapper) > 0) {
                return Result.error("手机号已注册");
            }
        }

        // 3. 加密密码
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        // 4. 设置默认值
        if (user.getNickname() == null) {
            user.setNickname("用户" + UUID.randomUUID().toString().substring(0, 7));
        }
        // 安全：注册通道永远创建普通用户(role=1)，忽略任何客户端传入的 role/状态，防止提权
        user.setRole(1);
        user.setStatus(1);
        user.setMemberType(null);
        user.setDeleted(false);

        // 5. 保存
        boolean save = userService.save(user);
        if (!save) {
            return Result.error("注册失败");
        }

        return Result.success("注册成功", null);
    }

    /* ==================== 私有辅助方法 ==================== */

    /**
     * 构建登录结果（Token + userInfo）
     */
    public HashMap<Object, Object> buildLoginResult(User user, Boolean remember) {
        // 单设备登录处理
        handleSingleDeviceLogin(user.getId().toString());

        LoginUser loginUser = new LoginUser();
        loginUser.setUser(user);

        // 检查会员是否有效
        if (user.getMemberType() != null && user.getMemberType() > 0) {
            // 有会员类型且不是非会员
            if (user.getMemberExpireDate() != null
                    && user.getMemberExpireDate().isAfter(LocalDateTime.now())) {
                // expireDate 为 null 表示永久会员，或者未过期
                loginUser.setMemberType(user.getMemberType());
                loginUser.setMemberExpireTime(user.getMemberExpireDate());
            } else {
                // 会员已过期
                loginUser.setMemberType(0);
                loginUser.setMemberExpireTime(null);
            }
        } else {
            // 非会员
            loginUser.setMemberType(0);
            loginUser.setMemberExpireTime(null);
        }

        HashMap<Object, Object> idHashMap = new HashMap<>();
        idHashMap.put("userId", user.getId().toString());
        long expirationMs = Boolean.TRUE.equals(remember)
                ? jwtProperties.getRememberExpiration()
                : jwtProperties.getExpiration();
        String jwt = jwtUtil.generateToken(idHashMap, expirationMs);

        // 存入 Redis
        redisCache.setCacheObject("login:" + user.getId(), loginUser, expirationMs, TimeUnit.MILLISECONDS);
        redisCache.setCacheObject(ONLINE_TOKEN_KEY + user.getId(), jwt, expirationMs, TimeUnit.MILLISECONDS);

        HashMap<Object, Object> result = new HashMap<>();
        result.put("token", jwt);
        result.put("userInfo", user);
        return result;
    }

    /**
     * 单设备登录：旧token加入黑名单
     */
    private void handleSingleDeviceLogin(String userId) {
        String onlineKey = ONLINE_TOKEN_KEY + userId;
        String oldToken = redisCache.getCacheObject(onlineKey);
        if (oldToken != null && !oldToken.isEmpty()) {
            long remainingTime = jwtUtil.getRemainingTimeMs(oldToken);
            if (remainingTime > 0) {
                redisCache.setCacheObject(BLACKLIST_KEY + oldToken, "1", remainingTime, TimeUnit.MILLISECONDS);
            }
        }
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
