package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 邮箱验证码表
 * 用于存储邮箱验证码及其关联的微信 OpenID
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("email_verify_code")
@ApiModel(value = "EmailVerifyCode", description = "邮箱验证码表")
@AllArgsConstructor
@NoArgsConstructor
public class EmailVerifyCode implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "主键递增")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "邮箱地址")
    @TableField("email")
    private String email;

    @ApiModelProperty(value = "6位验证码")
    @TableField("code")
    private String code;

    @ApiModelProperty(value = "场景: bind_email-绑定邮箱, change_email-更换邮箱")
    @TableField("scene")
    private String scene;

    @ApiModelProperty(value = "发起验证时的微信OpenID")
    @TableField("openid")
    private String openid;

    @ApiModelProperty(value = "openid类型: mini-小程序, gzh-公众号")
    @TableField("openid_type")
    private String openidType;

    @ApiModelProperty(value = "过期时间")
    @TableField("expire_time")
    private LocalDateTime expireTime;

    @ApiModelProperty(value = "是否已使用(0-否,1-是)")
    @TableField("used")
    private Integer used;

    @ApiModelProperty(value = "创建时间")
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
