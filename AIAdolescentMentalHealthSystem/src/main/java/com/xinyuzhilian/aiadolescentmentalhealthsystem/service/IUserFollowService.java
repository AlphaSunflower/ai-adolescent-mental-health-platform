package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserFollow;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserInfoVO;
import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;

public interface IUserFollowService extends IService<UserFollow> {
    boolean follow(Long followerId, Long followingId);
    
    boolean unfollow(Long followerId, Long followingId);
    
    boolean isFollowing(Long followerId, Long followingId);
    
    PageResult<UserInfoVO> getFollowings(Long userId, Integer page, Integer size);
    
    PageResult<UserInfoVO> getFollowers(Long userId, Integer page, Integer size);
    
    Long getFollowCount(Long userId);
    
    Long getFanCount(Long userId);
}
