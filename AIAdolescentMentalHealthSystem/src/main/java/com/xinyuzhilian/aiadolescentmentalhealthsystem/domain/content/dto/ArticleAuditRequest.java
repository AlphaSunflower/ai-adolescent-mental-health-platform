package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto;

import lombok.Data;

@Data
public class ArticleAuditRequest {
    private Integer action;
    private String reason;
}
