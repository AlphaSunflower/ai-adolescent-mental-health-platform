package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.dto.BookCommentDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo.BookCommentVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.baomidou.mybatisplus.extension.service.IService;

public interface IBookCommentService extends IService<com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.BookComment> {

    Result<String> addComment(BookCommentDTO dto, Long userId);

    Result<PageResult<BookCommentVO>> getCommentList(Long bookId, Integer page, Integer size);

    Result<String> deleteComment(Long id);
}
