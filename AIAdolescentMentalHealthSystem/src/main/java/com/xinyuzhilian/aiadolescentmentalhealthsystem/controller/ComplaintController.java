package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Complaint;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/complaint")
@RequiredArgsConstructor
public class ComplaintController {

    private final IComplaintService complaintService;

    @PostMapping("/submit")
    public Result<String> submitComplaint(@RequestBody Complaint complaint, @CurrentUserId Long userId) {
        return complaintService.submitComplaint(complaint, userId);
    }

    @PostMapping("/audit/{id}")
    public Result<String> auditComplaint(
            @PathVariable Long id,
            @RequestParam Integer status,
            @RequestParam(required = false) String auditRemark,
            @CurrentUserId Long adminUserId) {
        return complaintService.auditComplaint(id, status, auditRemark, adminUserId);
    }

    @GetMapping("/list")
    public Result<PageResult<Complaint>> getComplaints(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer role,
            @CurrentUserId Long userId) {
        return Result.success(complaintService.getComplaints(page, size, userId, role));
    }
}
