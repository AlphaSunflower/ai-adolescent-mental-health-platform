package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * 心理咨询师案例报告请求DTO
 */
@Data
@ApiModel(value = "PsychologistReportRequest对象", description = "心理咨询师案例报告请求")
public class PsychologistReportRequest {

    @ApiModelProperty(value = "专业资质材料附件URL列表")
    private List<String> qualificationUrls;

    @ApiModelProperty(value = "督导证明附件URL列表")
    private List<String> supervisionProofUrls;

    @ApiModelProperty(value = "个人体验证明附件URL列表")
    private List<String> experienceProofUrls;

    @ApiModelProperty(value = "其他相关证明附件URL列表")
    private List<String> otherProofUrls;

    @ApiModelProperty(value = "个人自我叙述")
    private String selfNarration;
}
