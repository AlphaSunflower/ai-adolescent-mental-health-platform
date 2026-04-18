package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.hospital.vo;
import lombok.Data;
import java.math.BigDecimal;
@Data
public class AvailableDoctorVO {
    private Long id;
    private String realName;
    private String title;
    private String specialty;
    private BigDecimal consultationPrice;
    private String headPath;
    private BigDecimal ratingScore;
    private String hospitalName;
}