package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginUser implements UserDetails {

    private User user;                    // 封装用户信息
    private Integer memberType;          // 会员类型：0-非会员, 1-VIP, 2-SVIP
    private LocalDateTime memberExpireTime; // 会员过期时间

    //获取权限
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (user != null && user.getRole() != null) {
            // Spring Security Role expects prefix "ROLE_" by default for hasRole check
            // However, hasAnyRole check also adds "ROLE_" prefix if not present.
            // If we use hasAuthority, no prefix is added.
            // Let's use simple authority string matching the role number.
            return java.util.Collections.singletonList(
                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole())
            );
        }
        return java.util.Collections.emptyList();
    }

    //获取密码
    @Override
    public String getPassword() {
        return user.getPassword();
    }

    //获取用户�?
    @Override
    public String getUsername() {
        return user.getUsername();
    }

    //账户是否未过�?
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    //账户是否未锁�?
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    //密码是否未过�?
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    //账户是否可用
    @Override
    public boolean isEnabled() {
        //禁用和冻�?
        return user.getStatus() != 0 && user.getStatus() != 2;
    }



}
