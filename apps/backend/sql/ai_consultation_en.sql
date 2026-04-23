
create table if not exists ai_session
(
    id          bigint auto_increment primary key,
    user_id     bigint                             not null,
    title       varchar(255)                       null,
    create_time datetime default CURRENT_TIMESTAMP null,
    update_time datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
);

create index idx_user_id on ai_session (user_id);

create table if not exists ai_message
(
    id          bigint auto_increment primary key,
    session_id  bigint                             not null,
    role        varchar(20)                        not null,
    content     text                               not null,
    create_time datetime default CURRENT_TIMESTAMP null
);

create index idx_session_id on ai_message (session_id);
