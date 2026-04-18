package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PlatformIncome;

import java.math.BigDecimal;
import java.util.Map;

/**
 * 平台收入服务接口
 * 统一管理平台各模块的收入来源，支持可拓展
 */
public interface IPlatformIncomeService extends IService<PlatformIncome> {

    /**
     * 生成心理咨询收入记录（用户评分后调用）
     *
     * @param appointmentId 预约ID
     * @param psychologistId 心理咨询师ID
     * @param userId 用户ID
     * @param orderFee 订单金额
     * @param ratingScore 用户评分
     * @return 收入记录
     */
    PlatformIncome generateConsultationIncome(Long appointmentId, Long psychologistId, Long userId,
                                             BigDecimal orderFee, BigDecimal ratingScore);

    /**
     * 获取平台收入统计（分模块）
     *
     * @param startDate 起始日期（可选）
     * @param endDate 结束日期（可选）
     * @return 各模块收入统计
     */
    Map<String, Object> getIncomeStats(String startDate, String endDate);

    /**
     * 获取心理咨询模块收入明细
     *
     * @param page 页码
     * @param size 每页大小
     * @param psychologistId 咨询师ID（可选）
     * @param minRating 最低评分（可选）
     * @param maxRating 最高评分（可选）
     * @param startDate 起始日期（可选）
     * @param endDate 结束日期（可选）
     * @return 分页结果
     */
    PageResult<Map<String, Object>> getConsultationIncomeList(
            Integer page, Integer size,
            Long psychologistId,
            BigDecimal minRating, BigDecimal maxRating,
            String startDate, String endDate);

    /**
     * 获取指定日期范围内的每日收入趋势
     *
     * @param startDate 起始日期
     * @param endDate 结束日期
     * @param module 收入模块（可选，为空则所有模块）
     * @return 每日收入数据
     */
    Map<String, Object> getIncomeTrend(String startDate, String endDate, String module);

    /**
     * 根据评分获取抽成比例
     *
     * @param ratingScore 评分
     * @return 抽成比例
     */
    BigDecimal getCommissionRate(BigDecimal ratingScore);
}
