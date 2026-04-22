package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.InspirationalQuote;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.InspirationalQuoteMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IInspirationalQuoteService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InspirationalQuoteServiceImpl extends ServiceImpl<InspirationalQuoteMapper, InspirationalQuote> implements IInspirationalQuoteService {

    @Override
    public List<InspirationalQuote> getDailyQuote() {
        // Simple implementation: random quote
        List<InspirationalQuote> list = list().stream().toList();
        return list;
    }
}
