package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Psychologist;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistFieldRelation;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistQualificationRelation;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 心理咨询师服务接口
 * 提供心理咨询师的CRUD和查询功能
 *
 * @author AI Developer
 * @since 2026-04-14
 */
public interface IPsychologistService extends IService<Psychologist> {

    /**
     * 根据用户ID获取心理咨询师信息
     *
     * @param userId 用户ID
     * @return 心理咨询师信息
     */
    Psychologist getByUserId(Long userId);

    /**
     * 分页获取心理咨询师列表（带筛选条件）
     *
     * @param page 页码
     * @param size 每页大小
     * @param keyword 搜索关键词
     * @param fieldIds 擅长领域ID列表
     * @param serviceTypes 服务类型列表
     * @param sex 性别
     * @param minPrice 最低价格
     * @param maxPrice 最高价格
     * @param qualificationIds 资质ID列表
     * @param minRating 最低评分
     * @param languages 语言能力
     * @param sortBy 排序字段
     * @param sortOrder 排序方向
     * @param userId 当前用户ID（用于判断收藏和预约状态）
     * @return 分页结果
     */
    PageResult<Map<String, Object>> listPsychologists(Integer page, Integer size, String keyword,
            List<Integer> fieldIds, List<String> serviceTypes, Integer sex,
            BigDecimal minPrice, BigDecimal maxPrice, List<Integer> qualificationIds,
            BigDecimal minRating, String languages, String sortBy, String sortOrder, Long userId);

    /**
     * 分页获取心理咨询师列表（管理端专用，支持所有状态）
     */
    PageResult<Map<String, Object>> listPsychologistsForAdmin(Integer page, Integer size, String keyword, Integer status);

    /**
     * 获取心理咨询师详情
     *
     * @param id 心理咨询师ID
     * @param userId 当前用户ID
     * @return 心理咨询师详细信息
     */
    Map<String, Object> getPsychologistDetail(Long id, Long userId);

    /**
     * 获取心理咨询师的资质列表
     *
     * @param psychologistId 心理咨询师ID
     * @return 资质关联列表
     */
    List<PsychologistQualificationRelation> getQualifications(Long psychologistId);

    /**
     * 获取心理咨询师的擅长领域列表
     *
     * @param psychologistId 心理咨询师ID
     * @return 领域关联列表
     */
    List<PsychologistFieldRelation> getFields(Long psychologistId);

    /**
     * 保存心理咨询师（新增或更新）
     *
     * @param psychologist 心理咨询师信息
     * @return 保存后的心理咨询师
     */
    Psychologist savePsychologist(Psychologist psychologist);

    /**
     * 更新心理咨询师资料
     *
     * @param id 心理咨询师ID
     * @param psychologist 更新的信息
     * @return 更新后的心理咨询师
     */
    Psychologist updatePsychologist(Long id, Psychologist psychologist);

    /**
     * 根据用户ID获取心理咨询师ID
     *
     * @param userId 用户ID
     * @return 心理咨询师ID，不存在返回null
     */
    Long getPsychologistIdByUserId(Long userId);

    /**
     * 获取收藏的心理咨询师列表
     *
     * @param userId 用户ID
     * @return 收藏的心理咨询师列表
     */
    List<Map<String, Object>> getFavorites(Long userId);

    /**
     * 获取咨询历史（咨询过的心理咨询师）
     *
     * @param userId 用户ID
     * @return 咨询历史列表
     */
    List<Map<String, Object>> getConsultationHistory(Long userId);

    /**
     * 更新心理咨询师评分
     *
     * @param psychologistId 心理咨询师ID
     * @param newRating 新评分
     */
    void updateRating(Long psychologistId, BigDecimal newRating);

    /**
     * 增加咨询次数
     *
     * @param psychologistId 心理咨询师ID
     */
    void incrementConsultationCount(Long psychologistId);

    /**
     * 获取用户的所有预约列表
     *
     * @param userId 用户ID
     * @param page 页码
     * @param size 每页大小
     * @param status 状态筛选（可选）
     * @return 分页的预约列表
     */
    PageResult<Map<String, Object>> getUserAppointments(Long userId, Integer page, Integer size, Integer status);

    /**
     * 获取用户当前进行中的预约
     *
     * @param userId 用户ID
     * @return 进行中的预约列表
     */
    List<Map<String, Object>> getCurrentAppointments(Long userId);

    /**
     * 更新心理咨询师在线状态
     *
     * @param userId 用户ID
     * @param status 在线状态（0-离线，1-在线，2-忙碌）
     * @return 是否更新成功
     */
    boolean updateOnlineStatus(Long userId, Integer status);

    /**
     * 检查并自动更新心理师的忙碌状态
     * 当有进行中的咨询时，自动设置为忙碌；否则设置为在线
     *
     * @param userId 心理师用户ID
     */
    void checkAndUpdateBusyStatus(Long userId);

    /**
     * 根据心理师ID获取用户ID
     *
     * @param psychologistId 心理师ID
     * @return 用户ID
     */
    Long getPsychologistUserId(Long psychologistId);
}
