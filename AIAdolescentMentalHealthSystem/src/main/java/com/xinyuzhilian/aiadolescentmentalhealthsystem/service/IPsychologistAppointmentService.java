package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistAppointment;

import java.util.Map;

/**
 * 心理咨询预约服务接口
 * 提供预约、支付、取消等预约管理功能
 *
 * @author AI Developer
 * @since 2026-04-14
 */
public interface IPsychologistAppointmentService extends IService<PsychologistAppointment> {

    /**
     * 创建预约订单
     *
     * @param request 预约请求参数
     * @param userId 用户ID
     * @return 订单ID
     */
    Long createAppointment(Map<String, Object> request, Long userId);

    /**
     * 支付预约订单（虚拟支付）
     *
     * @param appointmentId 预约ID
     * @param userId 用户ID
     * @return 支付结果
     */
    String payAppointment(Long appointmentId, Long userId);

    /**
     * 取消预约订单
     *
     * @param appointmentId 预约ID
     * @param userId 用户ID
     * @param cancelReason 取消原因
     * @return 取消结果
     */
    String cancelAppointment(Long appointmentId, Long userId, String cancelReason);

    /**
     * 获取我的预约列表
     *
     * @param page 页码
     * @param size 每页大小
     * @param userId 用户ID
     * @param status 状态筛选
     * @return 分页结果
     */
    PageResult<Map<String, Object>> getMyAppointments(Integer page, Integer size, Long userId, Integer status);

    /**
     * 获取预约详情
     *
     * @param appointmentId 预约ID
     * @param userId 用户ID
     * @return 预约详情
     */
    Map<String, Object> getAppointmentDetail(Long appointmentId, Long userId);

    /**
     * 心理咨询师：获取预约列表
     *
     * @param page 页码
     * @param size 每页大小
     * @param psychologistId 心理咨询师ID
     * @param status 状态筛选
     * @return 分页结果
     */
    PageResult<Map<String, Object>> getPsychologistAppointments(Integer page, Integer size, Long psychologistId, Integer status);

    /**
     * 心理咨询师：接受/拒绝预约
     *
     * @param appointmentId 预约ID
     * @param accepted 是否接受
     * @param videoLink 视频会议链接
     * @param rejectReason 拒绝原因
     * @param psychologistId 心理咨询师ID
     * @return 操作结果
     */
    String handleAppointment(Long appointmentId, Boolean accepted, String videoLink, String rejectReason, Long psychologistId);

    /**
     * 心理咨询师：发送视频会议链接或线下地址
     *
     * @param appointmentId 预约ID
     * @param videoLink 视频会议链接
     * @param offlineAddress 线下咨询地址
     * @param startTime 咨询开始时间
     * @param endTime 咨询结束时间
     * @param psychologistId 心理咨询师ID
     * @return 操作结果
     */
    String sendVideoLink(Long appointmentId, String videoLink, String offlineAddress, String startTime, String endTime, Long psychologistId);

    /**
     * 心理咨询师：开始咨询
     *
     * @param appointmentId 预约ID
     * @param startTime 咨询开始时间（可选，如果发送链接时未填写）
     * @param psychologistId 心理咨询师ID
     * @return 操作结果
     */
    String startConsultation(Long appointmentId, String startTime, Long psychologistId);

    /**
     * 心理咨询师：完成咨询
     *
     * @param appointmentId 预约ID
     * @param psychologistId 心理咨询师ID
     * @return 操作结果
     */
    String completeAppointment(Long appointmentId, Long psychologistId);

    /**
     * 用户：评价预约
     *
     * @param appointmentId 预约ID
     * @param rating 评分
     * @param content 评价内容
     * @param isAnonymous 是否匿名
     * @param userId 用户ID
     * @return 操作结果
     */
    String rateAppointment(Long appointmentId, Integer rating, String content, Integer isAnonymous, Long userId);

    /**
     * 生成订单编号
     *
     * @return 订单编号
     */
    String generateOrderNo();
}
