package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.dto;

import lombok.Data;
import java.util.List;

@Data
public class AppointmentCompletionRequest {
    private Long id; // Appointment ID
    private String symptoms;
    private String department;
    private String hospital;
    private String remarks;
    private List<String> images;
}
