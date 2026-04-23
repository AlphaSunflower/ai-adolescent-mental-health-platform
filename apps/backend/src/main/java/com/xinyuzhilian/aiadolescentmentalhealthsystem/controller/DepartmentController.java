package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.LoginUser;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Department;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Hospital;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.DepartmentMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.HospitalMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hospital/department")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentMapper departmentMapper;
    private final HospitalMapper hospitalMapper;

    @GetMapping("/list")
    public Result<PageResult<Department>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String name,
            Authentication authentication) {
        
        LoginUser loginUser = (LoginUser) authentication.getPrincipal();
        Long adminId = loginUser.getUser().getId();
        
        LambdaQueryWrapper<Hospital> hospitalWrapper = new LambdaQueryWrapper<>();
        hospitalWrapper.eq(Hospital::getAdminUserId, adminId);
        Hospital hospital = hospitalMapper.selectOne(hospitalWrapper);
        if (hospital == null) {
            return Result.error("未找到管理的医院");
        }

        Page<Department> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Department> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Department::getHospitalId, hospital.getId());
        if (name != null && !name.isEmpty()) {
            wrapper.like(Department::getName, name);
        }
        
        return Result.success(PageResult.build(departmentMapper.selectPage(pageParam, wrapper)));
    }

    @PostMapping
    public Result<String> save(@RequestBody Department department, Authentication authentication) {
        LoginUser loginUser = (LoginUser) authentication.getPrincipal();
        Long adminId = loginUser.getUser().getId();
        
        LambdaQueryWrapper<Hospital> hospitalWrapper = new LambdaQueryWrapper<>();
        hospitalWrapper.eq(Hospital::getAdminUserId, adminId);
        Hospital hospital = hospitalMapper.selectOne(hospitalWrapper);
        if (hospital == null) {
            return Result.error("未找到管理的医院");
        }

        department.setHospitalId(hospital.getId());

        if (department.getId() == null) {
            departmentMapper.insert(department);
        } else {
            departmentMapper.updateById(department);
        }
        return Result.success("保存成功", null);
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        departmentMapper.deleteById(id);
        return Result.success("删除成功", null);
    }
}
