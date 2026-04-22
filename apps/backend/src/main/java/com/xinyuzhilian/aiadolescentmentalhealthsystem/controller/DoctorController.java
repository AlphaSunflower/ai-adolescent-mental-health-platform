package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 医生端控制器
 * 处理医生相关的业务请求，如查看患者列表等
 */
@RestController
@RequestMapping("/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final IUserService userService;

    /**
     * 分页查询我的患者列表
     *
     * @param page           页码
     * @param size           每页大小
     * @param doctorId       当前登录医生ID
     * @return 患者列表分页结果
     */
    @GetMapping("/patients")
    @PreAuthorize("hasRole('2')")
    public Result<PageResult<User>> getMyPatients(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @CurrentUserId Long doctorId) {
        
        return Result.success(userService.getPatientsByDoctorId(doctorId, page, size));
    }
}
