package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.InspirationalQuote;

import java.util.List;

public interface IInspirationalQuoteService extends IService<InspirationalQuote> {
    List<InspirationalQuote> getDailyQuote();

}
