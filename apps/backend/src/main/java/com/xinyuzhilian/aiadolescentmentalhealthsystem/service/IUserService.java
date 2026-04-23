package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.baomidou.mybatisplus.extension.service.IService;

/**
 * <p>
 * 用户信息�?服务�?
 * </p>
 *
 * @author 魏辰�?
 * @since 2026-01-18
 */
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;

public interface IUserService extends IService<User> {
    User getUserInfo(Long userId);
    User updateUserInfo(Long userId, User user);
    PageResult<User> getPatientsByDoctorId(Long doctorId, Integer page, Integer size);
    
    // Admin methods
    PageResult<User> getUsers(Integer page, Integer size, String username, Integer status);
    void saveUser(User user);
    void deleteUser(Long id);

    /**
     * 获取邮箱修改次数信息
     * @return Map with remaining count and last change date
     */
    java.util.Map<String, Object> getEmailChangeInfo(Long userId);

    /**
     * 修改个人信息（带邮箱修改次数限制）
     * @param userId 用户ID
     * @param user 更新后的用户信息
     * @param emailCode 邮箱验证码（邮箱变更时必填）
     * @param newEmail 新邮箱（仅当邮箱变更时传入）
     * @return 更新后的用户信息
     */
    User updateUserInfo(Long userId, User user, String emailCode, String newEmail);
}
