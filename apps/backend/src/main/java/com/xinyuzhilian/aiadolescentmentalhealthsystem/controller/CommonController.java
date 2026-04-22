package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Department;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.DoctorProfile;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.DepartmentMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.DoctorProfileMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.utils.OSSUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/common")
@RequiredArgsConstructor
@Slf4j
public class CommonController {

    private final OSSUtil ossUtil;
    private final DepartmentMapper departmentMapper;
    private final DoctorProfileMapper doctorProfileMapper;
    private final UserMapper userMapper;
    private final com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.HospitalMapper hospitalMapper;

    @PostMapping("/upload")
    public Result<String> upload(MultipartFile file, @RequestParam(defaultValue = "common") String folder) {
        log.info("Common upload request: {}, folder: {}", file.getOriginalFilename(), folder);
        try {
            String url = ossUtil.uploadFile(file, folder);
            return Result.success("上传成功", url);
        } catch (Exception e) {
            log.error("Upload controller error", e);
            return Result.error("上传失败: " + e.getMessage());
        }
    }

    @GetMapping("/hospitals")
    public Result<List<com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Hospital>> getHospitals() {
        LambdaQueryWrapper<com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Hospital> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Hospital::getStatus, 1);
        return Result.success(hospitalMapper.selectList(wrapper));
    }

    @GetMapping("/departments")
    public Result<List<Department>> getDepartments(@RequestParam Long hospitalId) {
        LambdaQueryWrapper<Department> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Department::getHospitalId, hospitalId);
        wrapper.eq(Department::getStatus, 1);
        return Result.success(departmentMapper.selectList(wrapper));
    }

    @GetMapping("/doctors")
    public Result<List<DoctorVO>> getDoctors(@RequestParam Long hospitalId, @RequestParam(required = false) Long departmentId) {
        LambdaQueryWrapper<DoctorProfile> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DoctorProfile::getHospitalId, hospitalId);
        if (departmentId != null) {
            wrapper.eq(DoctorProfile::getDepartmentId, departmentId);
        }
        
        List<DoctorProfile> profiles = doctorProfileMapper.selectList(wrapper);
        if (profiles.isEmpty()) {
            return Result.success(List.of());
        }

        List<Long> userIds = profiles.stream().map(DoctorProfile::getUserId).collect(Collectors.toList());
        List<User> users = userMapper.selectBatchIds(userIds);
        java.util.Map<Long, User> userMap = users.stream().collect(Collectors.toMap(User::getId, u -> u));

        List<DoctorVO> vos = profiles.stream().map(p -> {
            DoctorVO vo = new DoctorVO();
            vo.setId(p.getUserId());
            vo.setRealName(p.getRealName());
            vo.setTitle(p.getTitle());
            vo.setSpecialty(p.getSpecialty());
            vo.setConsultationPrice(p.getConsultationPrice());
            vo.setDepartmentId(p.getDepartmentId());
            
            User u = userMap.get(p.getUserId());
            if (u != null) {
                vo.setHeadPath(u.getHeadPath());
                // Only return active doctors? User status check?
                // Let's assume we filter inactive users if needed.
            }
            return vo;
        }).collect(Collectors.toList());

        return Result.success(vos);
    }

    @Data
    public static class DoctorVO {
        private Long id;
        private String realName;
        private String title;
        private String specialty;
        private BigDecimal consultationPrice;
        private Long departmentId;
        private String headPath;
    }
}
