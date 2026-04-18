package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo;

import lombok.Data;

@Data
public class UserInfoVO {
    private Long userId;
    private String nickname;
    private String headPath;
    private String signature;
    private Integer articleCount;
    private Boolean isFollowing;
    private Boolean isFollowed;
}
