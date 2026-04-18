package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.hospital.dto.DoctorDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.DoctorProfile;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Hospital;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.DoctorProfileMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.HospitalMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IHospitalService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HospitalServiceImpl extends ServiceImpl<HospitalMapper, Hospital> implements IHospitalService {

    private final HospitalMapper hospitalMapper;
    private final DoctorProfileMapper doctorProfileMapper;
    private final IUserService userService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public PageResult<Hospital> getHospitals(Integer page, Integer size, String name, Integer status) {
        Page<Hospital> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Hospital> wrapper = new LambdaQueryWrapper<>();
        if (name != null && !name.isEmpty()) {
            wrapper.like(Hospital::getName, name);
        }
        if (status != null) {
            wrapper.eq(Hospital::getStatus, status);
        }
        return PageResult.build(hospitalMapper.selectPage(pageParam, wrapper));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveHospital(Hospital hospital) {
        if (hospital.getId() == null) {
            hospitalMapper.insert(hospital);
        } else {
            hospitalMapper.updateById(hospital);
        }

        if (hospital.getAdminUserId() != null) {
            User user = userService.getById(hospital.getAdminUserId());
            if (user != null) {
                user.setRole(3); 
                userService.updateById(user);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteHospital(Long id) {
        hospitalMapper.deleteById(id);
    }

    @Override
    public PageResult<DoctorDTO> getMyHospitalDoctors(Long adminId, Integer page, Integer size, String name, Integer status) {
        LambdaQueryWrapper<Hospital> hospitalWrapper = new LambdaQueryWrapper<>();
        hospitalWrapper.eq(Hospital::getAdminUserId, adminId);
        Hospital hospital = hospitalMapper.selectOne(hospitalWrapper);
        
        if (hospital == null) {
            throw new RuntimeException("未找到管理的医院信息");
        }

        List<DoctorProfile> allProfiles = doctorProfileMapper.selectList(
                new LambdaQueryWrapper<DoctorProfile>().eq(DoctorProfile::getHospitalId, hospital.getId()));
        if (allProfiles.isEmpty()) {
            return new PageResult<>();
        }

        List<Long> hospitalDoctorIds = allProfiles.stream().map(DoctorProfile::getUserId).collect(Collectors.toList());

        List<Long> statusMatchedIds = hospitalDoctorIds;
        if (status != null) {
            List<User> statusMatchedUsers = userService.list(
                    new LambdaQueryWrapper<User>()
                            .in(User::getId, hospitalDoctorIds)
                            .eq(User::getStatus, status)
                            .eq(User::getRole, 2));
            statusMatchedIds = statusMatchedUsers.stream().map(User::getId).collect(Collectors.toList());
            if (statusMatchedIds.isEmpty()) {
                return new PageResult<>();
            }
        }

        List<Long> usernameMatchedIds = java.util.Collections.emptyList();
        if (name != null && !name.isEmpty()) {
            List<User> matchedUsers = userService.list(
                    new LambdaQueryWrapper<User>()
                            .in(User::getId, hospitalDoctorIds)
                            .like(User::getUsername, name)
                            .eq(User::getRole, 2));
            usernameMatchedIds = matchedUsers.stream().map(User::getId).collect(Collectors.toList());
        }
        final List<Long> finalUsernameMatchedIds = usernameMatchedIds;

        Page<DoctorProfile> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<DoctorProfile> profileWrapper = new LambdaQueryWrapper<>();
        profileWrapper.eq(DoctorProfile::getHospitalId, hospital.getId());
        profileWrapper.in(DoctorProfile::getUserId, statusMatchedIds);
        if (name != null && !name.isEmpty()) {
            if (finalUsernameMatchedIds.isEmpty()) {
                profileWrapper.like(DoctorProfile::getRealName, name);
            } else {
                profileWrapper.and(w -> w.like(DoctorProfile::getRealName, name)
                        .or()
                        .in(DoctorProfile::getUserId, finalUsernameMatchedIds));
            }
        }

        Page<DoctorProfile> profilePage = doctorProfileMapper.selectPage(pageParam, profileWrapper);
        
        if (profilePage.getRecords().isEmpty()) {
            return new PageResult<>();
        }

        List<Long> doctorIds = profilePage.getRecords().stream()
                .map(DoctorProfile::getUserId)
                .collect(Collectors.toList());

        List<User> users = userService.listByIds(doctorIds);
        java.util.Map<Long, User> userMap = users.stream().collect(Collectors.toMap(User::getId, u -> u));

        List<DoctorDTO> dtos = profilePage.getRecords().stream()
            .map(profile -> {
                DoctorDTO dto = new DoctorDTO();
                dto.setId(profile.getUserId());
                dto.setRealName(profile.getRealName());
                dto.setTitle(profile.getTitle());
                dto.setSpecialty(profile.getSpecialty());
                dto.setIntroduction(profile.getIntroduction());
                dto.setConsultationPrice(profile.getConsultationPrice());
                dto.setDepartmentId(profile.getDepartmentId());
                dto.setOnlineConsultEnabled(profile.getIsOnlineConsultEnabled() == null ? 1 : profile.getIsOnlineConsultEnabled());
                dto.setOfflineConsultEnabled(profile.getIsOfflineConsultEnabled() == null ? 1 : profile.getIsOfflineConsultEnabled());
                
                User user = userMap.get(profile.getUserId());
                if (user != null) {
                    dto.setUsername(user.getUsername());
                    dto.setNickname(user.getNickname());
                    dto.setPhone(user.getPhone());
                    dto.setSex(user.getSex());
                    dto.setStatus(user.getStatus());
                }
                return dto;
            })
            .collect(Collectors.toList());

        PageResult<DoctorDTO> result = new PageResult<>();
        result.setRecords(dtos);
        result.setTotal(profilePage.getTotal());
        result.setSize(profilePage.getSize());
        result.setCurrent(profilePage.getCurrent());
        result.setPages(profilePage.getPages());

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveDoctor(Long adminId, DoctorDTO doctorDTO) {
        LambdaQueryWrapper<Hospital> hospitalWrapper = new LambdaQueryWrapper<>();
        hospitalWrapper.eq(Hospital::getAdminUserId, adminId);
        Hospital hospital = hospitalMapper.selectOne(hospitalWrapper);
        if (hospital == null) {
            throw new RuntimeException("未找到所属医院");
        }

        Long userId = doctorDTO.getId();

        if (userId == null && doctorDTO.getUsername() != null) {
            LambdaQueryWrapper<User> userWrapper = new LambdaQueryWrapper<>();
            userWrapper.eq(User::getUsername, doctorDTO.getUsername());
            User existingUser = userService.getOne(userWrapper);
            if (existingUser != null) {
                userId = existingUser.getId();
                if (existingUser.getRole() != 2) {
                    existingUser.setRole(2);
                    userService.updateById(existingUser);
                }
            }
        }

        if (userId == null) {
            User user = new User();
            user.setUsername(doctorDTO.getUsername());
            user.setPassword(passwordEncoder.encode(doctorDTO.getPassword()));
            user.setNickname(doctorDTO.getNickname());
            user.setPhone(doctorDTO.getPhone());
            user.setSex(doctorDTO.getSex());
            user.setRole(2);
            user.setStatus(doctorDTO.getStatus() != null ? doctorDTO.getStatus() : 1);
            user.setDeleted(false);
            
            userService.save(user);
            userId = user.getId();
        } else {
            User user = userService.getById(userId);
            if (user != null) {
                user.setNickname(doctorDTO.getNickname());
                user.setPhone(doctorDTO.getPhone());
                user.setSex(doctorDTO.getSex());
                if (doctorDTO.getStatus() != null) {
                    user.setStatus(doctorDTO.getStatus());
                }
                userService.updateById(user);
            }
        }

        DoctorProfile profile = doctorProfileMapper.selectById(userId);
        if (profile == null) {
            profile = new DoctorProfile();
            profile.setUserId(userId);
        }
        profile.setHospitalId(hospital.getId());
        profile.setRealName(doctorDTO.getRealName());
        profile.setTitle(doctorDTO.getTitle());
        profile.setSpecialty(doctorDTO.getSpecialty());
        profile.setIntroduction(doctorDTO.getIntroduction());
        profile.setConsultationPrice(doctorDTO.getConsultationPrice());
        profile.setDepartmentId(doctorDTO.getDepartmentId());
        profile.setIsOnlineConsultEnabled(doctorDTO.getOnlineConsultEnabled() == null ? 1 : doctorDTO.getOnlineConsultEnabled());
        profile.setIsOfflineConsultEnabled(doctorDTO.getOfflineConsultEnabled() == null ? 1 : doctorDTO.getOfflineConsultEnabled());

        if (doctorProfileMapper.selectById(userId) == null) {
            doctorProfileMapper.insert(profile);
        } else {
            doctorProfileMapper.updateById(profile);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateDoctorConsultationSwitch(Long adminId, Long doctorId, Integer onlineEnabled, Integer offlineEnabled) {
        LambdaQueryWrapper<Hospital> hospitalWrapper = new LambdaQueryWrapper<>();
        hospitalWrapper.eq(Hospital::getAdminUserId, adminId);
        Hospital hospital = hospitalMapper.selectOne(hospitalWrapper);
        if (hospital == null) {
            throw new RuntimeException("未找到管理的医院信息");
        }

        DoctorProfile profile = doctorProfileMapper.selectById(doctorId);
        if (profile == null || !hospital.getId().equals(profile.getHospitalId())) {
            throw new RuntimeException("医生不属于当前医院");
        }

        if (onlineEnabled != null) {
            profile.setIsOnlineConsultEnabled(onlineEnabled);
        }
        if (offlineEnabled != null) {
            profile.setIsOfflineConsultEnabled(offlineEnabled);
        }
        doctorProfileMapper.updateById(profile);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteDoctor(Long id) {
        userService.removeById(id);
        doctorProfileMapper.deleteById(id);
    }
}
