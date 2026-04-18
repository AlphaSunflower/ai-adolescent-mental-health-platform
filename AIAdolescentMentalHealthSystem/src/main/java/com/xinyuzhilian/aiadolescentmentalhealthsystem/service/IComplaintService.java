package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Complaint;

public interface IComplaintService {
    Result<String> submitComplaint(Complaint complaint, Long userId);
    Result<String> auditComplaint(Long complaintId, Integer status, String auditRemark, Long adminUserId);
    PageResult<Complaint> getComplaints(Integer page, Integer size, Long userId, Integer role);
}
