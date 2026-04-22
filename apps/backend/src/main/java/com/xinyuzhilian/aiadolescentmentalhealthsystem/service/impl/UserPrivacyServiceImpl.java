package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserPrivacyVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserPrivacySetting;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserPrivacySettingMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserPrivacyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserPrivacyServiceImpl extends ServiceImpl<UserPrivacySettingMapper, UserPrivacySetting> implements IUserPrivacyService {

    @Override
    public UserPrivacySetting getPrivacySetting(Long userId) {
        UserPrivacySetting setting = this.getById(userId);
        if (setting == null) {
            setting = new UserPrivacySetting();
            setting.setUserId(userId);
            setting.setAllowViewLikes(1);
            setting.setAllowViewArticles(1);
            setting.setAllowViewCollections(1);
            setting.setAllowViewFollowings(0);
            setting.setAllowViewFans(0);
            setting.setUpdateTime(LocalDateTime.now());
            this.save(setting);
        }
        return setting;
    }

    @Override
    public UserPrivacyVO getPrivacyVO(Long userId) {
        UserPrivacySetting setting = getPrivacySetting(userId);
        UserPrivacyVO vo = new UserPrivacyVO();
        vo.setAllowViewLikes(setting.getAllowViewLikes() == 1);
        vo.setAllowViewArticles(setting.getAllowViewArticles() == 1);
        vo.setAllowViewCollections(setting.getAllowViewCollections() == 1);
        vo.setAllowViewFollowings(setting.getAllowViewFollowings() == 1);
        vo.setAllowViewFans(setting.getAllowViewFans() == 1);
        return vo;
    }

    @Override
    public UserPrivacySetting updatePrivacySetting(UserPrivacySetting setting) {
        setting.setUpdateTime(LocalDateTime.now());
        UserPrivacySetting existing = this.getById(setting.getUserId());
        if (existing == null) {
            this.save(setting);
        } else {
            this.updateById(setting);
        }
        return setting;
    }

    @Override
    public boolean canViewFollowings(Long targetUserId, Long visitorUserId) {
        if (targetUserId.equals(visitorUserId)) {
            return true;
        }
        UserPrivacySetting setting = getPrivacySetting(targetUserId);
        return setting.getAllowViewFollowings() == 1;
    }

    @Override
    public boolean canViewFans(Long targetUserId, Long visitorUserId) {
        if (targetUserId.equals(visitorUserId)) {
            return true;
        }
        UserPrivacySetting setting = getPrivacySetting(targetUserId);
        return setting.getAllowViewFans() == 1;
    }
}
