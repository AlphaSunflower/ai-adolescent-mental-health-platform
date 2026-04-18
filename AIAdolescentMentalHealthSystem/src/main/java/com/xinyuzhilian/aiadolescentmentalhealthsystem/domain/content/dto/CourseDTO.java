package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto;

import lombok.Data;
import java.util.List;

@Data
public class CourseDTO {
    private Long id;
    private String title;
    private String description;
    private String type; // VIDEO, AUDIO
    private Integer status;
    
    // Source
    private String sourceType; // third_party, self_hosted
    private String sourceName; // For third_party
    private String sourceUrl; // URL
    private String storageProvider; // For self_hosted
    
    // Cover
    private String coverType; // third_party, self_hosted
    private String coverUrl; // For third_party or legacy
    // For self_hosted uploads, we might receive them as separate URLs after upload or base64? 
    // Requirement says "Upload to own storage... return public URL". 
    // So here we likely receive the URLs.
    private String coverUrlAvif;
    private String coverUrlWebp;
    private String coverUrlJpeg;

    // Compatibility
    private String mediaUrl;
}
