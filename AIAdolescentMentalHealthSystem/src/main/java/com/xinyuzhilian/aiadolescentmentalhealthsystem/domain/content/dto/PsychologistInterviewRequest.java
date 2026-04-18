package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 心理咨询师面谈安排请求DTO
 */
@Data
@ApiModel(value = "PsychologistInterviewRequest对象", description = "心理咨询师面谈安排请求")
public class PsychologistInterviewRequest {

    @ApiModelProperty(value = "面谈结果(true-通过,false-不通过)")
    private Boolean approved;

    @ApiModelProperty(value = "面谈时间")
    private LocalDateTime interviewTime;

    @ApiModelProperty(value = "面谈地点")
    private String interviewLocation;

    @ApiModelProperty(value = "拒绝/失败原因")
    private String reason;
}
