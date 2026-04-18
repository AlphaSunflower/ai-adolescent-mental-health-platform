package com.xinyuzhilian.aiadolescentmentalhealthsystem.resolver;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUser;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.LoginUser;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * 解析 @CurrentUser 注解，自动注入当前登录用户的 User 对象
 */
public class CurrentUserResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class) && parameter.getParameterType().equals(User.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer, NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof LoginUser) {
            LoginUser loginUser = (LoginUser) authentication.getPrincipal();
            return loginUser.getUser();
        }
        return null;
    }
}