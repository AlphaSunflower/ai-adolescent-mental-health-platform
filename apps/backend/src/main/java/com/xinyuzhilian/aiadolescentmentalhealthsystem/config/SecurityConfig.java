package com.xinyuzhilian.aiadolescentmentalhealthsystem.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.filter.JwtAuthenticationTokenFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableAsync
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    final AuthenticationConfiguration authenticationConfiguration;
    final JwtAuthenticationTokenFilter jwtAuthenticationTokenFilter;

    /** CORS 白名单，逗号分隔；未配置时回退到本地开发端口 */
    @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins:}")
    private String corsAllowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 安全：不允许通配符 origin + credentials。从配置读取白名单（逗号分隔），默认仅本地开发端口。
        String origins = corsAllowedOrigins == null || corsAllowedOrigins.isBlank()
                ? "http://localhost:3000,http://localhost:3001,http://localhost:5173,http://127.0.0.1:5173"
                : corsAllowedOrigins;
        configuration.setAllowedOriginPatterns(Arrays.stream(origins.split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList());
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }





    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .dispatcherTypeMatchers(DispatcherType.ASYNC, DispatcherType.ERROR).permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/health", "/api/health", "/actuator/health").permitAll()
                        // WebSocket 放行
                        .requestMatchers("/ws/omni-realtime").permitAll()
                        // 登录注册相关放行
                        .requestMatchers("/admin/login", "/user/login", "/user/register", "/user/login/wx",
                                "/user/login/wx/gzh/callback",
                                "/user/wx/status",
                                "/user/wx/email/send",
                                "/user/wx/email/bind",
                                "/user/email/send",
                                "/user/register/email",
                                "/user/login/email",
                                "/user/login/email/password",
                                "/user/forgot/send",
                                "/user/forgot/verify",
                                "/user/forgot/reset").permitAll()
                        // SSE 流式输出需要认证（经 Authorization header 的 Bearer token，前端不应把 JWT 放进 URL）
                        .requestMatchers("/consultation/message/stream/**").authenticated()
                        .requestMatchers("/api/consultation/message/stream/**").authenticated()
                        // 心理咨询消息 SSE 需要认证
                        .requestMatchers("/psychologist/message/stream/**").authenticated()
                        .requestMatchers("/api/psychologist/message/stream/**").authenticated()
                        // 搜索和书籍放行
                        .requestMatchers("/search/**").permitAll()
                        .requestMatchers("/book/**").permitAll()
                        .requestMatchers("/api/search/**").permitAll()
                        .requestMatchers("/api/book/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/book/comment").authenticated()
                        // 小爱倾听接口需要认证
                        .requestMatchers("/xiaoai/**").authenticated()
                        // 文件上传接口放行
                        .requestMatchers("/psychologist-apply/upload", "/common/upload").permitAll()
                        .anyRequest().authenticated()
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(ex -> ex
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            log.error("=== AccessDenied === uri: {}, exception: {}",
                                    request.getRequestURI(), accessDeniedException.getClass().getName());
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.getWriter().write("{\"code\":403,\"message\":\"拒绝访问\"}");
                        })
                        .authenticationEntryPoint((request, response, authException) -> {
                            log.error("=== AuthenticationEntryPoint === uri: {}", request.getRequestURI());
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("{\"code\":401,\"message\":\"未认证或登录已过期\"}");
                        })
                );

        http.addFilterBefore(jwtAuthenticationTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
