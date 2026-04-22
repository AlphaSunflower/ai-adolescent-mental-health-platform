package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.config.RedisCache;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.DoctorPatientRelation;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.DoctorPatientRelationMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IEmailVerifyService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 用户信息服务实现类
 *
 * @author 魏辰
 * @since 2026-01-18
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {

    private final DoctorPatientRelationMapper relationMapper;
    private final PasswordEncoder passwordEncoder;
    private final IEmailVerifyService emailVerifyService;
    private final RedisCache redisCache;

    @Override
    public User getUserInfo(Long userId) {
        User user = this.getById(userId);
        if (user != null) {
            user.setPassword(null);
        }
        return user;
    }

    @Override
    public User updateUserInfo(Long userId, User user) {
        user.setId(userId);
        user.setPassword(null);
        user.setUsername(null);
        user.setRole(null);
        user.setStatus(null);
        
        boolean updated = this.updateById(user);
        if (updated) {
            return this.getUserInfo(userId);
        }
        return null;
    }

    @Override
    public PageResult<User> getPatientsByDoctorId(Long doctorId, Integer page, Integer size) {
        Page<DoctorPatientRelation> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<DoctorPatientRelation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DoctorPatientRelation::getDoctorId, doctorId);
        
        Page<DoctorPatientRelation> relationPage = relationMapper.selectPage(pageParam, wrapper);
        
        if (relationPage.getRecords().isEmpty()) {
            return new PageResult<>();
        }

        List<Long> patientIds = relationPage.getRecords().stream()
                .map(DoctorPatientRelation::getPatientId)
                .collect(Collectors.toList());
        
        List<User> patients = this.listByIds(patientIds);
        if (patients != null) {
            patients.forEach(p -> {
                p.setPassword(null);
                if (p.getPhone() != null && p.getPhone().length() > 7) {
                    p.setPhone(p.getPhone().substring(0, 3) + "****" + p.getPhone().substring(7));
                }
            });
        } else {
            patients = new ArrayList<>();
        }

        PageResult<User> result = new PageResult<>();
        result.setRecords(patients);
        result.setTotal(relationPage.getTotal());
        result.setSize(relationPage.getSize());
        result.setCurrent(relationPage.getCurrent());
        result.setPages(relationPage.getPages());
        return result;
    }

    @Override
    public PageResult<User> getUsers(Integer page, Integer size, String username, Integer status) {
        Page<User> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (username != null && !username.isEmpty()) {
            wrapper.like(User::getUsername, username);
        }
        if (status != null) {
            wrapper.eq(User::getStatus, status);
        }
        wrapper.orderByDesc(User::getCreateTime);
        return PageResult.build(this.page(pageParam, wrapper));
    }

    @Override
    public void saveUser(User user) {
        if (user.getId() == null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            this.save(user);
        } else {
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            } else {
                user.setPassword(null);
            }
            this.updateById(user);
        }
    }

    @Override
    public void deleteUser(Long id) {
        this.removeById(id);
    }

    /* ==================== 个人信息 - 邮箱修改次数限制 ==================== */

    private static final int MAX_EMAIL_CHANGES_PER_MONTH = 2;

    @Override
    public Map<String, Object> getEmailChangeInfo(Long userId) {
        User user = this.getById(userId);
        Map<String, Object> info = new HashMap<>();
        if (user == null) {
            info.put("remainingCount", 0);
            info.put("lastChangeDate", null);
            info.put("maxCount", MAX_EMAIL_CHANGES_PER_MONTH);
            return info;
        }

        LocalDate today = LocalDate.now();
        LocalDate lastChangeDate = user.getEmailChangeDate();

        // 跨月：重置计数
        if (lastChangeDate == null || lastChangeDate.getMonth() != today.getMonth()
                || lastChangeDate.getYear() != today.getYear()) {
            info.put("remainingCount", MAX_EMAIL_CHANGES_PER_MONTH);
            info.put("lastChangeDate", null);
        } else {
            int used = user.getEmailChangeCount() != null ? user.getEmailChangeCount() : 0;
            info.put("remainingCount", Math.max(0, MAX_EMAIL_CHANGES_PER_MONTH - used));
            info.put("lastChangeDate", lastChangeDate.toString());
        }
        info.put("maxCount", MAX_EMAIL_CHANGES_PER_MONTH);
        return info;
    }

    @Override
    @Transactional
    public User updateUserInfo(Long userId, User user, String emailCode, String newEmail) {
        User currentUser = this.getById(userId);
        if (currentUser == null) {
            throw new RuntimeException("用户不存在");
        }

        boolean emailChanged = false;
        String targetEmail = currentUser.getEmail();

        // 判断邮箱是否变更
        if (newEmail != null && !newEmail.isEmpty()
                && !newEmail.equalsIgnoreCase(currentUser.getEmail())) {
            emailChanged = true;

            // 校验次数限制
            LocalDate today = LocalDate.now();
            LocalDate lastChangeDate = currentUser.getEmailChangeDate();
            int usedCount = currentUser.getEmailChangeCount() != null ? currentUser.getEmailChangeCount() : 0;

            // 跨月重置
            if (lastChangeDate == null || lastChangeDate.getMonth() != today.getMonth()
                    || lastChangeDate.getYear() != today.getYear()) {
                usedCount = 0;
            }

            if (usedCount >= MAX_EMAIL_CHANGES_PER_MONTH) {
                throw new RuntimeException("本月邮箱修改次数已用完（每月最多" + MAX_EMAIL_CHANGES_PER_MONTH + "次），请下月再试");
            }

            // 校验验证码
            if (emailCode == null || emailCode.isEmpty()) {
                throw new RuntimeException("修改邮箱需要验证码");
            }

            // 验证并消耗验证码（发到新邮箱）
            emailVerifyService.verifyAndConsumeCode(newEmail, emailCode, IEmailVerifyService.SCENE_CHANGE_EMAIL);

            targetEmail = newEmail.trim();
        }

        // 组装更新对象（禁止修改的字段置空）
        user.setId(userId);
        user.setPassword(null);
        user.setUsername(null);
        user.setRole(null);
        user.setStatus(null);
        user.setEmail(targetEmail);

        // 邮箱变更：扣减次数 + 更新日期
        if (emailChanged) {
            LocalDate today = LocalDate.now();
            LocalDate lastChangeDate = currentUser.getEmailChangeDate();
            int usedCount = currentUser.getEmailChangeCount() != null ? currentUser.getEmailChangeCount() : 0;

            // 跨月重置
            if (lastChangeDate == null || lastChangeDate.getMonth() != today.getMonth()
                    || lastChangeDate.getYear() != today.getYear()) {
                usedCount = 0;
            }

            user.setEmailChangeCount(usedCount + 1);
            user.setEmailChangeDate(today);
            user.setEmailVerified(0); // 换邮箱后需要重新验证
        }

        boolean updated = this.updateById(user);
        if (!updated) {
            throw new RuntimeException("保存失败，请稍后重试");
        }

        return this.getUserInfo(userId);
    }
}
