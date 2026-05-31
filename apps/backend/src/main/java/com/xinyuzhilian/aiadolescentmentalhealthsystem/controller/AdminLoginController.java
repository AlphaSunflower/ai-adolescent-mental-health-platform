package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.LoginUser;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ILoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class AdminLoginController {

    private final ILoginService loginService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/admin/login")
    public Result<HashMap<Object, Object>> adminLogin(@RequestBody HashMap<String, String> map) {
        String username = map.get("username");
        String password = map.get("password");
        Boolean remember = "true".equalsIgnoreCase(map.get("remember"));

        // 1. Authenticate
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(username, password);
        Authentication authenticated = authenticationManager.authenticate(authToken);
        LoginUser loginUser = (LoginUser) authenticated.getPrincipal();
        User user = loginUser.getUser();

        // 2. Role check: only roles 2,3,4 and isPsychologist=1
        int role = user.getRole() != null ? user.getRole() : 1;
        boolean isPsychologist = user.getIsPsychologist() != null && user.getIsPsychologist() == 1;
        if (role < 2 && !isPsychologist) {
            return Result.error(403, "非管理员账号，无法登录管理端");
        }

        // 3. Check account status
        if (user.getStatus() == 0) {
            return Result.error("账号已被禁用");
        }

        // 4. Delegate to loginService for token generation
        return loginService.adminLogin(user, remember);
    }
}
