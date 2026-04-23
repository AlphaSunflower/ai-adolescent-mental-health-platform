package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import cn.hutool.http.HttpUtil;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.config.RedisCache;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.config.WxGzhProperties;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ILoginService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IWxGzhQrCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 微信公众号扫码登录服务实现
 *
 * 流程：
 * 1. 前端调用 generateQrCode() → 获取 sceneId + 二维码图片（Base64）
 * 2. 二维码内容为授权 URL，用户用微信扫码
 * 3. 用户在微信中确认授权，微信回调后端接口，后端用 code 换取 openid 存入 Redis
 * 4. 前端轮询 pollScanStatus() → 发现 openid 已写入
 * 5. 前端调用 wxCallback() → 获取登录结果
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WxGzhQrCodeServiceImpl implements IWxGzhQrCodeService {

    private final WxGzhProperties wxGzhProperties;
    private final RedisCache redisCache;
    private final ILoginService loginService;

    /** Redis key 前缀 */
    private static final String QR_SCAN_KEY = "wx:gzh:qr:";

    /** 二维码有效期：5分钟 */
    private static final int QR_EXPIRE_MINUTES = 5;

    /** 轮询状态常量 */
    private static final String STATUS_WAITING = "waiting";      // 等待扫码
    private static final String STATUS_SCANED = "scaned";        // 已扫码待确认
    private static final String STATUS_SUCCESS = "success";      // 已授权
    private static final String STATUS_EXPIRED = "expired";      // 已过期

    // 授权回调路径（相对路径）
    private static final String CALLBACK_PATH = "/user/wx/gzh/callback";

    @Override
    public Result<HashMap<Object, Object>> generateQrCode() {
        // 1. 生成唯一 scene_id（二维码ID）
        String sceneId = UUID.randomUUID().toString().replace("-", "");

        // 2. 构建授权 URL
        // 授权后微信会回调 redirect_uri?code=XXX&state=sceneId
        String redirectUri = buildCallbackUrl(sceneId);
        String authUrl = buildAuthUrl(redirectUri, sceneId);

        // 3. 生成二维码图片（Base64 PNG）
        String qrCodeImage;
        try {
            qrCodeImage = generateQrCodeImage(authUrl, 280, 280);
        } catch (Exception e) {
            log.error("[WxGzhQrCode] 二维码生成失败: {}", e.getMessage());
            return Result.error("二维码生成失败");
        }

        // 4. 将 sceneId 和状态存入 Redis，5分钟过期
        HashMap<Object, Object> scanData = new HashMap<>();
        scanData.put("status", STATUS_WAITING);
        scanData.put("openid", null);
        scanData.put("loginResult", null);
        redisCache.setCacheObject(QR_SCAN_KEY + sceneId, scanData,
                QR_EXPIRE_MINUTES * 60, TimeUnit.SECONDS);

        // 5. 返回结果
        HashMap<Object, Object> result = new HashMap<>();
        result.put("sceneId", sceneId);
        result.put("qrCodeImage", qrCodeImage);
        result.put("expireSeconds", QR_EXPIRE_MINUTES * 60);

        log.info("[WxGzhQrCode] 二维码生成成功, sceneId: {}", sceneId);
        return Result.success(result);
    }


    /**
     * 微信授权回调
     * 当用户在微信中扫码并确认授权后，微信会回调此接口
     *
     * 流程：
     * 1. 用 code 换取 openid
     * 2. 根据 openid 查询用户（通过 wx_gzh_id 查找）
     * 3. 有账号 → 直接生成 Token，返回完整登录结果
     * 4. 无账号 → 返回 needEmailVerify: true，前端引导邮箱验证
     */
    @Override
    public Result<HashMap<Object, Object>> wxCallback(String code, String state) {
        if (code == null || code.isEmpty()) {
            return Result.error("授权码不能为空");
        }

        // 1. 用 code 换取 openid
        String openid = getGzhOpenid(code);
        if (openid == null) {
            log.warn("[WxGzhQrCode] 微信授权失败：无法获取 openid，code={}", code);
            return Result.error("微信授权失败，请重试");
        }

        // 2. 用 openid 直接调用登录服务
        //    loginWxGzh 内部会：查 wx_gzh_id → 有账号返回token，无账号返回 needEmailVerify
        Result<HashMap<Object, Object>> loginResult = loginService.loginWxGzh(code);

        // 3. 如果 sceneId 有效，将登录结果存入 Redis，供轮询获取
        if (state != null && !state.isEmpty()) {
            String key = QR_SCAN_KEY + state;
            HashMap<Object, Object> scanData = redisCache.getCacheObject(key);
            if (scanData != null) {
                scanData.put("status", STATUS_SUCCESS);
                scanData.put("loginResult", loginResult.getData());
                // 授权成功后延长缓存时间，方便前端轮询拿到结果
                redisCache.setCacheObject(key, scanData, 2 * 60, TimeUnit.SECONDS);
            }
        }

        return loginResult;
    }

    @Override
    public Result<HashMap<Object, Object>> pollScanStatus(String sceneId) {
        if (sceneId == null || sceneId.isEmpty()) {
            return Result.error("参数错误");
        }

        String key = QR_SCAN_KEY + sceneId;
        HashMap<Object, Object> scanData = redisCache.getCacheObject(key);

        if (scanData == null) {
            HashMap<Object, Object> result = new HashMap<>();
            result.put("status", STATUS_EXPIRED);
            return Result.success(result);
        }

        String status = (String) scanData.get("status");
        HashMap<Object, Object> result = new HashMap<>();
        result.put("status", status);
        result.put("sceneId", sceneId);

        if (STATUS_SUCCESS.equals(status)) {
            String openid = (String) scanData.get("openid");
            // 如果 Redis 中已有完整登录结果（token），直接返回
            @SuppressWarnings("unchecked")
            HashMap<Object, Object> loginResult = (HashMap<Object, Object>) scanData.get("loginResult");
            if (loginResult != null) {
                result.put("loginResult", loginResult);
            } else {
                result.put("openid", openid);
            }
        }

        return Result.success(result);
    }

    @Override
    public Result<HashMap<Object, Object>> refreshQrCode() {
        return generateQrCode();
    }

    /* ==================== 私有方法 ==================== */

    /**
     * 构建回调 URL（绝对路径，用于微信回调）
     * 生产环境需要公网 HTTPS 域名，这里暂时用相对路径，由前端配置 proxy
     */
    private String buildCallbackUrl(String sceneId) {
        // 微信回调时带上 sceneId 作为 state 参数
        // 格式：/user/wx/gzh/callback?state={sceneId}
        String baseUrl = wxGzhProperties.getCallbackBaseUrl();
        if (baseUrl != null && !baseUrl.isEmpty()) {
            return baseUrl + CALLBACK_PATH + "?state=" + sceneId;
        }
        return CALLBACK_PATH + "?state=" + sceneId;
    }

    /**
     * 构建微信 OAuth2 授权 URL
     */
    private String buildAuthUrl(String redirectUri, String sceneId) {
        // 编码回调地址
        String encodedUri;
        try {
            encodedUri = java.net.URLEncoder.encode(redirectUri, "UTF-8");
        } catch (Exception e) {
            encodedUri = redirectUri;
        }

        // scope=snsapi_login 表示网页应用授权，获取用户的 openid
        return "https://open.weixin.qq.com/connect/qrconnect"
                + "?appid=" + wxGzhProperties.getAppid()
                + "&redirect_uri=" + encodedUri
                + "&response_type=code"
                + "&scope=snsapi_login"
                + "&state=" + sceneId
                + "#wechat_redirect";
    }

    /**
     * 生成二维码图片（Base64 PNG）
     */
    private String generateQrCodeImage(String content, int width, int height) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 2);  // 白色边距

        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height, hints);
        BufferedImage image = MatrixToImageWriter.toBufferedImage(bitMatrix);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", baos);
        byte[] imageBytes = baos.toByteArray();

        return "data:image/png;base64," + Base64.getEncoder().encodeToString(imageBytes);
    }

    /**
     * 用 code 换取 openid（与 LoginServiceImpl 相同逻辑）
     */
    private String getGzhOpenid(String code) {
        String tokenUrl = "https://api.weixin.qq.com/sns/oauth2/access_token"
                + "?appid=" + wxGzhProperties.getAppid()
                + "&secret=" + wxGzhProperties.getSecret()
                + "&code=" + code
                + "&grant_type=authorization_code";
        String tokenRes = HttpUtil.get(tokenUrl);
        JSONObject json = JSON.parseObject(tokenRes);
        return json.getString("openid");
    }
}
