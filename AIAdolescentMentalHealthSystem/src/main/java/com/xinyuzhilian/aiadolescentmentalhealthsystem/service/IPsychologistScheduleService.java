package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistSchedule;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 心理咨询师排班服务接口
 * 提供排班管理功能
 *
 * @author AI Developer
 * @since 2026-04-14
 */
public interface IPsychologistScheduleService extends IService<PsychologistSchedule> {

    /**
     * 获取心理咨询师排班列表
     *
     * @param psychologistId 心理咨询师ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 排班列表
     */
    List<PsychologistSchedule> getSchedules(Long psychologistId, LocalDate startDate, LocalDate endDate);

    /**
     * 获取心理咨询师可预约的排班
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 可预约的排班列表
     */
    List<Map<String, Object>> getAvailableSchedules(LocalDate startDate, LocalDate endDate);

    /**
     * 获取指定日期的排班（按日期分组）
     *
     * @param psychologistId 心理咨询师ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 按日期分组的排班
     */
    List<Map<String, Object>> getSchedulesByDate(Long psychologistId, LocalDate startDate, LocalDate endDate);

    /**
     * 保存排班（新增或更新）
     *
     * @param schedule 排班信息
     * @param psychologistId 心理咨询师ID
     * @return 操作结果
     */
    String saveSchedule(PsychologistSchedule schedule, Long psychologistId);

    /**
     * 批量保存排班
     *
     * @param schedules 排班列表
     * @param psychologistId 心理咨询师ID
     * @return 操作结果
     */
    String saveSchedules(List<PsychologistSchedule> schedules, Long psychologistId);

    /**
     * 删除排班
     *
     * @param scheduleId 排班ID
     * @param psychologistId 心理咨询师ID
     * @return 操作结果
     */
    String deleteSchedule(Long scheduleId, Long psychologistId);

    /**
     * 更新排班预约人数
     *
     * @param scheduleId 排班ID
     * @param increment 增量（正数增加，负数减少）
     */
    void updateBookedCount(Long scheduleId, Integer increment);

    /**
     * 检查指定时段是否可预约
     *
     * @param scheduleId 排班ID
     * @return 是否可预约
     */
    boolean isScheduleAvailable(Long scheduleId);

    /**
     * 获取排班详情
     *
     * @param scheduleId 排班ID
     * @return 排班详情
     */
    PsychologistSchedule getScheduleById(Long scheduleId);

    /**
     * 自动初始化排班数据：如果数据库中没有排班记录，自动创建近7天的默认排班
     *
     * @param psychologistId 心理咨询师ID
     */
    void autoInitSchedules(Long psychologistId);

    /**
     * 获取排班时段详情（包含预约列表）
     *
     * @param psychologistId 心理咨询师ID
     * @param scheduleDate 排班日期
     * @param timeSlot 时段
     * @return 时段详情
     */
    Map<String, Object> getScheduleSlotDetail(Long psychologistId, LocalDate scheduleDate, String timeSlot);

    /**
     * 更新排班状态（仅允许 休息<->可预约）
     *
     * @param psychologistId 心理咨询师ID
     * @param scheduleId 排班ID
     * @param newStatus 新状态
     * @return 操作结果
     */
    String updateScheduleStatus(Long psychologistId, Long scheduleId, Integer newStatus);

    /**
     * 更新排班信息（最大预约人数等）
     *
     * @param psychologistId 心理咨询师ID
     * @param scheduleId 排班ID
     * @param maxAppointments 最大预约人数
     * @return 操作结果
     */
    String updateSchedule(Long psychologistId, Long scheduleId, Integer maxAppointments);

    /**
     * 删除指定日期之前的所有排班记录（仅删除无预约的记录）
     *
     * @param psychologistId 心理咨询师ID
     * @return 删除数量
     */
    int autoDeleteOldSchedules(Long psychologistId);

    /**
     * 删除指定日期之前的历史排班（仅删除无预约的记录）
     *
     * @param psychologistId 心理咨询师ID
     * @param beforeDate 在此日期之前的排班将被删除
     * @return 删除数量
     */
    int deleteOldSchedulesBefore(Long psychologistId, LocalDate beforeDate);
}
