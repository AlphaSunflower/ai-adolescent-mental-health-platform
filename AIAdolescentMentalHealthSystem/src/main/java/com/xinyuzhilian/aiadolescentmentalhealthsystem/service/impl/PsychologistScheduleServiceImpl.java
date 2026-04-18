package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistAppointment;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistSchedule;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.PsychologistAppointmentMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.PsychologistScheduleMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPsychologistScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 心理咨询师排班服务实现类
 *
 * @author AI Developer
 * @since 2026-04-14
 */
@Service
@RequiredArgsConstructor
public class PsychologistScheduleServiceImpl extends ServiceImpl<PsychologistScheduleMapper, PsychologistSchedule>
        implements IPsychologistScheduleService {

    private final PsychologistScheduleMapper scheduleMapper;
    private final PsychologistAppointmentMapper appointmentMapper;

    @Override
    public List<PsychologistSchedule> getSchedules(Long psychologistId, LocalDate startDate, LocalDate endDate) {
        return scheduleMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PsychologistSchedule>()
                        .eq(PsychologistSchedule::getPsychologistId, psychologistId)
                        .ge(PsychologistSchedule::getScheduleDate, startDate)
                        .le(PsychologistSchedule::getScheduleDate, endDate)
                        .orderByAsc(PsychologistSchedule::getScheduleDate)
                        .orderByAsc(PsychologistSchedule::getTimeSlot)
        );
    }

    @Override
    public List<Map<String, Object>> getAvailableSchedules(LocalDate startDate, LocalDate endDate) {
        // 查询所有可预约的排班（状态为1且未约满）
        List<PsychologistSchedule> schedules = scheduleMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PsychologistSchedule>()
                        .ge(PsychologistSchedule::getScheduleDate, startDate)
                        .le(PsychologistSchedule::getScheduleDate, endDate)
                        .eq(PsychologistSchedule::getStatus, PsychologistSchedule.STATUS_AVAILABLE)
        );

        // 过滤未约满的
        schedules = schedules.stream()
                .filter(s -> s.getBookedCount() < s.getMaxAppointments())
                .collect(Collectors.toList());

        // 按日期分组
        Map<LocalDate, List<PsychologistSchedule>> grouped = schedules.stream()
                .collect(Collectors.groupingBy(PsychologistSchedule::getScheduleDate));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<LocalDate, List<PsychologistSchedule>> entry : grouped.entrySet()) {
            Map<String, Object> daySchedule = new HashMap<>();
            daySchedule.put("date", entry.getKey());
            daySchedule.put("dayOfWeek", getDayOfWeekText(entry.getKey().getDayOfWeek()));
            daySchedule.put("slots", entry.getValue());
            result.add(daySchedule);
        }

        result.sort(Comparator.comparing(m -> (LocalDate) m.get("date")));
        return result;
    }

    @Override
    public List<Map<String, Object>> getSchedulesByDate(Long psychologistId, LocalDate startDate, LocalDate endDate) {
        List<PsychologistSchedule> schedules = getSchedules(psychologistId, startDate, endDate);

        // 按日期分组
        Map<LocalDate, List<PsychologistSchedule>> grouped = schedules.stream()
                .collect(Collectors.groupingBy(PsychologistSchedule::getScheduleDate));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<LocalDate, List<PsychologistSchedule>> entry : grouped.entrySet()) {
            Map<String, Object> daySchedule = new HashMap<>();
            daySchedule.put("date", entry.getKey());
            daySchedule.put("dayOfWeek", getDayOfWeekText(entry.getKey().getDayOfWeek()));
            daySchedule.put("slots", entry.getValue());
            result.add(daySchedule);
        }

        return result;
    }

    @Override
    @Transactional
    public String saveSchedule(PsychologistSchedule schedule, Long psychologistId) {
        LocalDate today = LocalDate.now();
        // 当天不可修改
        if (!schedule.getScheduleDate().isAfter(today)) {
            return "过去及当天的排班无法修改";
        }
        // 仅允许设置近两个月内的排班
        LocalDate twoMonthsLater = today.plusDays(60);
        if (schedule.getScheduleDate().isAfter(twoMonthsLater)) {
            return "仅支持设置近两个月的排班";
        }
        if (schedule.getMaxAppointments() != null && (schedule.getMaxAppointments() < 0 || schedule.getMaxAppointments() > 5)) {
            return "最大预约人数必须在0-5之间";
        }

        schedule.setPsychologistId(psychologistId);
        schedule.setUpdateTime(LocalDateTime.now());

        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PsychologistSchedule> wrapper =
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        wrapper.eq(PsychologistSchedule::getPsychologistId, psychologistId)
                .eq(PsychologistSchedule::getScheduleDate, schedule.getScheduleDate())
                .eq(PsychologistSchedule::getTimeSlot, schedule.getTimeSlot());

        PsychologistSchedule existing = scheduleMapper.selectOne(wrapper);
        if (existing != null) {
            schedule.setId(existing.getId());
            schedule.setCreateTime(existing.getCreateTime());
            scheduleMapper.updateById(schedule);
        } else {
            schedule.setCreateTime(LocalDateTime.now());
            scheduleMapper.insert(schedule);
        }

        return "保存成功";
    }

    @Override
    @Transactional
    public String saveSchedules(List<PsychologistSchedule> schedules, Long psychologistId) {
        if (CollectionUtils.isEmpty(schedules)) {
            return "排班列表为空";
        }

        LocalDate today = LocalDate.now();
        LocalDate twoMonthsLater = today.plusDays(60);

        for (PsychologistSchedule schedule : schedules) {
            if (!schedule.getScheduleDate().isAfter(today)) {
                return "过去及当天的排班无法修改";
            }
            if (schedule.getScheduleDate().isAfter(twoMonthsLater)) {
                return "仅支持设置近两个月的排班";
            }
        }

        for (PsychologistSchedule schedule : schedules) {
            saveSchedule(schedule, psychologistId);
        }

        return "批量保存成功";
    }

    @Override
    @Transactional
    public String deleteSchedule(Long scheduleId, Long psychologistId) {
        PsychologistSchedule schedule = scheduleMapper.selectById(scheduleId);
        if (schedule == null) {
            return "排班不存在";
        }
        if (!schedule.getPsychologistId().equals(psychologistId)) {
            return "无权操作";
        }

        // 检查是否已有预约
        if (schedule.getBookedCount() != null && schedule.getBookedCount() > 0) {
            return "该时段已有预约，无法删除";
        }

        // 检查日期限制
        LocalDate today = LocalDate.now();
        LocalDate oneWeekLater = today.plusDays(7);
        if (schedule.getScheduleDate().isBefore(oneWeekLater)) {
            return "近一周内的排班无法删除";
        }

        scheduleMapper.deleteById(scheduleId);
        return "删除成功";
    }

    @Override
    @Transactional
    public void updateBookedCount(Long scheduleId, Integer increment) {
        PsychologistSchedule schedule = scheduleMapper.selectById(scheduleId);
        if (schedule != null) {
            int newCount = schedule.getBookedCount() + increment;
            schedule.setBookedCount(Math.max(0, newCount));
            schedule.setUpdateTime(LocalDateTime.now());
            scheduleMapper.updateById(schedule);
        }
    }

    @Override
    public boolean isScheduleAvailable(Long scheduleId) {
        PsychologistSchedule schedule = scheduleMapper.selectById(scheduleId);
        if (schedule == null) {
            return false;
        }
        if (!schedule.getStatus().equals(PsychologistSchedule.STATUS_AVAILABLE)) {
            return false;
        }
        if (schedule.getBookedCount() >= schedule.getMaxAppointments()) {
            return false;
        }
        return true;
    }

    @Override
    public PsychologistSchedule getScheduleById(Long scheduleId) {
        return scheduleMapper.selectById(scheduleId);
    }

    /**
     * 自动初始化排班数据：如果数据库中没有排班记录，自动创建近7天的默认排班
     * 仅处理当天及之后的日期，过去日期不创建
     */
    @Override
    @Transactional
    public void autoInitSchedules(Long psychologistId) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(6);

        for (LocalDate date = today; !date.isAfter(endDate); date = date.plusDays(1)) {
            for (String timeSlot : new String[]{
                    PsychologistSchedule.SLOT_MORNING,
                    PsychologistSchedule.SLOT_AFTERNOON,
                    PsychologistSchedule.SLOT_EVENING}) {
                // 检查是否已存在
                com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PsychologistSchedule> wrapper =
                        new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
                wrapper.eq(PsychologistSchedule::getPsychologistId, psychologistId)
                        .eq(PsychologistSchedule::getScheduleDate, date)
                        .eq(PsychologistSchedule::getTimeSlot, timeSlot);
                long count = scheduleMapper.selectCount(wrapper);
                if (count == 0) {
                    PsychologistSchedule schedule = new PsychologistSchedule();
                    schedule.setPsychologistId(psychologistId);
                    schedule.setScheduleDate(date);
                    schedule.setTimeSlot(timeSlot);
                    schedule.setStartTime(getDefaultStartTime(timeSlot));
                    schedule.setEndTime(getDefaultEndTime(timeSlot));
                    schedule.setMaxAppointments(5);
                    schedule.setBookedCount(0);
                    schedule.setStatus(PsychologistSchedule.STATUS_AVAILABLE);
                    schedule.setCreateTime(LocalDateTime.now());
                    schedule.setUpdateTime(LocalDateTime.now());
                    scheduleMapper.insert(schedule);
                }
            }
        }
    }

    /**
     * 获取排班时段详情（包含预约列表）
     */
    @Override
    public Map<String, Object> getScheduleSlotDetail(Long psychologistId, LocalDate scheduleDate, String timeSlot) {
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PsychologistSchedule> wrapper =
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        wrapper.eq(PsychologistSchedule::getPsychologistId, psychologistId)
                .eq(PsychologistSchedule::getScheduleDate, scheduleDate)
                .eq(PsychologistSchedule::getTimeSlot, timeSlot);
        PsychologistSchedule schedule = scheduleMapper.selectOne(wrapper);

        Map<String, Object> result = new HashMap<>();
        if (schedule == null) {
            result.put("exists", false);
            return result;
        }

        result.put("exists", true);
        result.put("scheduleId", schedule.getId());
        result.put("scheduleDate", schedule.getScheduleDate());
        result.put("timeSlot", schedule.getTimeSlot());
        result.put("startTime", schedule.getStartTime());
        result.put("endTime", schedule.getEndTime());
        result.put("maxAppointments", schedule.getMaxAppointments());
        result.put("bookedCount", schedule.getBookedCount());
        result.put("status", schedule.getStatus());
        result.put("isRest", schedule.getStatus() == PsychologistSchedule.STATUS_REST);

        // 查询该时段的预约列表
        List<PsychologistAppointment> appointments = appointmentMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PsychologistAppointment>()
                        .eq(PsychologistAppointment::getScheduleId, schedule.getId())
                        .orderByAsc(PsychologistAppointment::getAppointmentTime)
        );

        List<Map<String, Object>> appointmentList = new ArrayList<>();
        for (PsychologistAppointment appt : appointments) {
            Map<String, Object> apptMap = new HashMap<>();
            apptMap.put("id", appt.getId());
            apptMap.put("orderNo", appt.getOrderNo());
            apptMap.put("appointmentTime", appt.getAppointmentTime());
            apptMap.put("serviceType", appt.getServiceType());
            apptMap.put("status", appt.getStatus());
            apptMap.put("payStatus", appt.getPayStatus());
            apptMap.put("userBasicInfo", appt.getUserBasicInfo());
            apptMap.put("userProblems", appt.getUserProblems());
            appointmentList.add(apptMap);
        }
        result.put("appointments", appointmentList);

        return result;
    }

    /**
     * 更新排班状态（仅允许 休息<->可预约）
     */
    @Override
    @Transactional
    public String updateScheduleStatus(Long psychologistId, Long scheduleId, Integer newStatus) {
        PsychologistSchedule schedule = scheduleMapper.selectById(scheduleId);
        if (schedule == null) {
            return "排班不存在";
        }
        if (!schedule.getPsychologistId().equals(psychologistId)) {
            return "无权操作";
        }
        if (!schedule.getScheduleDate().isAfter(LocalDate.now())) {
            return "过去日期的排班无法修改";
        }
        // 仅允许切换 休息<->可预约
        if (newStatus != PsychologistSchedule.STATUS_REST && newStatus != PsychologistSchedule.STATUS_AVAILABLE) {
            return "状态值不合法";
        }
        schedule.setStatus(newStatus);
        schedule.setUpdateTime(LocalDateTime.now());
        scheduleMapper.updateById(schedule);
        return "状态更新成功";
    }

    /**
     * 更新排班信息（最大预约人数等）
     */
    @Override
    @Transactional
    public String updateSchedule(Long psychologistId, Long scheduleId, Integer maxAppointments) {
        PsychologistSchedule schedule = scheduleMapper.selectById(scheduleId);
        if (schedule == null) {
            return "排班不存在";
        }
        if (!schedule.getPsychologistId().equals(psychologistId)) {
            return "无权操作";
        }
        // 当天不可修改
        if (!schedule.getScheduleDate().isAfter(LocalDate.now())) {
            return "过去及当天的排班无法修改";
        }
        if (maxAppointments != null) {
            if (maxAppointments < 0) {
                return "最大预约人数不能为负数";
            }
            if (maxAppointments > 5) {
                return "最大预约人数不能超过5人";
            }
            // 已预约人数不能超过新的最大值
            int booked = schedule.getBookedCount() != null ? schedule.getBookedCount() : 0;
            if (booked > maxAppointments) {
                return "已预约人数（" + booked + "）不能超过最大预约人数";
            }
            schedule.setMaxAppointments(maxAppointments);
        }
        schedule.setUpdateTime(LocalDateTime.now());
        scheduleMapper.updateById(schedule);
        return "保存成功";
    }

    /**
     * 删除指定日期之前的所有排班记录（仅删除无预约的记录）
     */
    @Override
    @Transactional
    public int autoDeleteOldSchedules(Long psychologistId) {
        return deleteOldSchedulesBefore(psychologistId, LocalDate.now());
    }

    /**
     * 删除指定日期之前的历史排班（仅删除无预约的记录）
     */
    @Override
    @Transactional
    public int deleteOldSchedulesBefore(Long psychologistId, LocalDate beforeDate) {
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PsychologistSchedule> wrapper =
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        wrapper.eq(PsychologistSchedule::getPsychologistId, psychologistId)
                .lt(PsychologistSchedule::getScheduleDate, beforeDate);
        List<PsychologistSchedule> oldSchedules = scheduleMapper.selectList(wrapper);

        int deletedCount = 0;
        for (PsychologistSchedule schedule : oldSchedules) {
            if (schedule.getBookedCount() == null || schedule.getBookedCount() == 0) {
                scheduleMapper.deleteById(schedule.getId());
                deletedCount++;
            }
        }
        return deletedCount;
    }

    // ==================== 私有方法 ====================

    private LocalTime getDefaultStartTime(String timeSlot) {
        switch (timeSlot) {
            case PsychologistSchedule.SLOT_MORNING:
                return LocalTime.of(9, 0);
            case PsychologistSchedule.SLOT_AFTERNOON:
                return LocalTime.of(14, 0);
            case PsychologistSchedule.SLOT_EVENING:
                return LocalTime.of(19, 0);
            default:
                return LocalTime.of(9, 0);
        }
    }

    private LocalTime getDefaultEndTime(String timeSlot) {
        switch (timeSlot) {
            case PsychologistSchedule.SLOT_MORNING:
                return LocalTime.of(12, 0);
            case PsychologistSchedule.SLOT_AFTERNOON:
                return LocalTime.of(18, 0);
            case PsychologistSchedule.SLOT_EVENING:
                return LocalTime.of(22, 0);
            default:
                return LocalTime.of(12, 0);
        }
    }

    /**
     * 获取星期几文本
     */
    private String getDayOfWeekText(DayOfWeek dayOfWeek) {
        if (dayOfWeek == null) return "";
        switch (dayOfWeek) {
            case MONDAY: return "星期一";
            case TUESDAY: return "星期二";
            case WEDNESDAY: return "星期三";
            case THURSDAY: return "星期四";
            case FRIDAY: return "星期五";
            case SATURDAY: return "星期六";
            case SUNDAY: return "星期日";
            default: return "";
        }
    }
}
