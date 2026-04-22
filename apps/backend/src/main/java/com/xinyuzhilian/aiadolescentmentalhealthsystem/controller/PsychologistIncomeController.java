package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistBalance;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPsychologistIncomeService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPsychologistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 心理咨询师收入控制器
 *
 * @author AI Developer
 * @since 2026-04-14
 */
@RestController
@RequestMapping("/psychologist/income")
@RequiredArgsConstructor
public class PsychologistIncomeController {

    private final IPsychologistIncomeService incomeService;
    private final IPsychologistService psychologistService;

    /**
     * 获取收入统计
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getIncomeStats(@CurrentUserId Long userId) {
        Long psychologistId = psychologistService.getPsychologistIdByUserId(userId);
        if (psychologistId == null) {
            return Result.error("您还不是心理咨询师");
        }
        Map<String, Object> stats = incomeService.getIncomeStats(psychologistId);
        return Result.success(stats);
    }

    /**
     * 获取余额
     */
    @GetMapping("/balance")
    public Result<PsychologistBalance> getBalance(@CurrentUserId Long userId) {
        Long psychologistId = psychologistService.getPsychologistIdByUserId(userId);
        if (psychologistId == null) {
            return Result.error("您还不是心理咨询师");
        }
        PsychologistBalance balance = incomeService.getBalance(psychologistId);
        return Result.success(balance);
    }

    /**
     * 申请提现
     */
    @PostMapping("/withdraw")
    public Result<String> applyWithdraw(
            @RequestParam BigDecimal amount,
            @CurrentUserId Long userId) {
        Long psychologistId = psychologistService.getPsychologistIdByUserId(userId);
        if (psychologistId == null) {
            return Result.error("您还不是心理咨询师");
        }
        try {
            String result = incomeService.applyWithdraw(psychologistId, amount);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取收入明细
     */
    @GetMapping("/details")
    public Result<PageResult<Map<String, Object>>> getIncomeDetails(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @CurrentUserId Long userId) {
        Long psychologistId = psychologistService.getPsychologistIdByUserId(userId);
        if (psychologistId == null) {
            return Result.error("您还不是心理咨询师");
        }
        PageResult<Map<String, Object>> result = incomeService.getIncomeDetails(page, size, psychologistId);
        return Result.success(result);
    }

    /**
     * 获取提现记录
     */
    @GetMapping("/withdraw/list")
    public Result<PageResult<Map<String, Object>>> getWithdrawList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @CurrentUserId Long userId) {
        Long psychologistId = psychologistService.getPsychologistIdByUserId(userId);
        if (psychologistId == null) {
            return Result.error("您还不是心理咨询师");
        }
        PageResult<Map<String, Object>> result = incomeService.getWithdrawList(page, size, psychologistId);
        return Result.success(result);
    }

    /**
     * 获取收入趋势
     */
    @GetMapping("/trend")
    public Result<List<Map<String, Object>>> getIncomeTrend(
            @RequestParam(defaultValue = "7") Integer days,
            @CurrentUserId Long userId) {
        Long psychologistId = psychologistService.getPsychologistIdByUserId(userId);
        if (psychologistId == null) {
            return Result.error("您还不是心理咨询师");
        }
        List<Map<String, Object>> trend = incomeService.getIncomeTrend(psychologistId, days);
        return Result.success(trend);
    }
}
