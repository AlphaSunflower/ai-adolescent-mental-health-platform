# AGENT.md — `apps/backend`

> 面向 AI 编码助手的后端工作区速查。动手前请同时参阅根 [AGENT.md](../../AGENT.md)。
>
> **文档自更新**：当本工作区的脚本 / 依赖 / 业务域 / 约定发生变化，或你从用户对话中沉淀到新约束时，**可直接更新本文件或根 README / AGENT**。就近修改、先事实后文档、保持锚点准确。详见根 [AGENT.md](../../AGENT.md) 第「五、文档自更新」节。

## 一、工作区基本事实

- 包名：`@ai-adolescent-mental-health/backend`
- 技术栈：Spring Boot 3.5.9、Java 17、Maven Wrapper、MyBatis-Plus、Sa-Token、Redis、RabbitMQ、WebSocket
- 入口类：`com.xinyuzhilian.aiadolescentmentalhealthsystem.AiAdolescentMentalHealthSystemApplication`
- 默认端口：`8080`（见 `application.yml` 的 `server.port`）
- 激活 profile：默认 `test`（见 `spring.profiles.active`）

## 二、包结构（按业务域划分）

```
com.xinyuzhilian.aiadolescentmentalhealthsystem
├── book           # 心理读物、评论、评分
├── consultation   # 真人心理咨询（预约、会话）
├── content        # 心理内容（文章/资讯）
├── hospital       # 医院目录
├── psychologist   # 心理咨询师资料、排班
├── user           # 用户账户、资料、权限
├── stats          # 数据统计与看板
├── search         # 全局搜索
└── xiaoai         # 「小艾」AI 问诊（接 DashScope）
```

新增功能时按业务域放入对应包，不要新建平行分层（如 `service2`、`util_v2`）。

## 三、命令

通过 monorepo 根目录执行：

```bash
pnpm dev:backend                                       # mvnw spring-boot:run
pnpm --filter @ai-adolescent-mental-health/backend build   # mvnw clean package -DskipTests
pnpm --filter @ai-adolescent-mental-health/backend test    # mvnw test
pnpm --filter @ai-adolescent-mental-health/backend clean
```

或直接在 `apps/backend/` 下使用 `./mvnw`（Windows 下 `mvnw.cmd`）。

## 四、配置与环境变量

- 主配置：`src/main/resources/application.yml`
- Profile：`application-dev.yml`、`application-test.yml`
- 所有敏感项通过环境变量注入；占位符形如 `REPLACE_ME_*` / `CHANGE_ME_*`，**请勿替换为真实值后提交**。
- 关键变量：`JWT_SECRET`、`DASHSCOPE_API_KEY`、`WX_APP_SECRET`、`WX_GZH_SECRET`、`MAIL_PASSWORD`、`oss.keyid` / `oss.keysecret` / `oss.bucketname` / `oss.endpoint`、`db.mysql.host|port|username|pw`、`db.redis.host`
- MySQL 库名固定为 `xinyuzhilian`；schema 变更需同步 `infra/sql/`。

## 五、AI 约束

1. **禁止直接改生产 DDL**：对表结构的变更必须同步新增 / 修改 `infra/sql/` 下的脚本，并在 PR 说明迁移顺序。
2. **依赖版本对齐**：新增 Spring / Jackson / MyBatis 等框架级依赖时，优先使用 `spring-boot-starter-*` 以便由 BOM 管理版本；不要任意指定与 Spring Boot 3.5.9 不兼容的版本。
3. **日志与异常信息保留中文习惯**：现有日志多为中文描述，新增日志保持一致风格，便于线上排查。
4. **WebSocket 缓冲区**：`spring.websocket.max-*-message-buffer-size` 当前为 5MB，改动需评估对前端实时消息/语音的影响。
5. **认证统一使用 Sa-Token**：不要引入 Spring Security 等平行鉴权框架。
6. **AI 对话走 DashScope 封装**：`xiaoai` 域内已封装 DashScope 调用，新增 AI 能力应在此域扩展，不要在其他域直连外部 LLM。
7. **外部 HTTP 调用**：使用项目既有的客户端封装（如微信 OAuth、OSS SDK），不要引入新 HTTP 客户端。

## 六、本地运行最低依赖

- MySQL 8+，库 `xinyuzhilian`，已导入 `infra/sql/` 下脚本
- Redis 6+ 运行于 `localhost:6379`
- 如触及消息业务：RabbitMQ 运行于 `localhost:5672`（`guest:guest`）

## 七、测试约束

- 测试走 `mvnw test`；不要引入 mock 替代真实数据库除非已有模式允许。
- 新增集成测试保持与既有包结构对齐，测试资源放 `src/test/resources/`。
