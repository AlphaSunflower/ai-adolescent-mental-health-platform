package com.xinyuzhilian.aiadolescentmentalhealthsystem.exception;


import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ServiceException.class)
    public Result<Void> handleServiceException(ServiceException e) {
        log.error("业务异常", e);
        return Result.error(e.getCode(), e.getMessage());
    }


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        log.error("参数校验异常: {}", message);
        return Result.error(400, message);
    }

    @ExceptionHandler(BindException.class)
    public Result<Void> handleBindException(BindException e) {
        String message = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        log.error("参数绑定异常: {}", message);
        return Result.error(400, message);
    }
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public Result<Void> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e) {
        log.error("文件上传异常: {}", e.getMessage());
        return Result.error(400, "文件上传异常,文件不能超过3MB");
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleAllException(Exception e) {
        log.error("兜底异常捕获, message: {}, type: {}", e.getMessage(), e.getClass().getName(), e);
        return Result.error(500, "服务器内部错误: " + e.getMessage());
    }
} 
