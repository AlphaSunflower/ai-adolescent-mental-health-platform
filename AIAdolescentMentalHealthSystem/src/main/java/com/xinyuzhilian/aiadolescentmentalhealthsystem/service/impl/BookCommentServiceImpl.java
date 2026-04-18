package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.dto.BookCommentDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo.BookCommentVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Book;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.BookComment;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.BookCommentMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.BookMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IBookCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookCommentServiceImpl extends ServiceImpl<BookCommentMapper, BookComment> implements IBookCommentService {

    private final BookMapper bookMapper;
    private final UserMapper userMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> addComment(BookCommentDTO dto, Long userId) {
        if (userId == null) {
            return Result.error("请先登录后再发表评论");
        }

        Book book = bookMapper.selectById(dto.getBookId());
        if (book == null) {
            return Result.error("书籍不存在");
        }

        BookComment comment = new BookComment();
        comment.setBookId(dto.getBookId());
        comment.setUserId(userId);
        comment.setContent(dto.getContent());
        comment.setCreateTime(LocalDateTime.now());
        comment.setDeleted(false);
        this.save(comment);

        bookMapper.updateCommentCount(dto.getBookId(), 1);

        return Result.success("评论成功");
    }

    @Override
    public Result<PageResult<BookCommentVO>> getCommentList(Long bookId, Integer page, Integer size) {
        Page<BookComment> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<BookComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BookComment::getBookId, bookId);
        wrapper.orderByDesc(BookComment::getCreateTime);
        Page<BookComment> result = this.page(pageParam, wrapper);

        List<Long> userIds = result.getRecords().stream()
                .map(BookComment::getUserId)
                .toList();

        // 避免空集合导致 "WHERE id IN ( )" SQL 语法错误
        List<User> users = userIds.isEmpty()
                ? java.util.Collections.emptyList()
                : userMapper.selectBatchIds(userIds);
        var userMap = users.stream().collect(java.util.stream.Collectors.toMap(User::getId, u -> u));

        PageResult<BookCommentVO> pageResult = new PageResult<>();
        pageResult.setTotal(result.getTotal());
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setPages(result.getPages());

        pageResult.setRecords(result.getRecords().stream().map(comment -> {
            BookCommentVO vo = new BookCommentVO();
            vo.setId(comment.getId());
            vo.setBookId(comment.getBookId());
            vo.setUserId(comment.getUserId());
            vo.setContent(comment.getContent());
            vo.setCreateTime(comment.getCreateTime());

            User user = userMap.get(comment.getUserId());
            if (user != null) {
                vo.setUserNickname(user.getNickname());
                vo.setUserAvatar(user.getHeadPath());
            }
            return vo;
        }).toList());

        return Result.success(pageResult);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> deleteComment(Long id) {
        BookComment comment = this.getById(id);
        if (comment == null) {
            return Result.error("评论不存在");
        }

        comment.setDeleted(true);
        this.updateById(comment);

        bookMapper.updateCommentCount(comment.getBookId(), -1);

        return Result.success("删除成功");
    }
}
