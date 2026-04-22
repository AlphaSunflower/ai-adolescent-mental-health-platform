package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Meme;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.MemeMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IMemeService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author 魏辰益
 * @since 2026-03-18
 */
@Service
@Slf4j
public class MemeServiceImpl extends ServiceImpl<MemeMapper, Meme> implements IMemeService {

    private static final Map<Long, String> MEME_CACHE = new ConcurrentHashMap<>();

    @Override
    public PageResult<Meme> getMemes(Integer page, Integer size, String memeName) {
        Page<Meme> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Meme> wrapper = new LambdaQueryWrapper<>();
        if (memeName == null){
            wrapper.like(Meme::getMeme, "");
        }else {
            wrapper.like(Meme::getMeme, memeName);
        }
        wrapper.orderByAsc(Meme::getId);
        
        Page<Meme> result = this.page(pageParam, wrapper);
        
        return PageResult.build(result);
    }

    @PostConstruct
    @Override
    public void loadCache() {
        log.info("开始加载 Meme 缓存...");
        List<Meme> allMemes = this.list();
        MEME_CACHE.clear();
        for (Meme meme : allMemes) {
            MEME_CACHE.put(meme.getId(), meme.getMeme());
        }
        log.info("Meme 缓存加载完成，共加载 {} 条记录", MEME_CACHE.size());
    }

    @Override
    public void refreshCache() {
        log.info("刷新 Meme 缓存...");
        loadCache();
    }

    @Override
    public String getMemeById(Long id) {
        return MEME_CACHE.get(id);
    }

    @Override
    public java.util.List<java.util.Map<String,Object>> recognizeMemes(String text) {
        java.util.List<java.util.Map<String,Object>> matches = new java.util.ArrayList<>();
        if (text == null || text.isEmpty()) return matches;
        String lower = text.toLowerCase();
        for (Map.Entry<Long, String> e : MEME_CACHE.entrySet()) {
            String meme = e.getValue();
            if (meme == null) continue;
            if (lower.contains(meme.toLowerCase())) {
                java.util.Map<String,Object> m = new java.util.HashMap<>();
                m.put("id", e.getKey());
                m.put("meme", meme);
                matches.add(m);
            }
        }
        return matches;
    }

    @Override
    public java.util.List<java.util.List<java.util.Map<String,Object>>> recognizeMemesBatch(java.util.List<String> texts) {
        java.util.List<java.util.List<java.util.Map<String,Object>>> result = new java.util.ArrayList<>();
        if (texts == null) return result;
        for (String t : texts) {
            result.add(recognizeMemes(t));
        }
        return result;
    }
}
