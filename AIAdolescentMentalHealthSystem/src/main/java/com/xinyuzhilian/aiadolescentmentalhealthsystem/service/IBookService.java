package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.dto.BookCommentDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.dto.BookDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo.BookAdminVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo.BookCommentVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo.BookDetailVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo.BookVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.baomidou.mybatisplus.extension.service.IService;

public interface IBookService extends IService<com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Book> {

    Result<PageResult<BookVO>> getBookList(Integer page, Integer size, String keyword);

    Result<BookDetailVO> getBookDetail(Long id);

    Result<String> incrementViewCount(Long id);

    Result<PageResult<BookAdminVO>> getAdminBookList(Integer page, Integer size, String keyword, Integer status);

    Result<String> saveBook(BookDTO dto);

    Result<String> updateBook(BookDTO dto);

    Result<String> deleteBook(Long id);

    Result<BookAdminVO> getAdminBookDetail(Long id);
}
