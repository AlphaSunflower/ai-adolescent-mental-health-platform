package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 心理咨询师入驻审核请求DTO
 */
@Data
@ApiModel(value = "PsychologistReviewRequest对象", description = "心理咨询师入驻审核请求")
public class PsychologistReviewRequest {

    @ApiModelProperty(value = "审核结果(true-通过,false-不通过)")
    private Boolean approved;

    @ApiModelProperty(value = "拒绝/失败原因")
    private String reason;
}
