package com.xinyuzhilian.aiadolescentmentalhealthsystem.utils;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.exception.ServiceException;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URL;

public class ValidatorUtils {

    public static void validateUrl(String url) {
        if (url == null || url.isEmpty()) return;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            throw new ServiceException(422, "URL必须使用HTTP或HTTPS协议: " + url);
        }
        try {
            new URL(url);
        } catch (Exception e) {
            throw new ServiceException(422, "无效的URL: " + e.getMessage());
        }
    }

    public static void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) return;
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new ServiceException(400, "无效的图片文件");
            }
            int width = image.getWidth();
            int height = image.getHeight();
            
            // 最小512×288, 最大3840×2160
            if (width < 512 || height < 288) {
                throw new ServiceException(400, "图片分辨率过低，至少 512x288");
            }
            if (width > 3840 || height > 2160) {
                throw new ServiceException(400, "图片分辨率过高，最大 3840x2160");
            }
        } catch (IOException e) {
            throw new ServiceException(400, "读取图片失败");
        }
    }
}