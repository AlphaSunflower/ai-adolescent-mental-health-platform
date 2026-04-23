package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.hospital.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DoctorDTO {
    private Long id;
    private String username;
    private String password;
    private String nickname;
    private String phone;
    private Integer sex;
    private String realName;
    private String title;
    private String specialty;
    private String introduction;
    private BigDecimal consultationPrice;
    private Long departmentId;
    private Integer status;
    private Integer onlineConsultEnabled;
    private Integer offlineConsultEnabled;
}
