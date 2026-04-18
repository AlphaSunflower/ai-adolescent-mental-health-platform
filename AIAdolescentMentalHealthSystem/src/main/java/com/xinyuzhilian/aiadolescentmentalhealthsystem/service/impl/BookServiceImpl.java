package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.dto.BookDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo.BookAdminVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo.BookDetailVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo.BookVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Book;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.BookMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BookServiceImpl extends ServiceImpl<BookMapper, Book> implements IBookService {

    @Override
    public Result<PageResult<BookVO>> getBookList(Integer page, Integer size, String keyword) {
        Page<Book> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Book> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Book::getStatus, 1);
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Book::getTitle, keyword);
        }
        wrapper.orderByDesc(Book::getSortOrder).orderByDesc(Book::getCreateTime);
        Page<Book> result = this.page(pageParam, wrapper);

        PageResult<BookVO> pageResult = new PageResult<>();
        pageResult.setTotal(result.getTotal());
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setPages(result.getPages());

        pageResult.setRecords(result.getRecords().stream().map(book -> {
            BookVO vo = new BookVO();
            vo.setId(book.getId());
            vo.setTitle(book.getTitle());
            vo.setCoverUrl(book.getCoverUrl());
            vo.setDescription(book.getDescription());
            vo.setAddress(book.getAddress());
            vo.setViewCount(book.getViewCount());
            vo.setCommentCount(book.getCommentCount());
            return vo;
        }).toList());

        return Result.success(pageResult);
    }

    @Override
    public Result<BookDetailVO> getBookDetail(Long id) {
        Book book = this.getById(id);
        if (book == null) {
            return Result.error("书籍不存在");
        }

        BookDetailVO vo = new BookDetailVO();
        vo.setId(book.getId());
        vo.setTitle(book.getTitle());
        vo.setCoverUrl(book.getCoverUrl());
        vo.setDescription(book.getDescription());
        vo.setAddress(book.getAddress());
        vo.setViewCount(book.getViewCount());
        vo.setCommentCount(book.getCommentCount());
        vo.setCreateTime(book.getCreateTime());
        vo.setUpdateTime(book.getUpdateTime());

        return Result.success(vo);
    }

    @Override
    public Result<String> incrementViewCount(Long id) {
        Book book = this.getById(id);
        if (book == null) {
            return Result.error("书籍不存在");
        }
        baseMapper.incrementViewCount(id);
        return Result.success("浏览数更新成功");
    }

    @Override
    public Result<PageResult<BookAdminVO>> getAdminBookList(Integer page, Integer size, String keyword, Integer status) {
        Page<Book> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Book> wrapper = new LambdaQueryWrapper<>();

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Book::getTitle, keyword);
        }
        if (status != null) {
            wrapper.eq(Book::getStatus, status);
        }
        wrapper.orderByDesc(Book::getSortOrder).orderByDesc(Book::getCreateTime);
        Page<Book> result = this.page(pageParam, wrapper);

        PageResult<BookAdminVO> pageResult = new PageResult<>();
        pageResult.setTotal(result.getTotal());
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setPages(result.getPages());

        pageResult.setRecords(result.getRecords().stream().map(book -> {
            BookAdminVO vo = new BookAdminVO();
            vo.setId(book.getId());
            vo.setTitle(book.getTitle());
            vo.setCoverUrl(book.getCoverUrl());
            vo.setDescription(book.getDescription());
            vo.setAddress(book.getAddress());
            vo.setViewCount(book.getViewCount());
            vo.setCommentCount(book.getCommentCount());
            vo.setSortOrder(book.getSortOrder());
            vo.setStatus(book.getStatus());
            vo.setCreateTime(book.getCreateTime());
            vo.setUpdateTime(book.getUpdateTime());
            return vo;
        }).toList());

        return Result.success(pageResult);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> saveBook(BookDTO dto) {
        Book book = new Book();
        book.setTitle(dto.getTitle());
        book.setCoverUrl(dto.getCoverUrl());
        book.setDescription(dto.getDescription());
        book.setAddress(dto.getAddress());
        book.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        book.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        book.setViewCount(0);
        book.setCommentCount(0);
        book.setCreateTime(LocalDateTime.now());
        book.setUpdateTime(LocalDateTime.now());
        book.setDeleted(false);
        this.save(book);
        return Result.success("新增成功");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> updateBook(BookDTO dto) {
        if (dto.getId() == null) {
            return Result.error("书籍ID不能为空");
        }
        Book book = this.getById(dto.getId());
        if (book == null) {
            return Result.error("书籍不存在");
        }
        book.setTitle(dto.getTitle());
        book.setCoverUrl(dto.getCoverUrl());
        book.setDescription(dto.getDescription());
        book.setAddress(dto.getAddress());
        if (dto.getSortOrder() != null) {
            book.setSortOrder(dto.getSortOrder());
        }
        if (dto.getStatus() != null) {
            book.setStatus(dto.getStatus());
        }
        book.setUpdateTime(LocalDateTime.now());
        this.updateById(book);
        return Result.success("修改成功");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> deleteBook(Long id) {
        Book book = this.getById(id);
        if (book == null) {
            return Result.error("书籍不存在");
        }
        book.setDeleted(true);
        this.updateById(book);
        return Result.success("删除成功");
    }

    @Override
    public Result<BookAdminVO> getAdminBookDetail(Long id) {
        Book book = this.getById(id);
        if (book == null) {
            return Result.error("书籍不存在");
        }

        BookAdminVO vo = new BookAdminVO();
        vo.setId(book.getId());
        vo.setTitle(book.getTitle());
        vo.setCoverUrl(book.getCoverUrl());
        vo.setDescription(book.getDescription());
        vo.setAddress(book.getAddress());
        vo.setViewCount(book.getViewCount());
        vo.setCommentCount(book.getCommentCount());
        vo.setSortOrder(book.getSortOrder());
        vo.setStatus(book.getStatus());
        vo.setCreateTime(book.getCreateTime());
        vo.setUpdateTime(book.getUpdateTime());

        return Result.success(vo);
    }
}
