package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistBalance;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistIncome;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistWithdraw;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 心理咨询师收入服务接口
 * 提供收入计算、提现等功能
 *
 * @author AI Developer
 * @since 2026-04-14
 */
public interface IPsychologistIncomeService extends IService<PsychologistIncome> {

    /**
     * 根据评分计算收入
     * 评分0-1.5：抽成60%，收入40%
     * 评分1.5-3：抽成45%，收入55%
     * 评分3-4.5：抽成30%，收入70%
     * 评分4.5-5：抽成15%，收入85%
     *
     * @param orderFee 订单金额
     * @param ratingScore 用户评分
     * @return 实际收入金额
     */
    BigDecimal calculateIncome(BigDecimal orderFee, BigDecimal ratingScore);

    /**
     * 获取抽成比例
     *
     * @param ratingScore 评分
     * @return 抽成比例
     */
    BigDecimal getCommissionRate(BigDecimal ratingScore);

    /**
     * 添加收入记录
     *
     * @param appointmentId 预约ID
     * @param psychologistId 心理咨询师ID
     * @param orderFee 订单金额
     * @param ratingScore 评分
     * @return 收入记录
     */
    PsychologistIncome addIncome(Long appointmentId, Long psychologistId, BigDecimal orderFee, BigDecimal ratingScore);

    /**
     * 获取心理咨询师收入统计
     *
     * @param psychologistId 心理咨询师ID
     * @return 收入统计信息
     */
    Map<String, Object> getIncomeStats(Long psychologistId);

    /**
     * 获取心理咨询师余额
     *
     * @param psychologistId 心理咨询师ID
     * @return 余额信息
     */
    PsychologistBalance getBalance(Long psychologistId);

    /**
     * 初始化心理咨询师余额
     *
     * @param psychologistId 心理咨询师ID
     * @return 余额记录
     */
    PsychologistBalance initBalance(Long psychologistId);

    /**
     * 申请提现
     *
     * @param psychologistId 心理咨询师ID
     * @param amount 提现金额
     * @return 操作结果
     */
    String applyWithdraw(Long psychologistId, BigDecimal amount);

    /**
     * 获取收入明细列表
     *
     * @param page 页码
     * @param size 每页大小
     * @param psychologistId 心理咨询师ID
     * @return 分页结果
     */
    PageResult<Map<String, Object>> getIncomeDetails(Integer page, Integer size, Long psychologistId);

    /**
     * 获取提现记录列表
     *
     * @param page 页码
     * @param size 每页大小
     * @param psychologistId 心理咨询师ID
     * @return 分页结果
     */
    PageResult<Map<String, Object>> getWithdrawList(Integer page, Integer size, Long psychologistId);

    /**
     * 处理提现（管理员操作）
     *
     * @param withdrawId 提现记录ID
     * @param passed 是否通过
     * @param remark 备注
     * @return 操作结果
     */
    String processWithdraw(Long withdrawId, Boolean passed, String remark);

    /**
     * 获取平台收入统计
     *
     * @return 平台收入统计
     */
    Map<String, Object> getPlatformIncomeStats();

    /**
     * 获取管理端咨询师收入明细列表
     */
    PageResult<Map<String, Object>> getAdminIncomeList(Integer page, Integer size, Long psychologistId, String startDate, String endDate);

    /**
     * 获取管理端咨询师余额列表
     */
    PageResult<Map<String, Object>> getBalanceList(Integer page, Integer size);

    /**
     * 获取管理端提现列表
     */
    PageResult<Map<String, Object>> getAdminWithdrawList(Integer page, Integer size, Integer status);

    /**
     * 获取收入趋势（最近N天每日收入）
     *
     * @param psychologistId 心理咨询师ID
     * @param days 天数（默认7天）
     * @return 每日收入列表
     */
    List<Map<String, Object>> getIncomeTrend(Long psychologistId, Integer days);
}
