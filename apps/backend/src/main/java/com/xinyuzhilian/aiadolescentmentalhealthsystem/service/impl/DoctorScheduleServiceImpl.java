package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.hospital.vo.AvailableDoctorVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IDoctorScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorScheduleServiceImpl implements IDoctorScheduleService {

    private final DoctorScheduleMapper scheduleMapper;
    private final DoctorScheduleConfigMapper scheduleConfigMapper;
    private final DoctorProfileMapper doctorProfileMapper;
    private final UserMapper userMapper;
    private final HospitalMapper hospitalMapper;

    @Override
    public List<DoctorSchedule> getSchedules(Long doctorId, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<DoctorSchedule> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DoctorSchedule::getDoctorId, doctorId);
        wrapper.ge(DoctorSchedule::getWorkDate, startDate);
        wrapper.le(DoctorSchedule::getWorkDate, endDate);
        wrapper.eq(DoctorSchedule::getStatus, 1);
        wrapper.orderByAsc(DoctorSchedule::getWorkDate);
        return scheduleMapper.selectList(wrapper);
    }

    @Override
    public List<AvailableDoctorVO> getAvailableDoctors(Long departmentId, LocalDate date) {
        LambdaQueryWrapper<DoctorSchedule> scheduleWrapper = new LambdaQueryWrapper<>();
        scheduleWrapper.eq(DoctorSchedule::getWorkDate, date);
        scheduleWrapper.eq(DoctorSchedule::getStatus, 1);
        scheduleWrapper.gt(DoctorSchedule::getMaxPatients, 0);
        
        List<DoctorSchedule> schedules = scheduleMapper.selectList(scheduleWrapper);
        if (schedules.isEmpty()) {
            return List.of();
        }

        List<Long> doctorIds = schedules.stream().map(DoctorSchedule::getDoctorId).distinct().collect(Collectors.toList());
        
        LambdaQueryWrapper<DoctorProfile> profileWrapper = new LambdaQueryWrapper<>();
        profileWrapper.in(DoctorProfile::getUserId, doctorIds);
        profileWrapper.eq(DoctorProfile::getDepartmentId, departmentId);
        profileWrapper.eq(DoctorProfile::getIsOfflineConsultEnabled, 1);
        List<DoctorProfile> profiles = doctorProfileMapper.selectList(profileWrapper);
        
        if (profiles.isEmpty()) {
            return List.of();
        }
        
        List<Long> finalDoctorIds = profiles.stream().map(DoctorProfile::getUserId).collect(Collectors.toList());
        List<User> users = userMapper.selectBatchIds(finalDoctorIds);
        java.util.Map<Long, User> userMap = users.stream().collect(Collectors.toMap(User::getId, u -> u));
        
        List<Long> hospitalIds = profiles.stream().map(DoctorProfile::getHospitalId).distinct().collect(Collectors.toList());
        List<Hospital> hospitals = hospitalMapper.selectBatchIds(hospitalIds);
        java.util.Map<Long, Hospital> hospitalMap = hospitals.stream().collect(Collectors.toMap(Hospital::getId, h -> h));

        return profiles.stream().map(p -> {
            AvailableDoctorVO vo = new AvailableDoctorVO();
            vo.setId(p.getUserId());
            vo.setRealName(p.getRealName());
            vo.setTitle(p.getTitle());
            vo.setSpecialty(p.getSpecialty());
            vo.setConsultationPrice(p.getConsultationPrice());
            vo.setRatingScore(p.getRatingScore());
            Hospital h = hospitalMap.get(p.getHospitalId());
            if (h != null) {
                vo.setHospitalName(h.getName());
            }
            User u = userMap.get(p.getUserId());
            if (u != null) {
                vo.setHeadPath(u.getHeadPath());
            }
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public void restrictDoctor(Long doctorId, Boolean enabled) {
        DoctorProfile profile = doctorProfileMapper.selectById(doctorId);
        if (profile != null) {
            profile.setIsOnlineConsultEnabled(enabled ? 1 : 0);
            doctorProfileMapper.updateById(profile);
        }
    }

    @Override
    public List<AvailableDoctorVO> searchDoctors(String name, BigDecimal minRating, BigDecimal maxPrice, Long hospitalId, Long departmentId) {
        LambdaQueryWrapper<DoctorProfile> profileWrapper = new LambdaQueryWrapper<>();
        if (name != null && !name.isEmpty()) {
            profileWrapper.like(DoctorProfile::getRealName, name);
        }
        if (minRating != null) {
            profileWrapper.ge(DoctorProfile::getRatingScore, minRating);
        }
        if (maxPrice != null) {
            profileWrapper.le(DoctorProfile::getConsultationPrice, maxPrice);
        }
        if (hospitalId != null) {
            profileWrapper.eq(DoctorProfile::getHospitalId, hospitalId);
        }
        if (departmentId != null) {
            profileWrapper.eq(DoctorProfile::getDepartmentId, departmentId);
        }
        
        List<DoctorProfile> profiles = doctorProfileMapper.selectList(profileWrapper);
        if (profiles.isEmpty()) {
            return List.of();
        }
        
        List<Long> doctorIds = profiles.stream().map(DoctorProfile::getUserId).collect(Collectors.toList());
        List<User> users = userMapper.selectBatchIds(doctorIds);
        java.util.Map<Long, User> userMap = users.stream().collect(Collectors.toMap(User::getId, u -> u));
        
        List<Long> hospitalIds = profiles.stream().map(DoctorProfile::getHospitalId).distinct().collect(Collectors.toList());
        List<Hospital> hospitals = hospitalMapper.selectBatchIds(hospitalIds);
        java.util.Map<Long, Hospital> hospitalMap = hospitals.stream().collect(Collectors.toMap(Hospital::getId, h -> h));

        return profiles.stream().map(p -> {
            AvailableDoctorVO vo = new AvailableDoctorVO();
            vo.setId(p.getUserId());
            vo.setRealName(p.getRealName());
            vo.setTitle(p.getTitle());
            vo.setSpecialty(p.getSpecialty());
            vo.setConsultationPrice(p.getConsultationPrice());
            vo.setRatingScore(p.getRatingScore());
            Hospital h = hospitalMap.get(p.getHospitalId());
            if (h != null) {
                vo.setHospitalName(h.getName());
            }
            User u = userMap.get(p.getUserId());
            if (u != null) {
                vo.setHeadPath(u.getHeadPath());
            }
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addSchedules(List<DoctorSchedule> schedules) {
        for (DoctorSchedule s : schedules) {
            LambdaQueryWrapper<DoctorSchedule> check = new LambdaQueryWrapper<>();
            check.eq(DoctorSchedule::getDoctorId, s.getDoctorId());
            check.eq(DoctorSchedule::getWorkDate, s.getWorkDate());
            check.eq(DoctorSchedule::getWorkShift, s.getWorkShift());
            if (scheduleMapper.selectCount(check) > 0) {
                continue;
            }
            s.setBookedCount(0);
            s.setStatus(1);
            scheduleMapper.insert(s);
        }
    }

    @Override
    public List<DoctorScheduleConfig> getScheduleConfigs(Long doctorId) {
        LambdaQueryWrapper<DoctorScheduleConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DoctorScheduleConfig::getDoctorId, doctorId);
        wrapper.eq(DoctorScheduleConfig::getStatus, 1);
        wrapper.orderByAsc(DoctorScheduleConfig::getDayOfWeek, DoctorScheduleConfig::getWorkShift);
        return scheduleConfigMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveScheduleConfig(List<DoctorScheduleConfig> configs) {
        if (configs == null || configs.isEmpty()) {
            return;
        }
        Long doctorId = configs.get(0).getDoctorId();
        
        LambdaQueryWrapper<DoctorScheduleConfig> deleteWrapper = new LambdaQueryWrapper<>();
        deleteWrapper.eq(DoctorScheduleConfig::getDoctorId, doctorId);
        scheduleConfigMapper.delete(deleteWrapper);

        for (DoctorScheduleConfig config : configs) {
            config.setStatus(1);
            scheduleConfigMapper.insert(config);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String generateSchedules(Long doctorId, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<DoctorScheduleConfig> configWrapper = new LambdaQueryWrapper<>();
        configWrapper.eq(DoctorScheduleConfig::getDoctorId, doctorId);
        configWrapper.eq(DoctorScheduleConfig::getStatus, 1);
        List<DoctorScheduleConfig> configs = scheduleConfigMapper.selectList(configWrapper);
        
        if (configs.isEmpty()) {
            throw new RuntimeException("该医生未配置排班规则");
        }

        LocalDate current = startDate;
        int count = 0;
        while (!current.isAfter(endDate)) {
            int dayOfWeek = current.getDayOfWeek().getValue();
            List<DoctorScheduleConfig> dayConfigs = configs.stream()
                    .filter(c -> c.getDayOfWeek() == dayOfWeek)
                    .collect(Collectors.toList());

            for (DoctorScheduleConfig c : dayConfigs) {
                LambdaQueryWrapper<DoctorSchedule> check = new LambdaQueryWrapper<>();
                check.eq(DoctorSchedule::getDoctorId, doctorId);
                check.eq(DoctorSchedule::getWorkDate, current);
                check.eq(DoctorSchedule::getWorkShift, c.getWorkShift());
                
                if (scheduleMapper.selectCount(check) == 0) {
                    DoctorSchedule schedule = new DoctorSchedule();
                    schedule.setDoctorId(doctorId);
                    schedule.setWorkDate(current);
                    schedule.setWorkShift(c.getWorkShift());
                    schedule.setMaxPatients(c.getMaxPatients());
                    schedule.setBookedCount(0);
                    schedule.setStatus(1);
                    scheduleMapper.insert(schedule);
                    count++;
                }
            }
            current = current.plusDays(1);
        }
        return "成功生成 " + count + " 条排班记录";
    }
}
