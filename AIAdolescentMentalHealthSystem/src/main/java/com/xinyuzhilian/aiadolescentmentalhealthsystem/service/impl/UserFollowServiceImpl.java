package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserInfoVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserFollow;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserFollowMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserStatsMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ISysMessageService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserFollowService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserFollowServiceImpl extends ServiceImpl<UserFollowMapper, UserFollow> implements IUserFollowService {

    private final UserMapper userMapper;
    private final UserStatsMapper userStatsMapper;
    private final IUserStatsService userStatsService;
    private final ISysMessageService sysMessageService;

    @Override
    @Transactional
    public boolean follow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new RuntimeException("不能关注自己");
        }

        User following = userMapper.selectById(followingId);
        if (following == null) {
            throw new RuntimeException("用户不存在");
        }

        User follower = userMapper.selectById(followerId);

        LambdaQueryWrapper<UserFollow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserFollow::getFollowerId, followerId).eq(UserFollow::getFollowingId, followingId);
        UserFollow existing = this.getOne(wrapper);

        if (existing != null) {
            return true;
        }

        UserFollow follow = new UserFollow();
        follow.setFollowerId(followerId);
        follow.setFollowingId(followingId);
        follow.setCreateTime(LocalDateTime.now());
        this.save(follow);

        // 更新统计
        userStatsService.updateStats(followerId, "follow", 1);
        userStatsService.updateStats(followingId, "fan", 1);

        // 发送关注通知
        if (follower != null) {
            sysMessageService.sendFollowNotification(followingId, followerId, follower.getNickname(), follower.getHeadPath());
        }

        return true;
    }

    @Override
    @Transactional
    public boolean unfollow(Long followerId, Long followingId) {
        LambdaQueryWrapper<UserFollow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserFollow::getFollowerId, followerId).eq(UserFollow::getFollowingId, followingId);
        boolean removed = this.remove(wrapper);
        
        if (removed) {
            userStatsService.updateStats(followerId, "follow", -1);
            userStatsService.updateStats(followingId, "fan", -1);
        }
        
        return removed;
    }

    @Override
    public boolean isFollowing(Long followerId, Long followingId) {
        LambdaQueryWrapper<UserFollow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserFollow::getFollowerId, followerId).eq(UserFollow::getFollowingId, followingId);
        return this.count(wrapper) > 0;
    }

    @Override
    public PageResult<UserInfoVO> getFollowings(Long userId, Integer page, Integer size) {
        Page<UserFollow> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<UserFollow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserFollow::getFollowerId, userId).orderByDesc(UserFollow::getCreateTime);
        Page<UserFollow> result = this.page(pageParam, wrapper);
        
        List<Long> followingIds = result.getRecords().stream()
                .map(UserFollow::getFollowingId)
                .collect(Collectors.toList());
        
        List<UserInfoVO> voList;
        if (followingIds.isEmpty()) {
            voList = new java.util.ArrayList<>();
        } else {
            Map<Long, User> userMap = userMapper.selectBatchIds(followingIds).stream()
                    .collect(Collectors.toMap(User::getId, u -> u));
            
            voList = result.getRecords().stream().map(follow -> {
                User user = userMap.get(follow.getFollowingId());
                if (user == null) return null;
                return convertToVO(user, userId);
            }).filter(v -> v != null).collect(Collectors.toList());
        }
        
        Page<UserInfoVO> pageResult = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        pageResult.setRecords(voList);
        return PageResult.build(pageResult);
    }

    @Override
    public PageResult<UserInfoVO> getFollowers(Long userId, Integer page, Integer size) {
        Page<UserFollow> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<UserFollow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserFollow::getFollowingId, userId).orderByDesc(UserFollow::getCreateTime);
        Page<UserFollow> result = this.page(pageParam, wrapper);
        
        List<Long> followerIds = result.getRecords().stream()
                .map(UserFollow::getFollowerId)
                .collect(Collectors.toList());
        
        List<UserInfoVO> voList;
        if (followerIds.isEmpty()) {
            voList = new java.util.ArrayList<>();
        } else {
            Map<Long, User> userMap = userMapper.selectBatchIds(followerIds).stream()
                    .collect(Collectors.toMap(User::getId, u -> u));
            
            voList = result.getRecords().stream().map(follow -> {
                User user = userMap.get(follow.getFollowerId());
                if (user == null) return null;
                return convertToVO(user, userId);
            }).filter(v -> v != null).collect(Collectors.toList());
        }
        
        Page<UserInfoVO> pageResult = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        pageResult.setRecords(voList);
        return PageResult.build(pageResult);
    }

    @Override
    public Long getFollowCount(Long userId) {
        LambdaQueryWrapper<UserFollow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserFollow::getFollowerId, userId);
        return this.count(wrapper);
    }

    @Override
    public Long getFanCount(Long userId) {
        LambdaQueryWrapper<UserFollow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserFollow::getFollowingId, userId);
        return this.count(wrapper);
    }

    private UserInfoVO convertToVO(User user, Long currentUserId) {
        UserInfoVO vo = new UserInfoVO();
        vo.setUserId(user.getId());
        vo.setNickname(user.getNickname());
        vo.setHeadPath(user.getHeadPath());
        vo.setSignature(user.getSignature());
        vo.setIsFollowing(isFollowing(currentUserId, user.getId()));
        vo.setIsFollowed(isFollowing(user.getId(), currentUserId));
        return vo;
    }
}
