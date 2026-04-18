package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;

import java.util.HashMap;

/**
 * 微信公众号扫码登录服务接口
 */
public interface IWxGzhQrCodeService {

    /**
     * 生成微信扫码登录二维码
     *
     * @return 包含 sceneId（二维码ID）和 qrCodeImage（Base64二维码图片）
     */
    Result<HashMap<Object, Object>> generateQrCode();

    /**
     * 微信授权回调（由前端在页面加载时调用）
     * 前端在页面加载时从 URL 参数获取 code，调用此接口
     *
     * @param code  微信授权 code
     * @param state 二维码 scene_id
     * @return 登录结果（成功返回token，或需要邮箱验证）
     */
    Result<HashMap<Object, Object>> wxCallback(String code, String state);

    /**
     * 轮询查询扫码状态（前端每2-3秒调用一次）
     *
     * @param sceneId 二维码 scene_id
     * @return status: waiting-等待扫码, success-已授权(含openid), expired-已过期
     */
    Result<HashMap<Object, Object>> pollScanStatus(String sceneId);

    /**
     * 获取二维码刷新用的新 scene_id
     * 当二维码过期或用户想刷新时调用
     *
     * @return 新的 sceneId 和 qrCodeImage
     */
    Result<HashMap<Object, Object>> refreshQrCode();
}
