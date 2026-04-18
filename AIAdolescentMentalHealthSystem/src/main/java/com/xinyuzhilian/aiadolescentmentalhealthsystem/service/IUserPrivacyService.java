package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserPrivacySetting;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserPrivacyVO;
import com.baomidou.mybatisplus.extension.service.IService;

public interface IUserPrivacyService extends IService<UserPrivacySetting> {
    UserPrivacySetting getPrivacySetting(Long userId);
    
    UserPrivacyVO getPrivacyVO(Long userId);
    
    UserPrivacySetting updatePrivacySetting(UserPrivacySetting setting);

    boolean canViewFollowings(Long targetUserId, Long visitorUserId);

    boolean canViewFans(Long targetUserId, Long visitorUserId);
}
