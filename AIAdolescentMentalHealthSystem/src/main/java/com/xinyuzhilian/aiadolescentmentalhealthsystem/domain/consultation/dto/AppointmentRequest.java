package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.dto;
import lombok.Data;
@Data
public class AppointmentRequest {
    private Long scheduleId;
    private Long patientContactId;
    private String description;
    private Integer type; // 0-offline, 1-online
}