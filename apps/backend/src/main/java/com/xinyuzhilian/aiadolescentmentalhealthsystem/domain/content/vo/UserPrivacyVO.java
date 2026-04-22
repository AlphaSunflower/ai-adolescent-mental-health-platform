package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo;

import lombok.Data;

@Data
public class UserPrivacyVO {
    private Boolean allowViewLikes;
    private Boolean allowViewArticles;
    private Boolean allowViewCollections;
    private Boolean allowViewFollowings;
    private Boolean allowViewFans;
}
