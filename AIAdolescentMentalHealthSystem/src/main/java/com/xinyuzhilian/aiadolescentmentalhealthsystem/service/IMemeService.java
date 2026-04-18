package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Meme;

import java.util.Map;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author 魏辰益
 * @since 2026-03-18
 */
public interface IMemeService extends IService<Meme> {

    PageResult<Meme> getMemes(Integer page, Integer size, String memeName);
    
    /**
     * 加载所有 meme 数据到缓存
     */
    void loadCache();
    
    /**
     * 根据 ID 获取 meme
     * @param id meme ID
     * @return meme 内容
     */
    String getMemeById(Long id);
    
    /**
     * 刷新缓存
     */
    void refreshCache();

    java.util.List<java.util.List<java.util.Map<String,Object>>> recognizeMemesBatch(java.util.List<String> texts);
    java.util.List<java.util.Map<String,Object>> recognizeMemes(String text);
}
