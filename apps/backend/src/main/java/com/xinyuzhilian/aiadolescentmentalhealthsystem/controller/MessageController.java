package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.SysMessage;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.SysMessageMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ISysMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user/messages")
@RequiredArgsConstructor
public class MessageController {

    private final ISysMessageService sysMessageService;
    private final SysMessageMapper sysMessageMapper;
    private final UserMapper userMapper;

    @GetMapping
    public Result<PageResult<SysMessage>> getMessages(
            @CurrentUserId Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        PageResult<SysMessage> result = sysMessageService.getMessages(userId, page, size);

        // 填充触发用户的信息
        if (result.getRecords() != null && !result.getRecords().isEmpty()) {
            List<Long> fromUserIds = result.getRecords().stream()
                    .filter(m -> m.getFromUserId() != null)
                    .map(SysMessage::getFromUserId)
                    .distinct()
                    .collect(Collectors.toList());

            if (!fromUserIds.isEmpty()) {
                Map<Long, User> userMap = userMapper.selectBatchIds(fromUserIds).stream()
                        .collect(Collectors.toMap(User::getId, u -> u));

                result.getRecords().forEach(msg -> {
                    if (msg.getFromUserId() != null) {
                        User fromUser = userMap.get(msg.getFromUserId());
                        if (fromUser != null) {
                            msg.setFromUserNickname(fromUser.getNickname());
                            msg.setFromUserAvatar(fromUser.getHeadPath());
                        }
                    }
                });
            }
        }

        return Result.success(result);
    }

    @PutMapping("/{id}/read")
    public Result<String> markAsRead(@PathVariable Long id, @CurrentUserId Long userId) {
        sysMessageService.markAsRead(id, userId);
        return Result.success("已标记为已读");
    }

    @PutMapping("/read-all")
    public Result<String> markAllAsRead(@CurrentUserId Long userId) {
        sysMessageService.markAllAsRead(userId);
        return Result.success("全部已标记为已读");
    }

    @GetMapping("/unread-count")
    public Result<Integer> getUnreadCount(@CurrentUserId Long userId) {
        return Result.success(sysMessageService.getUnreadCount(userId));
    }
}
