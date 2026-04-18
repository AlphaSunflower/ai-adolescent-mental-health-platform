package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 心理咨询师基本资料请求DTO
 */
@Data
@ApiModel(value = "PsychologistBasicRequest对象", description = "心理咨询师基本资料请求")
public class PsychologistBasicRequest {

    @ApiModelProperty(value = "真实姓名")
    private String realName;

    @ApiModelProperty(value = "手机号")
    private String phone;

    @ApiModelProperty(value = "国家/地区")
    private String country;

    @ApiModelProperty(value = "微信/邮箱联系方式")
    private String contactWechat;

    @ApiModelProperty(value = "咨询个案时长(less_500/500_1000/1000_3000/more_3000)")
    private String caseHours;

    @ApiModelProperty(value = "个体督导时长(less_80/80_150/more_150)")
    private String supervisionHours;

    @ApiModelProperty(value = "咨询定价")
    private BigDecimal consultationPrice;

    @ApiModelProperty(value = "个人简历附件URL")
    private String resumeUrl;

    @ApiModelProperty(value = "学历及相关专业")
    private String education;
}
