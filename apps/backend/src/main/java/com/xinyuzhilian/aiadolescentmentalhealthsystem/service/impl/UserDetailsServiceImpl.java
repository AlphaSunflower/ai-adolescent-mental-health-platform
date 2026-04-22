package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.LoginUser;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserMembership;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserMembershipMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserMapper userMapper;
    private final UserMembershipMapper membershipMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 根据用户名查询用户信息
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<User>().eq(User::getUsername, username);
        User user = userMapper.selectOne(wrapper);

        // 如果没有该用户就抛出异常
        if (Objects.isNull(user)) {
            throw new RuntimeException("用户名或密码错误");
        }

        // 查询会员信息
        LambdaQueryWrapper<UserMembership> memberWrapper = new LambdaQueryWrapper<>();
        memberWrapper.eq(UserMembership::getUserId, user.getId());
        UserMembership membership = membershipMapper.selectOne(memberWrapper);

        // 构建 LoginUser
        LoginUser loginUser = new LoginUser();
        loginUser.setUser(user);

        // 设置会员信息
        if (membership != null) {
            // 检查会员是否过期
            if (membership.getMemberExpireTime() == null
                    || membership.getMemberExpireTime().isAfter(LocalDateTime.now())) {
                loginUser.setMemberType(membership.getMemberType());
                loginUser.setMemberExpireTime(membership.getMemberExpireTime());
            } else {
                // 会员已过期，设置为非会员
                loginUser.setMemberType(0);
            }
        } else {
            loginUser.setMemberType(0);
        }

        return loginUser;
    }
}
