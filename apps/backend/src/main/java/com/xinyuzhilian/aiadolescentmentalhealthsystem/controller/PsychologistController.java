package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistAppointment;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistMessage;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserFavoritePsychologist;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserFavoritePsychologistMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPsychologistMessageService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPsychologistScheduleService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPsychologistService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPsychologistAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 心理咨询师控制器
 * 提供心理咨询师的列表、详情、收藏等功能
 *
 * @author AI Developer
 * @since 2026-04-14
 */
@RestController
@RequestMapping("/psychologist")
@RequiredArgsConstructor
public class PsychologistController {

    private final IPsychologistService psychologistService;
    private final IPsychologistAppointmentService appointmentService;
    private final IPsychologistMessageService messageService;
    private final UserFavoritePsychologistMapper favoriteMapper;
    private final IPsychologistScheduleService scheduleService;

    /**
     * 获取心理咨询师列表（带筛选条件）
     */
    @GetMapping("/list")
    public Result<PageResult<Map<String, Object>>> getPsychologistList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String fieldIds,
            @RequestParam(required = false) String serviceTypes,
            @RequestParam(required = false) Integer sex,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String qualificationIds,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) String languages,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder,
            @CurrentUserId Long userId) {

        // 解析逗号分隔的ID列表
        List<Integer> fieldIdList = parseIdList(fieldIds);
        List<String> serviceTypeList = parseStringList(serviceTypes);
        List<Integer> qualificationIdList = parseIdList(qualificationIds);

        PageResult<Map<String, Object>> result = psychologistService.listPsychologists(
                page, size, keyword, fieldIdList, serviceTypeList, sex,
                minPrice, maxPrice, qualificationIdList, minRating, languages, sortBy, sortOrder, userId);

        return Result.success(result);
    }

    /**
     * 获取心理咨询师详情
     */
    @GetMapping("/{id}")
    public Result<Map<String, Object>> getPsychologistDetail(
            @PathVariable Long id,
            @CurrentUserId Long userId) {
        Map<String, Object> detail = psychologistService.getPsychologistDetail(id, userId);
        if (detail == null) {
            return Result.error("心理咨询师不存在");
        }
        return Result.success(detail);
    }

    /**
     * 收藏/取消收藏心理咨询师
     */
    @PostMapping("/favorite/{psychologistId}")
    public Result<String> toggleFavorite(
            @PathVariable Long psychologistId,
            @CurrentUserId Long userId) {

        // 检查是否已收藏
        var wrapper = new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<UserFavoritePsychologist>();
        wrapper.eq(UserFavoritePsychologist::getUserId, userId)
                .eq(UserFavoritePsychologist::getPsychologistId, psychologistId);

        UserFavoritePsychologist existing = favoriteMapper.selectOne(wrapper);

        if (existing != null) {
            // 取消收藏
            favoriteMapper.deleteById(existing.getId());
            return Result.success("已取消收藏");
        } else {
            // 添加收藏
            UserFavoritePsychologist favorite = new UserFavoritePsychologist();
            favorite.setUserId(userId);
            favorite.setPsychologistId(psychologistId);
            favorite.setCreateTime(LocalDateTime.now());
            favoriteMapper.insert(favorite);
            return Result.success("收藏成功");
        }
    }

    /**
     * 获取收藏列表
     */
    @GetMapping("/favorites")
    public Result<List<Map<String, Object>>> getFavorites(@CurrentUserId Long userId) {
        List<Map<String, Object>> favorites = psychologistService.getFavorites(userId);
        return Result.success(favorites);
    }

    /**
     * 获取咨询历史（咨询过的心理咨询师）
     */
    @GetMapping("/history")
    public Result<List<Map<String, Object>>> getConsultationHistory(@CurrentUserId Long userId) {
        List<Map<String, Object>> history = psychologistService.getConsultationHistory(userId);
        return Result.success(history);
    }

    /**
     * 获取心理咨询师排班
     */
    @GetMapping("/{id}/schedule")
    public Result<List<Map<String, Object>>> getSchedule(
            @PathVariable Long id,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        List<Map<String, Object>> schedules = scheduleService.getSchedulesByDate(id, start, end);
        return Result.success(schedules);
    }

    /**
     * 获取我的心理咨询预约列表
     */
    @GetMapping("/appointment/list")
    public Result<PageResult<Map<String, Object>>> getAppointmentList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer status,
            @CurrentUserId Long userId) {
        PageResult<Map<String, Object>> result = psychologistService.getUserAppointments(userId, page, size, status);
        return Result.success(result);
    }

    /**
     * 获取当前进行中的预约
     */
    @GetMapping("/appointments/current")
    public Result<List<Map<String, Object>>> getCurrentAppointments(@CurrentUserId Long userId) {
        List<Map<String, Object>> appointments = psychologistService.getCurrentAppointments(userId);
        return Result.success(appointments);
    }

    /**
     * 解析逗号分隔的ID列表
     */
    private List<Integer> parseIdList(String str) {
        if (str == null || str.trim().isEmpty()) {
            return null;
        }
        return java.util.Arrays.stream(str.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Integer::parseInt)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 解析逗号分隔的字符串列表
     */
    private List<String> parseStringList(String str) {
        if (str == null || str.trim().isEmpty()) {
            return null;
        }
        return java.util.Arrays.stream(str.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 获取聊天消息
     */
    @GetMapping("/messages/{appointmentId}")
    public Result<List<Map<String, Object>>> getMessages(
            @PathVariable Long appointmentId,
            @CurrentUserId Long userId) {
        List<PsychologistMessage> messages = messageService.getMessageHistory(appointmentId);
        List<Map<String, Object>> result = messages.stream().map(msg -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", msg.getId());
            map.put("content", msg.getContent());
            map.put("contentType", msg.getContentType());
            map.put("createTime", msg.getCreateTime());
            map.put("senderType", msg.getSenderId().equals(userId) ? "user" : "psychologist");
            return map;
        }).collect(Collectors.toList());
        return Result.success(result);
    }

    /**
     * 更新在线状态（手动切换：0-离线，1-在线，2-忙碌）
     * 注意：忙碌状态通常由系统自动设置，但心理师也可以手动设置
     */
    @PostMapping("/status")
    public Result<String> updateOnlineStatus(
            @RequestParam Integer status,
            @CurrentUserId Long userId) {
        if (status < 0 || status > 2) {
            return Result.error("无效的在线状态");
        }
        boolean success = psychologistService.updateOnlineStatus(userId, status);
        return success ? Result.success("状态更新成功") : Result.error("状态更新失败，用户不是心理咨询师");
    }

    /**
     * 发送聊天消息
     */
    @PostMapping("/messages/send")
    public Result<Map<String, Object>> sendMessage(
            @RequestBody Map<String, Object> request,
            @CurrentUserId Long userId) {
        try {
            Long appointmentId = Long.valueOf(request.get("appointmentId").toString());
            String content = request.get("content").toString();
            Integer contentType = request.containsKey("type") ?
                    ("image".equals(request.get("type")) ? 1 : 0) : 0;

            // 获取心理师ID（接收者）
            PsychologistAppointment appointment = appointmentService.getById(appointmentId);
            if (appointment == null) {
                return Result.error("预约不存在");
            }
            Long receiverId = appointment.getPsychologistId();

            PsychologistMessage message = messageService.sendMessage(
                    appointmentId, userId, receiverId, content, contentType);

            Map<String, Object> result = new HashMap<>();
            result.put("id", message.getId());
            result.put("content", message.getContent());
            result.put("contentType", message.getContentType());
            result.put("createTime", message.getCreateTime());
            result.put("senderType", "user");
            return Result.success(result);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
