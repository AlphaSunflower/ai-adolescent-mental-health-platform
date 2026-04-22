package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPsychologistIncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 心理咨询师收入服务实现类
 *
 * @author AI Developer
 * @since 2026-04-14
 */
@Service
@RequiredArgsConstructor
public class PsychologistIncomeServiceImpl extends ServiceImpl<PsychologistIncomeMapper, PsychologistIncome>
        implements IPsychologistIncomeService {

    private final PsychologistIncomeMapper incomeMapper;
    private final PsychologistBalanceMapper balanceMapper;
    private final PsychologistWithdrawMapper withdrawMapper;
    private final PsychologistAppointmentMapper appointmentMapper;
    private final com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.PsychologistMapper psychologistMapper;

    @Override
    public BigDecimal calculateIncome(BigDecimal orderFee, BigDecimal ratingScore) {
        BigDecimal commissionRate = getCommissionRate(ratingScore);
        BigDecimal commissionAmount = orderFee.multiply(commissionRate);
        return orderFee.subtract(commissionAmount).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal getCommissionRate(BigDecimal ratingScore) {
        if (ratingScore == null) {
            ratingScore = BigDecimal.ZERO;
        }

        // 评分0-1.5：抽成60%
        if (ratingScore.compareTo(new BigDecimal("1.5")) < 0) {
            return new BigDecimal("0.60");
        }
        // 评分1.5-3：抽成45%
        else if (ratingScore.compareTo(new BigDecimal("3")) < 0) {
            return new BigDecimal("0.45");
        }
        // 评分3-4.5：抽成30%
        else if (ratingScore.compareTo(new BigDecimal("4.5")) < 0) {
            return new BigDecimal("0.30");
        }
        // 评分4.5-5：抽成15%
        else {
            return new BigDecimal("0.15");
        }
    }

    @Override
    @Transactional
    public PsychologistIncome addIncome(Long appointmentId, Long psychologistId, BigDecimal orderFee, BigDecimal ratingScore) {
        BigDecimal commissionRate = getCommissionRate(ratingScore);
        BigDecimal commissionAmount = orderFee.multiply(commissionRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal incomeAmount = orderFee.subtract(commissionAmount).setScale(2, RoundingMode.HALF_UP);

        // 创建收入记录
        PsychologistIncome income = new PsychologistIncome();
        income.setPsychologistId(psychologistId);
        income.setAppointmentId(appointmentId);
        income.setOrderFee(orderFee);
        income.setCommissionRate(commissionRate);
        income.setCommissionAmount(commissionAmount);
        income.setIncomeAmount(incomeAmount);
        income.setRatingScore(ratingScore);
        income.setCreateTime(LocalDateTime.now());
        incomeMapper.insert(income);

        // 更新余额
        PsychologistBalance balance = getOrCreateBalance(psychologistId);
        balance.setTotalIncome(balance.getTotalIncome().add(incomeAmount));
        balance.setBalance(balance.getBalance().add(incomeAmount));
        balance.setUpdateTime(LocalDateTime.now());
        balanceMapper.updateById(balance);

        return income;
    }

    @Override
    public Map<String, Object> getIncomeStats(Long psychologistId) {
        Map<String, Object> stats = new HashMap<>();

        // 获取余额
        PsychologistBalance balance = getOrCreateBalance(psychologistId);
        stats.put("totalIncome", balance.getTotalIncome());
        stats.put("totalWithdraw", balance.getTotalWithdraw());
        stats.put("availableBalance", balance.getBalance());
        stats.put("frozenAmount", balance.getFrozenAmount());

        // 获取心理咨询师的评分
        Psychologist psychologist = psychologistMapper.selectById(psychologistId);
        if (psychologist != null) {
            stats.put("averageRating", psychologist.getRatingScore());
        } else {
            stats.put("averageRating", BigDecimal.ZERO);
        }

        // 计算本月收入
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LambdaQueryWrapper<PsychologistIncome> incomeWrapper = new LambdaQueryWrapper<>();
        incomeWrapper.eq(PsychologistIncome::getPsychologistId, psychologistId)
                .ge(PsychologistIncome::getCreateTime, startOfMonth);
        List<PsychologistIncome> monthIncomes = incomeMapper.selectList(incomeWrapper);
        BigDecimal monthIncome = monthIncomes.stream()
                .map(PsychologistIncome::getIncomeAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("monthIncome", monthIncome);

        // 待结算金额（已完成但未评分的订单）
        LambdaQueryWrapper<PsychologistAppointment> apptWrapper = new LambdaQueryWrapper<>();
        apptWrapper.eq(PsychologistAppointment::getPsychologistId, psychologistId)
                .eq(PsychologistAppointment::getStatus, PsychologistAppointment.STATUS_COMPLETED)
                .eq(PsychologistAppointment::getIsRated, 0);
        List<PsychologistAppointment> unratedAppts = appointmentMapper.selectList(apptWrapper);
        BigDecimal pendingBalance = unratedAppts.stream()
                .map(PsychologistAppointment::getFee)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("pendingBalance", pendingBalance);

        // 统计订单数
        stats.put("totalOrders", monthIncomes.size());

        // 计算平均评分
        LambdaQueryWrapper<PsychologistAppointment> ratingWrapper = new LambdaQueryWrapper<>();
        ratingWrapper.eq(PsychologistAppointment::getPsychologistId, psychologistId)
                .eq(PsychologistAppointment::getIsRated, 1)
                .isNotNull(PsychologistAppointment::getRatingScore);
        List<PsychologistAppointment> ratedAppts = appointmentMapper.selectList(ratingWrapper);
        if (!ratedAppts.isEmpty()) {
            BigDecimal avgRating = ratedAppts.stream()
                    .map(PsychologistAppointment::getRatingScore)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(new BigDecimal(ratedAppts.size()), 2, RoundingMode.HALF_UP);
            stats.put("averageRating", avgRating);
        } else {
            stats.put("averageRating", BigDecimal.ZERO);
        }

        return stats;
    }

    @Override
    public PsychologistBalance getBalance(Long psychologistId) {
        return getOrCreateBalance(psychologistId);
    }

    @Override
    @Transactional
    public PsychologistBalance initBalance(Long psychologistId) {
        return getOrCreateBalance(psychologistId);
    }

    @Override
    @Transactional
    public String applyWithdraw(Long psychologistId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return "提现金额必须大于0";
        }

        PsychologistBalance balance = getOrCreateBalance(psychologistId);
        if (balance.getBalance().compareTo(amount) < 0) {
            return "余额不足";
        }

        // 创建提现记录
        PsychologistWithdraw withdraw = new PsychologistWithdraw();
        withdraw.setPsychologistId(psychologistId);
        withdraw.setAmount(amount);
        withdraw.setStatus(PsychologistWithdraw.STATUS_PROCESSING);
        withdraw.setCreateTime(LocalDateTime.now());
        withdrawMapper.insert(withdraw);

        // 扣减余额
        balance.setBalance(balance.getBalance().subtract(amount));
        balance.setUpdateTime(LocalDateTime.now());
        balanceMapper.updateById(balance);

        // 虚拟提现：直接标记为成功
        withdraw.setStatus(PsychologistWithdraw.STATUS_SUCCESS);
        withdraw.setProcessTime(LocalDateTime.now());
        withdraw.setRemark("虚拟提现");
        withdrawMapper.updateById(withdraw);

        // 更新累计提现
        balance.setTotalWithdraw(balance.getTotalWithdraw().add(amount));
        balanceMapper.updateById(balance);

        return "提现成功";
    }

    @Override
    public PageResult<Map<String, Object>> getIncomeDetails(Integer page, Integer size, Long psychologistId) {
        Page<PsychologistIncome> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<PsychologistIncome> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PsychologistIncome::getPsychologistId, psychologistId)
                .orderByDesc(PsychologistIncome::getCreateTime);

        Page<PsychologistIncome> result = incomeMapper.selectPage(pageParam, wrapper);

        PageResult<Map<String, Object>> pageResult = new PageResult<>();
        pageResult.setRecords(result.getRecords().stream().map(income -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", income.getId());
            item.put("orderFee", income.getOrderFee());
            item.put("commissionRate", income.getCommissionRate());
            item.put("commissionAmount", income.getCommissionAmount());
            item.put("incomeAmount", income.getIncomeAmount());
            item.put("ratingScore", income.getRatingScore());
            item.put("createTime", income.getCreateTime());
            return item;
        }).collect(java.util.stream.Collectors.toList()));
        pageResult.setTotal(result.getTotal());
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setPages(result.getPages());
        return pageResult;
    }

    @Override
    public PageResult<Map<String, Object>> getWithdrawList(Integer page, Integer size, Long psychologistId) {
        Page<PsychologistWithdraw> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<PsychologistWithdraw> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PsychologistWithdraw::getPsychologistId, psychologistId)
                .orderByDesc(PsychologistWithdraw::getCreateTime);

        Page<PsychologistWithdraw> result = withdrawMapper.selectPage(pageParam, wrapper);

        PageResult<Map<String, Object>> pageResult = new PageResult<>();
        pageResult.setRecords(result.getRecords().stream().map(withdraw -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", withdraw.getId());
            item.put("amount", withdraw.getAmount());
            item.put("status", withdraw.getStatus());
            item.put("statusText", getWithdrawStatusText(withdraw.getStatus()));
            item.put("remark", withdraw.getRemark());
            item.put("createTime", withdraw.getCreateTime());
            item.put("processTime", withdraw.getProcessTime());
            return item;
        }).collect(java.util.stream.Collectors.toList()));
        pageResult.setTotal(result.getTotal());
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setPages(result.getPages());
        return pageResult;
    }

    @Override
    @Transactional
    public String processWithdraw(Long withdrawId, Boolean passed, String remark) {
        PsychologistWithdraw withdraw = withdrawMapper.selectById(withdrawId);
        if (withdraw == null) {
            return "提现记录不存在";
        }
        if (!withdraw.getStatus().equals(PsychologistWithdraw.STATUS_PROCESSING)) {
            return "提现状态不允许此操作";
        }

        if (passed) {
            withdraw.setStatus(PsychologistWithdraw.STATUS_SUCCESS);
        } else {
            // 拒绝时返还余额
            withdraw.setStatus(PsychologistWithdraw.STATUS_REJECTED);

            PsychologistBalance balance = getOrCreateBalance(withdraw.getPsychologistId());
            balance.setBalance(balance.getBalance().add(withdraw.getAmount()));
            balance.setTotalWithdraw(balance.getTotalWithdraw().subtract(withdraw.getAmount()));
            balance.setUpdateTime(LocalDateTime.now());
            balanceMapper.updateById(balance);
        }

        withdraw.setProcessTime(LocalDateTime.now());
        withdraw.setRemark(remark);
        withdrawMapper.updateById(withdraw);

        return passed ? "提现已通过" : "提现已拒绝";
    }

    @Override
    public Map<String, Object> getPlatformIncomeStats() {
        Map<String, Object> stats = new HashMap<>();

        // 计算平台总收入（所有订单金额）
        List<PsychologistIncome> allIncomes = incomeMapper.selectList(null);
        BigDecimal totalIncome = allIncomes.stream()
                .map(PsychologistIncome::getOrderFee)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalIncome", totalIncome);

        // 计算平台抽成（所有抽成金额）
        BigDecimal totalCommission = allIncomes.stream()
                .map(PsychologistIncome::getCommissionAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("platformCommission", totalCommission);

        // 咨询师总收入
        BigDecimal psychologistIncome = allIncomes.stream()
                .map(PsychologistIncome::getIncomeAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("psychologistIncome", psychologistIncome);

        // 本月收入
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        BigDecimal monthCommission = allIncomes.stream()
                .filter(i -> i.getCreateTime() != null && i.getCreateTime().isAfter(startOfMonth))
                .map(PsychologistIncome::getCommissionAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("monthCommission", monthCommission);

        // 心理咨询师数量
        stats.put("psychologistCount", incomeMapper.selectCount(null));

        // 订单数量（完成的订单）
        LambdaQueryWrapper<PsychologistAppointment> apptWrapper = new LambdaQueryWrapper<>();
        apptWrapper.eq(PsychologistAppointment::getStatus, PsychologistAppointment.STATUS_COMPLETED);
        long completedOrders = appointmentMapper.selectCount(apptWrapper);
        stats.put("totalOrders", completedOrders);
        stats.put("orderCount", completedOrders);

        return stats;
    }

    @Override
    public PageResult<Map<String, Object>> getAdminIncomeList(Integer page, Integer size, Long psychologistId, String startDate, String endDate) {
        Page<PsychologistIncome> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<PsychologistIncome> wrapper = new LambdaQueryWrapper<>();
        if (psychologistId != null) {
            wrapper.eq(PsychologistIncome::getPsychologistId, psychologistId);
        }
        wrapper.orderByDesc(PsychologistIncome::getCreateTime);

        Page<PsychologistIncome> result = incomeMapper.selectPage(pageParam, wrapper);

        PageResult<Map<String, Object>> pageResult = new PageResult<>();
        pageResult.setRecords(result.getRecords().stream().map(income -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", income.getId());
            item.put("psychologistId", income.getPsychologistId());
            item.put("orderFee", income.getOrderFee());
            item.put("commissionRate", income.getCommissionRate());
            item.put("commissionAmount", income.getCommissionAmount());
            item.put("incomeAmount", income.getIncomeAmount());
            item.put("ratingScore", income.getRatingScore());
            item.put("createTime", income.getCreateTime());
            return item;
        }).collect(java.util.stream.Collectors.toList()));
        pageResult.setTotal(result.getTotal());
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setPages(result.getPages());
        return pageResult;
    }

    @Override
    public PageResult<Map<String, Object>> getBalanceList(Integer page, Integer size) {
        Page<PsychologistBalance> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<PsychologistBalance> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(PsychologistBalance::getUpdateTime);

        Page<PsychologistBalance> result = balanceMapper.selectPage(pageParam, wrapper);

        PageResult<Map<String, Object>> pageResult = new PageResult<>();
        pageResult.setRecords(result.getRecords().stream().map(balance -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", balance.getId());
            item.put("psychologistId", balance.getPsychologistId());
            item.put("totalIncome", balance.getTotalIncome());
            item.put("totalWithdraw", balance.getTotalWithdraw());
            item.put("balance", balance.getBalance());
            item.put("updateTime", balance.getUpdateTime());
            return item;
        }).collect(java.util.stream.Collectors.toList()));
        pageResult.setTotal(result.getTotal());
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setPages(result.getPages());
        return pageResult;
    }

    @Override
    public PageResult<Map<String, Object>> getAdminWithdrawList(Integer page, Integer size, Integer status) {
        Page<PsychologistWithdraw> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<PsychologistWithdraw> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(PsychologistWithdraw::getStatus, status);
        }
        wrapper.orderByDesc(PsychologistWithdraw::getCreateTime);

        Page<PsychologistWithdraw> result = withdrawMapper.selectPage(pageParam, wrapper);

        PageResult<Map<String, Object>> pageResult = new PageResult<>();
        pageResult.setRecords(result.getRecords().stream().map(withdraw -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", withdraw.getId());
            item.put("psychologistId", withdraw.getPsychologistId());
            item.put("amount", withdraw.getAmount());
            item.put("status", withdraw.getStatus());
            item.put("statusText", getWithdrawStatusText(withdraw.getStatus()));
            item.put("bankName", withdraw.getBankName());
            item.put("bankAccount", withdraw.getBankAccount());
            item.put("accountName", withdraw.getAccountName());
            item.put("remark", withdraw.getRemark());
            item.put("createTime", withdraw.getCreateTime());
            item.put("processTime", withdraw.getProcessTime());
            item.put("auditTime", withdraw.getProcessTime());
            return item;
        }).collect(java.util.stream.Collectors.toList()));
        pageResult.setTotal(result.getTotal());
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setPages(result.getPages());
        return pageResult;
    }

    @Override
    public List<Map<String, Object>> getIncomeTrend(Long psychologistId, Integer days) {
        if (days == null || days <= 0) {
            days = 7;
        }
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);

        // 查询指定日期范围内的所有收入记录
        LambdaQueryWrapper<PsychologistIncome> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PsychologistIncome::getPsychologistId, psychologistId)
                .ge(PsychologistIncome::getCreateTime, startDate)
                .le(PsychologistIncome::getCreateTime, endDate);

        List<PsychologistIncome> incomes = incomeMapper.selectList(wrapper);

        // 按日期分组统计
        Map<String, BigDecimal> dailyIncome = new LinkedHashMap<>();
        Map<String, Integer> dailyCount = new LinkedHashMap<>();

        // 初始化所有日期
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = endDate.toLocalDate().minusDays(i);
            String dateStr = date.toString();
            dailyIncome.put(dateStr, BigDecimal.ZERO);
            dailyCount.put(dateStr, 0);
        }

        // 累加每日收入
        for (PsychologistIncome income : incomes) {
            if (income.getCreateTime() != null) {
                String dateStr = income.getCreateTime().toLocalDate().toString();
                if (dailyIncome.containsKey(dateStr)) {
                    dailyIncome.put(dateStr, dailyIncome.get(dateStr).add(income.getIncomeAmount()));
                    dailyCount.put(dateStr, dailyCount.get(dateStr) + 1);
                }
            }
        }

        // 转换为列表
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : dailyIncome.entrySet()) {
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", entry.getKey());
            dayData.put("income", entry.getValue());
            dayData.put("count", dailyCount.get(entry.getKey()));
            result.add(dayData);
        }

        return result;
    }

    // ==================== 私有方法 ====================

    /**
     * 获取或创建余额记录
     */
    private PsychologistBalance getOrCreateBalance(Long psychologistId) {
        LambdaQueryWrapper<PsychologistBalance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PsychologistBalance::getPsychologistId, psychologistId);
        PsychologistBalance balance = balanceMapper.selectOne(wrapper);

        if (balance == null) {
            balance = new PsychologistBalance();
            balance.setPsychologistId(psychologistId);
            balance.setTotalIncome(BigDecimal.ZERO);
            balance.setTotalWithdraw(BigDecimal.ZERO);
            balance.setBalance(BigDecimal.ZERO);
            balance.setFrozenAmount(BigDecimal.ZERO);
            balance.setCreateTime(LocalDateTime.now());
            balance.setUpdateTime(LocalDateTime.now());
            balanceMapper.insert(balance);
        }

        return balance;
    }

    /**
     * 获取提现状态文本
     */
    private String getWithdrawStatusText(Integer status) {
        if (status == null) return "未知";
        switch (status) {
            case 0: return "处理中";
            case 1: return "已提现";
            case 2: return "已拒绝";
            default: return "未知";
        }
    }
}
