-- 就诊人信息表
create table if not exists xinyuzhilian.patient_contact
(
    id           bigint auto_increment primary key,
    user_id      bigint                                   not null comment '所属用户ID',
    name         varchar(50)                              not null comment '姓名',
    birthday     date                                     not null comment '出生日期',
    sex          int            default 0                 null comment '性别(0-未知, 1-男, 2-女)',
    relationship varchar(50)                              not null comment '与用户关系',
    create_time  datetime       default CURRENT_TIMESTAMP null,
    update_time  datetime       default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    deleted      tinyint(1)     default 0                 null comment '逻辑删除'
) comment '就诊人信息表';

create index idx_user_id on xinyuzhilian.patient_contact (user_id);

-- 就诊病历表
create table if not exists xinyuzhilian.medical_record
(
    id                 bigint auto_increment primary key,
    patient_contact_id bigint                                   not null comment '就诊人ID',
    appointment_id     bigint                                   null comment '关联预约ID',
    symptoms           text                                     not null comment '病症',
    visit_date         date                                     not null comment '就诊日期',
    department         varchar(100)                             not null comment '就诊科室',
    hospital           varchar(255)                             null comment '就诊医院',
    remarks            text                                     null comment '备注',
    create_time        datetime       default CURRENT_TIMESTAMP null,
    update_time        datetime       default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    deleted            tinyint(1)     default 0                 null comment '逻辑删除'
) comment '就诊病历表';

create index idx_patient_contact_id on xinyuzhilian.medical_record (patient_contact_id);
create index idx_appointment_id on xinyuzhilian.medical_record (appointment_id);

-- 病历图片表
create table if not exists xinyuzhilian.medical_record_image
(
    id          bigint auto_increment primary key,
    record_id   bigint                                   not null comment '病历ID',
    image_url   varchar(500)                             not null comment '图片URL',
    create_time datetime       default CURRENT_TIMESTAMP null
) comment '病历图片表';

create index idx_record_id on xinyuzhilian.medical_record_image (record_id);

-- 修改预约表，增加就诊人ID
alter table xinyuzhilian.appointment add column patient_contact_id bigint null comment '就诊人ID' after user_id;
