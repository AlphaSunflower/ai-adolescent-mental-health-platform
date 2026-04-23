package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.hospital.dto.DoctorDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Hospital;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IHospitalService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 管理员控制器
 * 处理超级管理员和医院管理员的业务请求
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('4')")
public class AdminController {

    private final IUserService userService;
    private final IHospitalService hospitalService;

    // --- 超级管理员接口 (Role 4) ---

    /**
     * 分页查询用户列表
     *
     * @param page     页码
     * @param size     每页大小
     * @param username 用户名关键词
     * @param status   状态过滤
     * @return 用户列表分页结果
     */
    @GetMapping("/users")
    public Result<PageResult<User>> getUsers(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) Integer status) {
        
        return Result.success(userService.getUsers(page, size, username, status));
    }

    /**
     * 保存或更新用户
     *
     * @param user 用户对象
     * @return 操作结果
     */
    @PostMapping("/user")
    public Result<String> saveUser(@RequestBody User user) {
        userService.saveUser(user);
        return Result.success("保存成功", null);
    }

    /**
     * 删除用户
     *
     * @param id 用户ID
     * @return 操作结果
     */
    @DeleteMapping("/user/{id}")
    public Result<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success("删除成功", null);
    }

    /**
     * 根据ID获取用户详情
     *
     * @param id 用户ID
     * @return 用户详情
     */
    @GetMapping("/user/{id}")
    public Result<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserInfo(id);
        if (user != null) {
            return Result.success(user);
        }
        return Result.error("用户不存在");
    }

    /**
     * 分页查询医院列表
     *
     * @param page   页码
     * @param size   每页大小
     * @param name   医院名称关键词
     * @param status 状态过滤
     * @return 医院列表分页结果
     */
    @GetMapping("/hospitals")
    public Result<PageResult<Hospital>> getHospitals(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer status) {
        
        return Result.success(hospitalService.getHospitals(page, size, name, status));
    }

    /**
     * 保存或更新医院
     *
     * @param hospital 医院对象
     * @return 操作结果
     */
    @PostMapping("/hospital")
    public Result<String> saveHospital(@RequestBody Hospital hospital) {
        hospitalService.saveHospital(hospital);
        return Result.success("保存成功", null);
    }

    /**
     * 删除医院
     *
     * @param id 医院ID
     * @return 操作结果
     */
    @DeleteMapping("/hospital/{id}")
    public Result<String> deleteHospital(@PathVariable Long id) {
        hospitalService.deleteHospital(id);
        return Result.success("删除成功", null);
    }

    // --- 医院管理员接口 (Role 3) ---

    /**
     * 分页查询本医院医生列表
     *
     * @param page           页码
     * @param size           每页大小
     * @param name           医生姓名关键词
     * @param status         状态过滤
     * @param adminId        当前登录管理员ID
     * @return 医生列表分页结果
     */
    @GetMapping("/hospital/doctors")
    public Result<PageResult<DoctorDTO>> getMyHospitalDoctors(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer status,
            @CurrentUserId Long adminId) {
        
        try {
            return Result.success(hospitalService.getMyHospitalDoctors(adminId, page, size, name, status));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 保存或更新本医院医生
     *
     * @param doctorDTO      医生DTO对象
     * @param adminId        当前登录管理员ID
     * @return 操作结果
     */
    @PostMapping("/hospital/doctor")
    public Result<String> saveDoctor(@RequestBody DoctorDTO doctorDTO, @CurrentUserId Long adminId) {
        try {
            hospitalService.saveDoctor(adminId, doctorDTO);
            return Result.success("保存成功", null);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/hospital/doctor/{id}/consultation-switch")
    public Result<String> updateDoctorConsultationSwitch(
            @PathVariable Long id,
            @RequestParam(required = false) Integer onlineEnabled,
            @RequestParam(required = false) Integer offlineEnabled,
            @CurrentUserId Long adminId) {
        try {
            hospitalService.updateDoctorConsultationSwitch(adminId, id, onlineEnabled, offlineEnabled);
            return Result.success("咨询权限更新成功", null);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除本医院医生
     *
     * @param id 医生用户ID
     * @return 操作结果
     */
    @DeleteMapping("/hospital/doctor/{id}")
    public Result<String> deleteDoctor(@PathVariable Long id) {
        hospitalService.deleteDoctor(id);
        return Result.success("删除成功", null);
    }
}
