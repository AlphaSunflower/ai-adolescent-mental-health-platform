package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.vo;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
@Data
public class AppointmentVO {
    private Long id;
    private Long userId;
    private Long patientContactId;
    private String doctorName;
    private String hospitalName;
    private String patientName;
    private String patientPhone;
    private LocalDate workDate;
    private Integer workShift;
    private Integer status;
    private LocalDateTime createTime;
    private String description;
    private BigDecimal fee;
    private Integer payStatus;
    private Integer type;
}