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
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
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
                        .requestMatchers("/health", "/api/health").permitAll()
                        // WebSocket 放行
                        .requestMatchers("/ws/omni-realtime").permitAll()
                        // 登录注册相关放行
                        .requestMatchers("/user/login", "/user/register", "/user/login/wx",
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
                        // SSE 流式输出放行（支持 /api 前缀）
                        .requestMatchers("/consultation/message/stream/**").permitAll()
                        .requestMatchers("/api/consultation/message/stream/**").permitAll()
                        // 心理咨询消息 SSE 放行
                        .requestMatchers("/psychologist/message/stream/**").permitAll()
                        .requestMatchers("/api/psychologist/message/stream/**").permitAll()
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
                            log.error("=== AccessDenied === uri: {}, exception: {}, msg: {}",
                                    request.getRequestURI(), accessDeniedException.getClass().getName(), accessDeniedException.getMessage());
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.getWriter().write("{\"code\":403,\"message\":\"拒绝访问: " + accessDeniedException.getMessage() + "\"}");
                        })
                        .authenticationEntryPoint((request, response, authException) -> {
                            log.error("=== AuthenticationEntryPoint === uri: {}, msg: {}",
                                    request.getRequestURI(), authException.getMessage());
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("{\"code\":401,\"message\":\"未认证: " + authException.getMessage() + "\"}");
                        })
                );

        http.addFilterBefore(jwtAuthenticationTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
