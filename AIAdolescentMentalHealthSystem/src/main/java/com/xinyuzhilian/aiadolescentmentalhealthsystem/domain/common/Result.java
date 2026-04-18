package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common;

import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class Result<T> {
    private Integer code;
    private String message;
    private T data;

    public static <T> Result<T> success() {
        return new Result<T>().setCode(200).setMessage("操作成功");
    }

    public static <T> Result<T> success(T data) {
        return new Result<T>().setCode(200).setMessage("操作成功").setData(data);
    }
    public static <T> Result<T> success(String message ,T data) {
        return new Result<T>().setCode(200).setMessage(message).setData(data);
    }
    public static <T> Result<PageResult<T>> success(IPage<T> page) {
        return success(PageResult.build(page));
    }

    public static <T> Result<T> error(String message) {
        return new Result<T>().setCode(500).setMessage(message);
    }

    public static <T> Result<T> error(Integer code, String message) {
        return new Result<T>().setCode(code).setMessage(message);
    }
}
