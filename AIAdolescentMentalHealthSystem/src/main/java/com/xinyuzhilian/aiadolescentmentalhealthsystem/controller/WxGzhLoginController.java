package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IWxGzhQrCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

/**
 * 微信公众号扫码登录 Controller
 *
 * ============================================================
 * 已临时禁用 — 原因：微信 OAuth2 回调要求公网 HTTPS 域名，当前无域名/SSL 证书
 *
 * 启用步骤（获取域名/SSL 后）：
 *   1. 在 application.yml 中配置 wx-gzh.callback-base-url
 *   2. 取消下方所有代码的注释
 *   3. 微信公众平台后台设置"网页授权域名"
 * ============================================================
 */
// @RestController
// @RequestMapping
// @RequiredArgsConstructor
// public class WxGzhLoginController {
//
//     private final IWxGzhQrCodeService wxGzhQrCodeService;
//
//     /**
//      * 生成微信扫码登录二维码
//      *
//      * 返回：
//      *   - sceneId: 二维码唯一ID（前端用于轮询）
//      *   - qrCodeImage: Base64 PNG 二维码图片
//      *   - expireSeconds: 过期时间（秒）
//      */
//     @GetMapping("/user/login/wx/gzh/qrcode")
//     public Result<HashMap<Object, Object>> generateQrCode() {
//         return wxGzhQrCodeService.generateQrCode();
//     }
//
//     /**
//      * 轮询查询扫码状态
//      * 前端每 2-3 秒调用一次
//      *
//      * 返回 status:
//      *   - waiting: 等待扫码
//      *   - success: 已授权（可获取 openid）
//      *   - expired: 已过期
//      */
//     @GetMapping("/user/login/wx/gzh/status")
//     public Result<HashMap<Object, Object>> pollScanStatus(@RequestParam String sceneId) {
//         return wxGzhQrCodeService.pollScanStatus(sceneId);
//     }
//
//     /**
//      * 刷新二维码（获取新的 sceneId 和二维码图片）
//      */
//     @GetMapping("/user/login/wx/gzh/refresh")
//     public Result<HashMap<Object, Object>> refreshQrCode() {
//         return wxGzhQrCodeService.refreshQrCode();
//     }
//
//     /**
//      * 微信授权回调
//      * 供前端在页面加载时调用
//      * 前端从 URL 参数获取 code 和 state（sceneId），然后调用此接口
//      *
//      * 返回登录结果：
//      *   - 成功：{ token, userInfo }
//      *   - 需要邮箱验证：{ needEmailVerify: true, openid, openidType: 'gzh' }
//      */
//     @GetMapping("/user/wx/gzh/callback")
//     public Result<HashMap<Object, Object>> wxCallback(
//             @RequestParam(required = false) String code,
//             @RequestParam(required = false) String state) {
//         return wxGzhQrCodeService.wxCallback(code, state);
//     }
// }
