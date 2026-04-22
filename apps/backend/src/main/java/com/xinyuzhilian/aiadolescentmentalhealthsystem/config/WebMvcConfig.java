package com.xinyuzhilian.aiadolescentmentalhealthsystem.config;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.resolver.CurrentUserIdResolver;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.resolver.CurrentUserResolver;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * 注册自定义的参数解析器
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new CurrentUserIdResolver());
        resolvers.add(new CurrentUserResolver());
    }
}