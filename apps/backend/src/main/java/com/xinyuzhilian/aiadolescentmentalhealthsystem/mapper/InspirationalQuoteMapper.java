package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.InspirationalQuote;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface InspirationalQuoteMapper extends BaseMapper<InspirationalQuote> {
    @Select("SELECT * FROM inspirational_quote ORDER BY RAND() LIMIT 1")
    InspirationalQuote getRandomQuote();
}
