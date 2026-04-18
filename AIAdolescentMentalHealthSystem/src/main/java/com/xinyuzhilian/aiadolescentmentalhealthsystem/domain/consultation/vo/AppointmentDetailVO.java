package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.vo;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;
@Data
@EqualsAndHashCode(callSuper = true)
public class AppointmentDetailVO extends AppointmentVO {
    private String doctorTitle;
    private String hospitalAddress;
    private String feedbackContent;
    private Integer feedbackRating;
    private String feedbackReply;
    private LocalDateTime payTime;
    private MedicalRecordVO medicalRecord;
}