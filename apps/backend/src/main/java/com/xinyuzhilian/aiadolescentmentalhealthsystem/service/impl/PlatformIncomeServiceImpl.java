package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PlatformIncome;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistAppointment;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Psychologist;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.PlatformIncomeMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.PsychologistAppointmentMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.PsychologistMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPlatformIncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 平台收入服务实现类
 */
@Service
@RequiredArgsConstructor
public class PlatformIncomeServiceImpl extends ServiceImpl<PlatformIncomeMapper, PlatformIncome>
        implements IPlatformIncomeService {

    private final PlatformIncomeMapper platformIncomeMapper;
    private final PsychologistAppointmentMapper appointmentMapper;
    private final PsychologistMapper psychologistMapper;

    @Override
    @Transactional
    public PlatformIncome generateConsultationIncome(Long appointmentId, Long psychologistId, Long userId,
                                                     BigDecimal orderFee, BigDecimal ratingScore) {
        BigDecimal commissionRate = getCommissionRate(ratingScore);
        BigDecimal commissionAmount = orderFee.multiply(commissionRate).setScale(2, RoundingMode.HALF_UP);

        PlatformIncome income = new PlatformIncome();
        income.setIncomeModule(PlatformIncome.MODULE_CONSULTATION);
        income.setOrderId(appointmentId);
        income.setPsychologistId(psychologistId);
        income.setUserId(userId);
        income.setOrderFee(orderFee);
        income.setCommissionRate(commissionRate);
        income.setCommissionAmount(commissionAmount);
        income.setRatingScore(ratingScore);
        income.setCreateTime(LocalDateTime.now());
        income.setUpdateTime(LocalDateTime.now());

        platformIncomeMapper.insert(income);
        return income;
    }

    @Override
    public Map<String, Object> getIncomeStats(String startDate, String endDate) {
        Map<String, Object> stats = new HashMap<>();

        // 构建日期过滤条件
        LambdaQueryWrapper<PlatformIncome> baseWrapper = buildDateWrapper(null, startDate, endDate);

        // ========== 总收入统计 ==========
        List<PlatformIncome> allRecords = platformIncomeMapper.selectList(baseWrapper);

        BigDecimal totalCommission = allRecords.stream()
                .map(PlatformIncome::getCommissionAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.put("totalPlatformCommission", totalCommission); // 平台总抽成（核心指标）

        // ========== 心理咨询模块 ==========
        LambdaQueryWrapper<PlatformIncome> consultWrapper = buildDateWrapper(
                PlatformIncome.MODULE_CONSULTATION, startDate, endDate);
        List<PlatformIncome> consultRecords = platformIncomeMapper.selectList(consultWrapper);

        BigDecimal consultationTotalFee = consultRecords.stream()
                .map(PlatformIncome::getOrderFee)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal consultationCommission = consultRecords.stream()
                .map(PlatformIncome::getCommissionAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long consultationCount = consultRecords.size();

        Map<String, Object> consultationStats = new HashMap<>();
        consultationStats.put("totalFee", consultationTotalFee);         // 咨询总流水
        consultationStats.put("platformCommission", consultationCommission); // 平台抽成
        consultationStats.put("orderCount", consultationCount);          // 订单数
        stats.put("consultation", consultationStats);

        // ========== 会员模块（预留） ==========
        Map<String, Object> memberStats = new HashMap<>();
        memberStats.put("totalFee", BigDecimal.ZERO);
        memberStats.put("platformCommission", BigDecimal.ZERO);
        memberStats.put("orderCount", 0);
        stats.put("member", memberStats);

        // ========== 本月数据 ==========
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        BigDecimal monthCommission = allRecords.stream()
                .filter(r -> r.getCreateTime() != null && r.getCreateTime().isAfter(monthStart))
                .map(PlatformIncome::getCommissionAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("monthCommission", monthCommission);

        return stats;
    }

    @Override
    public PageResult<Map<String, Object>> getConsultationIncomeList(
            Integer page, Integer size,
            Long psychologistId,
            BigDecimal minRating, BigDecimal maxRating,
            String startDate, String endDate) {

        Page<PlatformIncome> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<PlatformIncome> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PlatformIncome::getIncomeModule, PlatformIncome.MODULE_CONSULTATION);

        if (psychologistId != null) {
            wrapper.eq(PlatformIncome::getPsychologistId, psychologistId);
        }
        if (minRating != null) {
            wrapper.ge(PlatformIncome::getRatingScore, minRating);
        }
        if (maxRating != null) {
            wrapper.le(PlatformIncome::getRatingScore, maxRating);
        }

        // 日期范围
        if (StringUtils.hasText(startDate)) {
            wrapper.ge(PlatformIncome::getCreateTime, LocalDateTime.parse(startDate + " 00:00:00"));
        }
        if (StringUtils.hasText(endDate)) {
            wrapper.le(PlatformIncome::getCreateTime, LocalDateTime.parse(endDate + " 23:59:59"));
        }

        wrapper.orderByDesc(PlatformIncome::getCreateTime);
        Page<PlatformIncome> result = platformIncomeMapper.selectPage(pageParam, wrapper);

        // 组装数据（补全咨询师姓名、用户昵称）
        PageResult<Map<String, Object>> pageResult = new PageResult<>();
        pageResult.setRecords(result.getRecords().stream().map(income -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", income.getId());
            item.put("orderId", income.getOrderId());
            item.put("psychologistId", income.getPsychologistId());
            item.put("userId", income.getUserId());
            item.put("orderFee", income.getOrderFee());
            item.put("commissionRate", income.getCommissionRate());
            item.put("commissionAmount", income.getCommissionAmount());
            item.put("ratingScore", income.getRatingScore());
            item.put("createTime", income.getCreateTime());

            // 补全咨询师姓名
            if (income.getPsychologistId() != null) {
                Psychologist psychologist = psychologistMapper.selectById(income.getPsychologistId());
                if (psychologist != null) {
                    item.put("psychologistName", psychologist.getRealName());
                    item.put("psychologistAvatar", psychologist.getHeadPath());
                }
            }

            return item;
        }).collect(Collectors.toList()));
        pageResult.setTotal(result.getTotal());
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setPages(result.getPages());
        return pageResult;
    }

    @Override
    public Map<String, Object> getIncomeTrend(String startDate, String endDate, String module) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        LambdaQueryWrapper<PlatformIncome> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(module)) {
            wrapper.eq(PlatformIncome::getIncomeModule, module);
        }
        wrapper.ge(PlatformIncome::getCreateTime, start.atStartOfDay());
        wrapper.le(PlatformIncome::getCreateTime, end.atTime(LocalTime.MAX));

        List<PlatformIncome> records = platformIncomeMapper.selectList(wrapper);

        // 按日期分组
        Map<LocalDate, List<PlatformIncome>> byDate = records.stream()
                .collect(Collectors.groupingBy(r -> r.getCreateTime().toLocalDate()));

        List<String> dates = new ArrayList<>();
        List<BigDecimal> commissionData = new ArrayList<>();
        List<BigDecimal> consultationData = new ArrayList<>();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM-dd");
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            dates.add(d.format(fmt));
            List<PlatformIncome> dayRecords = byDate.getOrDefault(d, Collections.emptyList());

            BigDecimal dayCommission = dayRecords.stream()
                    .map(PlatformIncome::getCommissionAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            commissionData.add(dayCommission);

            BigDecimal dayOrder = dayRecords.stream()
                    .filter(r -> PlatformIncome.MODULE_CONSULTATION.equals(r.getIncomeModule()))
                    .map(PlatformIncome::getOrderFee)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            consultationData.add(dayOrder);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("dates", dates);
        result.put("commissionData", commissionData);
        result.put("consultationData", consultationData);
        return result;
    }

    @Override
    public BigDecimal getCommissionRate(BigDecimal ratingScore) {
        if (ratingScore == null) {
            ratingScore = BigDecimal.ZERO;
        }
        if (ratingScore.compareTo(new BigDecimal("1.5")) < 0) {
            return new BigDecimal("0.60");   // 抽成60%
        } else if (ratingScore.compareTo(new BigDecimal("3")) < 0) {
            return new BigDecimal("0.45");   // 抽成45%
        } else if (ratingScore.compareTo(new BigDecimal("4.5")) < 0) {
            return new BigDecimal("0.30");   // 抽成30%
        } else {
            return new BigDecimal("0.15");   // 抽成15%
        }
    }

    // ========== 私有方法 ==========

    private LambdaQueryWrapper<PlatformIncome> buildDateWrapper(String module, String startDate, String endDate) {
        LambdaQueryWrapper<PlatformIncome> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(module)) {
            wrapper.eq(PlatformIncome::getIncomeModule, module);
        }
        if (StringUtils.hasText(startDate)) {
            wrapper.ge(PlatformIncome::getCreateTime, LocalDateTime.parse(startDate + " 00:00:00"));
        }
        if (StringUtils.hasText(endDate)) {
            wrapper.le(PlatformIncome::getCreateTime, LocalDateTime.parse(endDate + " 23:59:59"));
        }
        return wrapper;
    }
}
