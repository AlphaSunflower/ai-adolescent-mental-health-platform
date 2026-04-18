package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.dto.BookCommentDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo.BookCommentVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo.BookDetailVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo.BookVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IBookCommentService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/book")
@RequiredArgsConstructor
public class BookController {

    private final IBookService bookService;
    private final IBookCommentService bookCommentService;

    /**
     * 获取书籍列表（用户端）
     *
     * @param page    页码
     * @param size    每页大小
     * @param keyword 搜索关键词
     * @return 书籍分页结果
     */
    @GetMapping("/list")
    public Result<PageResult<BookVO>> getBookList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        return bookService.getBookList(page, size, keyword);
    }

    /**
     * 获取书籍详情
     *
     * @param id 书籍ID
     * @return 书籍详情
     */
    @GetMapping("/{id}")
    public Result<BookDetailVO> getBookDetail(@PathVariable Long id) {
        return bookService.getBookDetail(id);
    }

    /**
     * 增加浏览数（跳转时调用）
     *
     * @param id 书籍ID
     * @return 操作结果
     */
    @PostMapping("/{id}/view")
    public Result<String> incrementViewCount(@PathVariable Long id) {
        return bookService.incrementViewCount(id);
    }

    /**
     * 发表评论
     *
     * @param dto     评论内容
     * @param userId  当前用户ID
     * @return 操作结果
     */
    @PostMapping("/comment")
    public Result<String> addComment(@RequestBody BookCommentDTO dto, @CurrentUserId Long userId) {
        return bookCommentService.addComment(dto, userId);
    }

    /**
     * 获取书籍评论列表
     *
     * @param bookId 书籍ID
     * @param page   页码
     * @param size   每页大小
     * @return 评论分页结果
     */
    @GetMapping("/{bookId}/comment/list")
    public Result<PageResult<BookCommentVO>> getCommentList(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        return bookCommentService.getCommentList(bookId, page, size);
    }
}
