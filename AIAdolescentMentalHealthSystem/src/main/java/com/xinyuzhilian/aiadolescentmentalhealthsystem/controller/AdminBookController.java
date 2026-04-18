package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.dto.BookDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo.BookAdminVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo.BookCommentVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IBookCommentService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IBookService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/book")
@RequiredArgsConstructor
// 与 LoginUser 权限一致：超级管理员为 ROLE_4（非 ROLE_ADMIN）
@PreAuthorize("hasRole('4')")
public class AdminBookController {

    private final IBookService bookService;
    private final IBookCommentService bookCommentService;
    private final IUserService userService;

    /**
     * 获取书籍管理列表（仅超级管理员）
     *
     * @param page    页码
     * @param size    每页大小
     * @param keyword 搜索关键词
     * @param status  状态筛选
     * @param userId  当前用户ID
     * @return 书籍分页结果
     */
    @GetMapping("/list")
    public Result<PageResult<BookAdminVO>> getAdminBookList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @CurrentUserId Long userId) {
        User user = userService.getById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "无权限访问");
        }
        return bookService.getAdminBookList(page, size, keyword, status);
    }

    /**
     * 获取书籍详情（编辑回显）
     *
     * @param id      书籍ID
     * @param userId  当前用户ID
     * @return 书籍详情
     */
    @GetMapping("/{id}")
    public Result<BookAdminVO> getAdminBookDetail(
            @PathVariable Long id,
            @CurrentUserId Long userId) {
        User user = userService.getById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "无权限访问");
        }
        return bookService.getAdminBookDetail(id);
    }

    /**
     * 新增书籍
     *
     * @param dto     书籍信息
     * @param userId  当前用户ID
     * @return 操作结果
     */
    @PostMapping
    public Result<String> saveBook(
            @RequestBody BookDTO dto,
            @CurrentUserId Long userId) {
        User user = userService.getById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "无权限访问");
        }
        return bookService.saveBook(dto);
    }

    /**
     * 修改书籍
     *
     * @param id      书籍ID
     * @param dto     书籍信息
     * @param userId  当前用户ID
     * @return 操作结果
     */
    @PutMapping("/{id}")
    public Result<String> updateBook(
            @PathVariable Long id,
            @RequestBody BookDTO dto,
            @CurrentUserId Long userId) {
        User user = userService.getById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "无权限访问");
        }
        dto.setId(id);
        return bookService.updateBook(dto);
    }

    /**
     * 删除书籍
     *
     * @param id      书籍ID
     * @param userId  当前用户ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public Result<String> deleteBook(
            @PathVariable Long id,
            @CurrentUserId Long userId) {
        User user = userService.getById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "无权限访问");
        }
        return bookService.deleteBook(id);
    }

    /**
     * 删除评论
     *
     * @param id      评论ID
     * @param userId  当前用户ID
     * @return 操作结果
     */
    @DeleteMapping("/comment/{id}")
    public Result<String> deleteComment(
            @PathVariable Long id,
            @CurrentUserId Long userId) {
        User user = userService.getById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "无权限访问");
        }
        return bookCommentService.deleteComment(id);
    }
}
