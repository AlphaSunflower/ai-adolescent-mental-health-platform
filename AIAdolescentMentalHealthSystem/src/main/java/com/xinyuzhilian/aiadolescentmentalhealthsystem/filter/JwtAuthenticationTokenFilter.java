package com.xinyuzhilian.aiadolescentmentalhealthsystem.filter;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.config.RedisCache;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.LoginUser;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {

    private final RedisCache redisCache;
    private final JwtUtil jwtUtil;

    private static final String ONLINE_TOKEN_KEY = "online:user:";
    private static final String BLACKLIST_KEY = "blacklist:token:";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 1. 获取token（支持 Authorization: Bearer xxx 和 token: xxx 两种方式）
        String token = request.getHeader("Authorization");
        if (StringUtils.hasText(token) && token.startsWith("Bearer ")) {
            token = token.substring(7);
        } else {
            token = request.getHeader("token");
        }
        
        if (!StringUtils.hasText(token)) {
            // 没有token，放行（让Spring Security处理）
            filterChain.doFilter(request, response);
            return;
        }

        // 2. 检查黑名单
        String blacklistKey = BLACKLIST_KEY + token;
        if (Boolean.TRUE.equals(redisCache.hasKey(blacklistKey))) {
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"code\":401,\"message\":\"您的账号已在其他设备登录，请重新登录\"}");
            return;
        }

        // 3. 解析token`
        String userId;
        try {
            Claims claims = jwtUtil.parse(token);
            Object userIdObj = claims.get("userId");
            if (userIdObj == null) {
                throw new RuntimeException("token非法");
            }
            userId = userIdObj.toString();
        } catch (Exception e) {
            log.warn("Token解析失败: {}", e.getMessage());
            // token解析失败，放行（让Spring Security处理）
            filterChain.doFilter(request, response);
            return;
        }

        // 4. 获取用户信息
        String redisKey = "login:" + userId;
        LoginUser loginUser = redisCache.getCacheObject(redisKey);

        if (Objects.isNull(loginUser)) {
            log.warn("Redis中未找到用户信息, userId: {}", userId);
            // Redis中没有用户信息，放行
            filterChain.doFilter(request, response);
            return;
        }

        // 5. 检查单设备登录
        String onlineKey = ONLINE_TOKEN_KEY + userId;
        String onlineToken = redisCache.getCacheObject(onlineKey);
        if (onlineToken != null && !onlineToken.equals(token)) {
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"code\":401,\"message\":\"您的账号已在其他设备登录，请重新登录\"}");
            return;
        }

        // 6. 设置认证信息
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(loginUser, null, loginUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        
        log.debug("用户认证成功, userId: {}, uri: {}", userId, request.getRequestURI());

        // 8. 打印当前 SecurityContext 状态（用于调试）
        log.info(">>> SecurityContext 状态 - authenticated: {}, principal: {}, uri: {}, authorities: {}",
                SecurityContextHolder.getContext().getAuthentication().isAuthenticated(),
                SecurityContextHolder.getContext().getAuthentication().getPrincipal(),
                request.getRequestURI(),
                SecurityContextHolder.getContext().getAuthentication().getAuthorities());

        // 9. 放行
        filterChain.doFilter(request, response);
    }
}