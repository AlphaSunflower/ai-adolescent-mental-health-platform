package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.utils.OSSUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/common")
@RequiredArgsConstructor
@Slf4j
public class CommonController {

    private final OSSUtil ossUtil;

    @PostMapping("/upload")
    public Result<String> upload(MultipartFile file, @RequestParam(defaultValue = "common") String folder) {
        log.info("Common upload request: {}, folder: {}", file.getOriginalFilename(), folder);
        try {
            String url = ossUtil.uploadFile(file, folder);
            return Result.success("上传成功", url);
        } catch (Exception e) {
            log.error("Upload controller error", e);
            return Result.error("上传失败: " + e.getMessage());
        }
    }
}
