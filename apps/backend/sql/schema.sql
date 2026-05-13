create table if not exists xinyuzhilian.ai_message
(
    id          bigint auto_increment
        primary key,
    session_id  bigint                             not null,
    role        varchar(20)                        not null,
    content     text                               not null,
    create_time datetime default CURRENT_TIMESTAMP null
);

create index id_session_id
    on xinyuzhilian.ai_message (session_id);

create index idx_session_id
    on xinyuzhilian.ai_message (session_id);

create table if not exists xinyuzhilian.ai_session
(
    id          bigint auto_increment
        primary key,
    user_id     bigint                             not null,
    title       varchar(255)                       null,
    create_time datetime default CURRENT_TIMESTAMP null,
    update_time datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
);

create index idx_user_id
    on xinyuzhilian.ai_session (user_id);

create table if not exists xinyuzhilian.appointment
(
    id                 bigint auto_increment
        primary key,
    user_id            bigint                                   not null comment '用户ID',
    patient_contact_id bigint                                   null comment '就诊人ID',
    doctor_id          bigint                                   not null comment '医生ID',
    schedule_id        bigint                                   not null comment '排班ID',
    status             int            default 0                 null comment '状态(0-待就诊, 1-已完成, 2-已取消, 3-爽约)',
    create_time        datetime       default CURRENT_TIMESTAMP null,
    description        varchar(1000)                            null comment '病情描述/病例表',
    fee                decimal(10, 2) default 0.00              null comment '挂号费',
    pay_status         int            default 0                 null comment '支付状态(0-未支付, 1-已支付, 2-已退款)',
    pay_time           datetime                                 null comment '支付时间',
    type               int            default 0                 null comment '0-offline, 1-online',
    is_rescheduled     int            default 0                 null comment '0-no, 1-yes'
)
    comment '预约记录表';

create table if not exists xinyuzhilian.article
(
    id               bigint auto_increment comment '主键ID'
        primary key,
    title            varchar(255)                          not null comment '文章标题',
    content          longtext                              null comment '文章内容(富文本)',
    cover_url        varchar(255)                          null comment '封面图URL',
    type             varchar(20) default 'SCIENCE'         null comment '类型(SCIENCE-科普, CASE-案例)',
    status           int         default 1                 null comment '状态(0-草稿, 1-已发布)',
    author_id        bigint                                null comment '作者ID',
    create_time      datetime    default CURRENT_TIMESTAMP null,
    update_time      datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    like_count       int         default 0                 null comment '点赞数',
    dislike_count    int         default 0                 null comment '踩数',
    collection_count int         default 0                 null comment '收藏数',
    comment_count    int         default 0                 null comment '评论数',
    view_count       int         default 0                 null comment '阅读数'
)
    comment '心理文章表';

create table if not exists xinyuzhilian.assessment_record
(
    id              bigint auto_increment comment '主键ID'
        primary key,
    user_id         bigint                             not null comment '用户ID',
    template_id     bigint                             not null comment '模板ID',
    answers_json    json                               not null comment '用户作答JSON',
    result_score    int      default 0                 null comment '总分',
    result_analysis text                               null comment '结果分析结论',
    create_time     datetime default CURRENT_TIMESTAMP null
)
    comment '测评记录表';

create table if not exists xinyuzhilian.assessment_template
(
    id                 bigint auto_increment comment '主键ID'
        primary key,
    title              varchar(100)                          not null comment '量表标题',
    description        text                                  null comment '量表描述',
    type               varchar(20) default 'TRADITIONAL'     null comment '类型(TRADITIONAL-传统, QUICK-快速, DYNAMIC-动态)',
    questions_json     json                                  not null comment '题目配置JSON',
    scoring_rules_json json                                  null comment '计分规则JSON',
    status             int         default 1                 null comment '状态(0-停用, 1-启用)',
    create_time        datetime    default CURRENT_TIMESTAMP null,
    is_public          int         default 1                 null comment '是否公开(0-仅医生可见, 1-公开)',
    cover_url          varchar(255)                          null comment '封面图'
)
    comment '测评量表模板表';

create table if not exists xinyuzhilian.consultation_feedback
(
    id             bigint auto_increment
        primary key,
    user_id        bigint                             not null comment '用户ID',
    doctor_id      bigint                             null comment '医生ID',
    hospital_id    bigint                             null comment '医院ID',
    appointment_id bigint                             null comment '关联预约ID',
    content        text                               not null comment '反馈内容',
    rating         int      default 5                 null comment '评分(1-5)',
    status         int      default 0                 null comment '状态: 0-已反馈, 1-已接收, 2-已拒收',
    reply_content  text                               null comment '回复内容(已接收时)',
    reject_reason  varchar(255)                       null comment '拒收理由',
    create_time    datetime default CURRENT_TIMESTAMP null,
    update_time    datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
)
    comment '咨询/挂号反馈表';

create index idx_doctor_id
    on xinyuzhilian.consultation_feedback (doctor_id);

create index idx_hospital_id
    on xinyuzhilian.consultation_feedback (hospital_id);

create index idx_user_id
    on xinyuzhilian.consultation_feedback (user_id);

create table if not exists xinyuzhilian.course
(
    id          bigint auto_increment comment '主键ID'
        primary key,
    title       varchar(255)                          not null comment '课程标题',
    description text                                  null comment '课程简介',
    media_url   varchar(255)                          not null comment '媒体资源URL(视频/音频)',
    cover_url   varchar(255)                          null comment '封面图URL',
    type        varchar(20) default 'VIDEO'           null comment '类型(VIDEO-视频, AUDIO-音频)',
    status      int         default 1                 null comment '状态(0-下架, 1-上架)',
    create_time datetime    default CURRENT_TIMESTAMP null,
    update_time datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
)
    comment '心理课程表';

create table if not exists xinyuzhilian.course_source
(
    id               bigint auto_increment
        primary key,
    course_id        bigint                             not null comment '课程ID',
    source_type      varchar(20)                        not null comment '来源类型(third_party, self_hosted)',
    source_name      varchar(50)                        null comment '第三方平台名称',
    source_url       varchar(500)                       not null comment '视频地址',
    storage_provider varchar(20)                        null comment '存储提供商(oss, local, cdn)',
    create_time      datetime default CURRENT_TIMESTAMP null
)
    comment '课程资源表';

create index idx_course_id
    on xinyuzhilian.course_source (course_id);

create table if not exists xinyuzhilian.cover_image
(
    id             bigint auto_increment
        primary key,
    course_id      bigint                             not null comment '课程ID',
    cover_type     varchar(20)                        not null comment '封面来源(third_party, self_hosted)',
    cover_url_avif varchar(500)                       null comment 'AVIF格式地址',
    cover_url_webp varchar(500)                       null comment 'WebP格式地址',
    cover_url_jpeg varchar(500)                       null comment 'JPEG格式地址',
    md5_hash       varchar(32)                        null comment 'MD5校验值',
    create_time    datetime default CURRENT_TIMESTAMP null
)
    comment '课程封面图表';

create index idx_course_id
    on xinyuzhilian.cover_image (course_id);

create table if not exists xinyuzhilian.department
(
    id          bigint auto_increment comment '主键ID'
        primary key,
    name        varchar(100)                       not null comment '科室名称',
    hospital_id bigint                             not null comment '所属医院ID',
    description varchar(500)                       null comment '科室介绍',
    status      int      default 1                 null comment '状态(0-停用, 1-启用)',
    create_time datetime default CURRENT_TIMESTAMP null,
    update_time datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
)
    comment '医院科室表';

create table if not exists xinyuzhilian.doctor_patient_relation
(
    id          bigint auto_increment
        primary key,
    doctor_id   bigint                                not null comment '医生用户ID',
    patient_id  bigint                                not null comment '患者用户ID',
    status      varchar(20) default 'NEW'             null comment '状态(NEW-新患者, ONGOING-进行中, STABLE-稳定, ARCHIVED-归档)',
    create_time datetime    default CURRENT_TIMESTAMP null,
    update_time datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint uk_doc_pat
        unique (doctor_id, patient_id)
)
    comment '医患关系表';

create table if not exists xinyuzhilian.doctor_profile
(
    user_id            bigint                                   not null comment '用户ID'
        primary key,
    hospital_id        bigint                                   not null comment '所属医院ID',
    department_id      bigint                                   null comment '所属科室ID',
    real_name          varchar(50)                              not null comment '真实姓名',
    title              varchar(50)                              null comment '职称',
    specialty          varchar(255)                             null comment '擅长领域',
    introduction       text                                     null comment '医生简介',
    consultation_price decimal(10, 2) default 0.00              null comment '咨询价格',
    schedule_config    json                                     null comment '排班配置JSON',
    create_time        datetime       default CURRENT_TIMESTAMP null
)
    comment '医生档案表';

create table if not exists xinyuzhilian.doctor_schedule
(
    id           bigint auto_increment comment '主键ID'
        primary key,
    doctor_id    bigint                             not null comment '医生ID',
    work_date    date                               not null comment '工作日期',
    work_shift   int                                not null comment '班次(1-上午, 2-下午, 3-晚班)',
    max_patients int      default 20                null comment '最大接诊数',
    booked_count int      default 0                 null comment '已预约数',
    status       int      default 1                 null comment '状态(0-停诊, 1-正常)',
    create_time  datetime default CURRENT_TIMESTAMP null,
    constraint uk_doc_date_shift
        unique (doctor_id, work_date, work_shift)
)
    comment '医生排班表';

create table if not exists xinyuzhilian.doctor_schedule_config
(
    id           bigint auto_increment
        primary key,
    doctor_id    bigint                             not null comment '医生ID',
    day_of_week  int                                not null comment '周几(1-7, 1=Monday)',
    work_shift   int                                not null comment '班次(1-上午, 2-下午, 3-晚班)',
    start_time   time                               null comment '开始时间',
    end_time     time                               null comment '结束时间',
    max_patients int      default 20                null comment '最大接诊数',
    status       int      default 1                 null comment '状态(0-停用, 1-启用)',
    create_time  datetime default CURRENT_TIMESTAMP null,
    update_time  datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint uk_doc_day_shift
        unique (doctor_id, day_of_week, work_shift)
)
    comment '医生周排班配置表';

create table if not exists xinyuzhilian.hospital
(
    id            bigint auto_increment comment '主键ID'
        primary key,
    name          varchar(100)                       not null comment '医院名称',
    code          varchar(50)                        not null comment '医院编码',
    admin_user_id bigint                             null comment '管理员用户ID',
    address       varchar(255)                       null comment '地址',
    contact_phone varchar(20)                        null comment '联系电话',
    introduction  text                               null comment '简介',
    picture       varchar(255)                       null comment '医院封面图',
    status        int      default 1                 null comment '状态(0-停用, 1-正常)',
    create_time   datetime default CURRENT_TIMESTAMP null,
    update_time   datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint uk_code
        unique (code)
)
    comment '医院信息表';

create table if not exists xinyuzhilian.inspirational_quote
(
    id          bigint auto_increment
        primary key,
    content     varchar(500)                       not null comment '语录内容',
    author      varchar(50)                        null comment '作者/出处',
    create_time datetime default CURRENT_TIMESTAMP null,
    update_time datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
)
    comment '每日正能量语录';

create table if not exists xinyuzhilian.patient_profile
(
    user_id           bigint                             not null comment '用户ID'
        primary key,
    emergency_contact varchar(50)                        null comment '紧急联系人',
    emergency_phone   varchar(20)                        null comment '紧急电话',
    medical_history   text                               null comment '既往病史',
    tags              json                               null comment '标签(抑郁倾向等)',
    create_time       datetime default CURRENT_TIMESTAMP null
)
    comment '患者档案表';

create table if not exists xinyuzhilian.platform_feedback
(
    id            bigint auto_increment
        primary key,
    user_id       bigint                             not null comment '用户ID',
    content       text                               not null comment '反馈内容',
    status        int      default 0                 null comment '状态: 0-已反馈, 1-待解决, 2-已解决, 3-已取消',
    cancel_reason varchar(255)                       null comment '取消理由',
    create_time   datetime default CURRENT_TIMESTAMP null,
    update_time   datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
)
    comment '平台反馈表';

create index idx_user_id
    on xinyuzhilian.platform_feedback (user_id);

create table if not exists xinyuzhilian.user
(
    id                 bigint auto_increment comment '主键ID'
        primary key,
    username           varchar(50)                          not null comment '用户名',
    password           varchar(100)                         not null comment '密码(加密)',
    role               int        default 0                 null comment '角色(0-游客, 1-用户, 2-医生, 3-医院管理员, 4-超级管理员)',
    nickname           varchar(50)                          null comment '昵称',
    phone              varchar(20)                          null comment '手机号',
    email              varchar(255)                         not null comment '邮箱（登录账号）',
    is_psychologist    tinyint    default 0                 null comment '是否为心理咨询师(0-否,1-是)',
    email_verified     tinyint(1) default 0                 null comment '邮箱是否已验证(0-否,1-是)',
    email_change_count int        default 0                 not null comment '当月邮箱修改次数',
    email_change_date  date                                 null comment '最近修改邮箱的日期',
    head_path          varchar(255)                         null comment '头像路径',
    signature          varchar(255)                         null comment '个性签名',
    sex                int        default 0                 null comment '性别(0-未知, 1-男, 2-女)',
    birthday           date                                 null comment '出生日期',
    status             int        default 1                 null comment '状态(0-禁用, 1-正常, 2-冻结)',
    deleted            tinyint(1) default 0                 null comment '逻辑删除(0-未删除, 1-已删除)',
    create_time        datetime   default CURRENT_TIMESTAMP null comment '创建时间',
    update_time        datetime   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    wx_id              varchar(64)                          null comment '微信OpenID',
    wx_gzh_id          varchar(64)                          null comment '微信公众号OpenID',
    member_type        tinyint(1) default 0                 null comment '会员类型(0-非会员,1-VIP,2-SVIP)',
    member_expire_date datetime                             null comment '会员过期时间',
    constraint uk_username
        unique (username),
    constraint uk_email
        unique (email),
    constraint uk_phone
        unique (phone),
    constraint uk_wx_id
        unique (wx_id)
)
    comment '用户信息表';

create table if not exists xinyuzhilian.user_course_progress
(
    id              bigint auto_increment
        primary key,
    user_id         bigint                             not null comment '用户ID',
    course_id       bigint                             not null comment '课程ID',
    progress        int      default 0                 null comment '观看进度(百分比0-100)',
    last_watch_time datetime default CURRENT_TIMESTAMP null comment '最近观看时间',
    constraint uk_user_course
        unique (user_id, course_id)
)
    comment '用户课程进度表';

