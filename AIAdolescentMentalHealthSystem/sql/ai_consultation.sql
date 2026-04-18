
create table if not exists ai_session
(
    id          bigint auto_increment comment '主键ID'
        primary key,
    user_id     bigint                             not null comment '用户ID',
    title       varchar(255)                       null comment '会话标题',
    create_time datetime default CURRENT_TIMESTAMP null,
    update_time datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
)
    comment 'AI咨询会话表';

create index idx_user_id
    on ai_session (user_id);

create table if not exists ai_message
(
    id          bigint auto_increment comment '主键ID'
        primary key,
    session_id  bigint                             not null comment '会话ID',
    role        varchar(20)                        not null comment '角色(user, assistant, system)',
    content     text                               not null comment '消息内容',
    create_time datetime default CURRENT_TIMESTAMP null
)
    comment 'AI咨询消息表';

create index idx_session_id
    on ai_message (session_id);
