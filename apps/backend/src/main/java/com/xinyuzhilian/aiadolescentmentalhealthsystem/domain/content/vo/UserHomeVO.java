package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo;

import lombok.Data;

@Data
public class UserHomeVO {
    private Long userId;
    private String nickname;
    private String headPath;
    private String signature;
    private UserStatsVO stats;
    private UserPrivacyVO privacy;
    private Boolean isFollowing;
    private Boolean isFollowed;
}
