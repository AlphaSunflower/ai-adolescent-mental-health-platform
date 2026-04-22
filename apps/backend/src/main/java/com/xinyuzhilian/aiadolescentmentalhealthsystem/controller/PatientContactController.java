package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PatientContact;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.PatientContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patient")
@RequiredArgsConstructor
public class PatientContactController {

    private final PatientContactService patientContactService;

    @GetMapping("/list")
    public Result<List<PatientContact>> listMyPatients(@CurrentUserId Long userId) {
        return patientContactService.listMyPatients(userId);
    }

    @PostMapping("/add")
    public Result<String> addPatient(@RequestBody PatientContact patient, @CurrentUserId Long userId) {
        return patientContactService.addPatient(patient, userId);
    }

    @PutMapping("/update")
    public Result<String> updatePatient(@RequestBody PatientContact patient, @CurrentUserId Long userId) {
        return patientContactService.updatePatient(patient, userId);
    }

    @DeleteMapping("/{id}")
    public Result<String> deletePatient(@PathVariable Long id, @CurrentUserId Long userId) {
        return patientContactService.deletePatient(id, userId);
    }
}
