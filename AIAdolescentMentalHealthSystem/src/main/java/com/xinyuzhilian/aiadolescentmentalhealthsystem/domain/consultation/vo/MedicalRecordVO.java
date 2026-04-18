package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.vo;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MedicalRecordVO {
    private Long id;
    private Long patientContactId;
    private Long appointmentId;
    private String symptoms;
    private LocalDate visitDate;
    private String department;
    private String hospital;
    private String remarks;
    private LocalDateTime createTime;
    private List<String> images;
}
